(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    const {
        exec,
    } = require('child_process');
    const http = require('http');
    const https = require('https');
    const AudioUrls = require('./audio-urls');
    const SuttaStore = require('./sutta-store');
    const SoundStore = require('./sound-store');
    const LOCAL = path.join(__dirname, '..', '..', 'local');
    const URL_RAW = 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac';
    const maxBuffer = 10 * 1024 * 1024; // for exec
    const SC_OPUS_STORE = AudioUrls.SC_OPUS_STORE;
    const VERSION = '3';
    
    class SCAudio {
        constructor(opts ={}) {
            this.language = opts.language || 'en';
            this.urlRaw = opts.urlRaw || URL_RAW;
            this.urlSegments = opts.urlSegments ||
                `https://${SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`;
            this.urlMap = opts.urlMap || 
                `https://${SC_OPUS_STORE}.sgp1.digitaloceanspaces.com`;
            this.author = opts.author || 'sujato';
            this.reader = opts.reader || 'sujato';
            this.extRaw = opts.extRaw || '.flac';
            this.extSeg = opts.extSeg || '.webm';
            this.convertTo = opts.convertTo || '.mp3';
            this.suttaStore = opts.suttaStore;
            this.soundStore = opts.soundStore;
            this.downloadDir = opts.downloadDir || path.join(LOCAL, 'sc-audio');
            if (!fs.existsSync(this.downloadDir)) {
                logger.info(`creating SCAudio download directory:${this.downloadDir}`);
                fs.mkdirSync(this.downloadDir);
            }
        }

        static get VERSION() { return VERSION; }
        static get SC_OPUS_STORE() { return SC_OPUS_STORE; }

        nikayaOf(suid) {
            return suid.replace(/[0-9].*/,'');
        }

        majorIdOf(suid) {
            return suid.replace(/\..*/,'');
        }

        aeneasMapUrl(suid, lang=this.language, author=this.author, reader=this.reader) {
            suid = suid.toLowerCase().replace(/\.0*/ug,'.');
            var nikaya = this.nikayaOf(suid);
            var major = this.majorIdOf(suid);
            return [
                this.urlMap,
                lang,
                nikaya,
                major,
                `${suid}-${lang}-${author}-${reader}.json`,
            ].join('/');
        }

        aeneasMap(suid, lang=this.language, author=this.author, reader=this.reader) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var catalog = await that.catalog();
                    suid = suid.toLowerCase().replace(/\.0*/ug,'.');
                    var entry = catalog.aeneasMaps[suid];
                    var entryLang = entry && entry[lang];
                    if (entryLang) {
                        var url = `${that.urlMap}/${entryLang}`;
                        logger.info(`ScAudio.aeneasMap cached:${url}`, entry);
                    } else {
                        var url = that.aeneasMapUrl(suid, lang, author, reader);
                        logger.info(`ScAudio.aeneasMap generated:${url}`, entry);
                    }
                    var httpx = url.startsWith('https') ? https : http;
                    var req = httpx.get(url, res => {
                        const { statusCode } = res;
                        const contentType = res.headers['content-type'];
                        let error;
                        if (statusCode !== 200) {
                            error = new Error(`GET ${url} => HTTP${statusCode}`);
                        } else if (/^application\/json/.test(contentType)) {
                            // OK
                        } else {
                            error = new Error(`Invalid content-type:${contentType}\n` +
                              `Expected application/json for url:${url}`);
                        }
                        if (error) {
                            res.resume(); // consume response data to free up memory
                            logger.warn(`url:${url}`);
                            logger.warn(error.stack);
                            reject(error);
                            return;
                        }

                        res.setEncoding('utf8');
                        let rawData = '';
                        res.on('data', (chunk) => { rawData += chunk; });
                        res.on('end', () => {
                            try {
                                var result = JSON.parse(rawData);
                                resolve(result);
                            } catch (e) {
                                logger.warn(e.stack);
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.warn(e.stack);
                        req.abort();
                    });
                } catch(e) {reject(e);} })();
            });
        }

        catalogOpts(opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var aeneasMaps = opts.aeneasMaps || {};
                    var result = {aeneasMaps, NextMarker: ''};
                    var marker = opts.marker;
                    var url = that.urlMap;
                    var query = '?max-keys=16000';
                    if (marker) {
                        query += query.length ? `&marker=${marker}` : `?marker=${marker}`
                    }
                    query && (url+=query);
                    var httpx = url.startsWith('https') ? https : http;
                    logger.info(`SCAudio catalog url:${url}`);
                    if (SC_OPUS_STORE !== 'sc-opus-store') {
                        url += `&prefix=json`;
                    }
                    var req = httpx.get(url, res => {
                        const { statusCode } = res;
                        const contentType = res.headers['content-type'];
                        let error;
                        if (statusCode !== 200) {
                            error = new Error('Request Failed.\n' +
                                              `Status Code: ${statusCode}`);
                        }
                        if (error) {
                            res.resume(); // consume response data to free up memory
                            logger.warn(error.stack);
                            reject(error);
                            return;
                        }

                        res.setEncoding('utf8');
                        let remainder = '';
                        res.on('data', chunk => { 
                            var chunkText = remainder + chunk.toString();
                            if (chunkText.match(/NextMarker/)) {
                                result.NextMarker = chunkText
                                    .replace(/.*<NextMarker>/,'')
                                    .replace(/<.NextMarker>.*/,'');
                            }
                            var chunkLines = chunkText.split('.json</Key>');
                            remainder = chunkLines[chunkLines.length-1];
                            chunkLines = chunkLines.slice(0, chunkLines.length-1);
                            chunkLines.forEach(line => {
                                if (line.match(/Key>/u)) {
                                    var key = line.replace(/.*Key>/u,'');
                                    var slashParts = key.split('/');
                                    var lang = slashParts[0];
                                    if (lang === 'json') { // sc-opus-store-v1-7
                                        var hyphenParts = key.split('-');
                                        var suid = hyphenParts[0]
                                            .replace(/^json./, '')
                                            .replace(/\.0*/ug,'.');
                                        lang = hyphenParts[1];
                                        aeneasMaps[suid] = aeneasMaps[suid] || {};
                                        var altKey = aeneasMaps[suid][lang];
                                        if (altKey == null) {
                                            aeneasMaps[suid][lang] = `${key}.json`;
                                        }
                                    }
                                }
                            });
                        });
                        res.on('end', () => {
                            try {
                                resolve(result);
                            } catch (e) {
                                logger.warn(e.stack);
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.warn(e.stack);
                        req.abort();
                    });
                } catch(e) {reject(e);} })();
            });
        }

        catalog() {
            var that = this;
            if (!!that._catalog) {
                return that._catalog;
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var aeneasMaps = {};
                    var result = {
                        aeneasMaps,
                        queries: 0,
                    };
                    var marker = '';
                    do {
                        var resPartial = await that.catalogOpts({
                            marker,
                            aeneasMaps,
                        });
                        result.queries++;
                        marker = resPartial.NextMarker;
                    } while (marker);
                    that._catalog = result;
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

        rawUrl(suid, lang=this.language, author=this.reader, reader=this.reader) {
            suid = suid.toLowerCase();
            var nikaya = this.nikayaOf(suid);
            var major = this.majorIdOf(suid);
            var extRaw = this.extRaw;
            return [
                this.urlRaw,
                lang,
                nikaya,
                major,
                `${suid}-${lang}-${author}-${reader}${extRaw}`,
            ].join('/');
        }

        segmentUrl(suidsegid, lang=this.language, author=this.author, reader=this.reader) {
            var segIdParts = suidsegid.toLowerCase().split(':');
            var suid = segIdParts[0].replace(/\.00*/gu,'.');
            var segId = segIdParts[1];
            var nikaya = this.nikayaOf(suid);
            var major = this.majorIdOf(suid);
            var extSeg = this.extSeg;
            return [
                this.urlSegments,
                lang,
                nikaya,
                major,
                suid,
                `${suid}_${segId}${extSeg}`,
            ].join('/');
        }

        convertResponse(response, resolve, reject) {
            var {
                url,
                audioPath,
                contentType,
            } = response;
            var {
                convertTo,
            } = this;
            var convertErr = new Error('convertResponse() Error');
            (async function() { try {
                var execOpts = {
                    cwd: path.dirname(audioPath),
                    shell: '/bin/bash',
                    maxBuffer,
                };
                var ext = path.extname(audioPath);
                var basename = path.basename(audioPath, ext);
                var srcFile = path.basename(audioPath);
                var dstFile = `${basename}${convertTo}`;
                if (srcFile === dstFile) { // source is in destination format
                    resolve(response);
                } else { // convert to destination format
                    var cmd = [
                        `ffmpeg -i ${srcFile}`,
                        `-vn`, // omit video stream
                        `-b:a 128k`, // audio bitrate
                        `-ar 22050`, // audio bitrate 22050Hz
                        //`-ar 44100`, // audio bitrate 44100Hz
                        `-y "${dstFile}"`].join(' ');
                    cmd = `${cmd}; rm ${srcFile}`;
                    exec(cmd, execOpts, (error, stdout, stderr) => {
                        logger.debug(stdout);
                        if (error) {
                            logger.warn(stderr);
                            logger.warn(convertErr);
                            reject(error);
                            return;
                        } 
                        logger.debug(stderr);
                        if (contentType === 'video/webm') {
                            response.audioPath = audioPath.replace(srcFile, dstFile);
                            resolve(response);
                        } else {
                            var e = new Error(
                                `download failed for url:${url} error:${audioPath}`);
                            logger.warn(e.stack);
                            fs.existsSync(audioPath) && fs.unlinkSync(audioPath); 
                            reject(e);
                        }
                    });
                };
            } catch(e) {reject(e);} })();
        }

        downloadSegmentAudio(opts = {}) {
            var {
                suttaSegId,
                audioPath,
                language,
                author,
                reader,
            } = opts;
            if (suttaSegId == null) {
                return Promise.reject(new Error(`expected suttaSegId`));
            }
            suttaSegId = suttaSegId.replace(/\.00*/ug,'.');
            var msgPrefix = `ScAudio.downloadSegmentAudio()`;
            if (audioPath == null) {
                var filename = `${suttaSegId.replace(/:/g,'_')}${this.extSeg}`;
                audioPath = path.join(this.downloadDir, filename);
                logger.info(`${msgPrefix} default audioPath:${audioPath}`);
            } else {
                logger.info(`${msgPrefix} given audioPath:${audioPath}`);
            }
            language = language || this.language;
            author = author || this.author;
            reader = reader || this.reader;
            var url = this.segmentUrl(suttaSegId, language, author, reader);
            var {
                downloadDir,
            } = this;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    let httpx = url.startsWith('https') ? https : http;
                    let request = httpx.get(url, function(response) {
                        let contentType = response.headers['content-type'];
                        let os = fs.createWriteStream(audioPath);
                        response.pipe(os);
                        response.on('end', () => {
                            var audioPathType = audioPath.split('.').pop();
                            logger.info(
                                `downloaded ${audioPath} ${contentType} `+
                                `saved as ${audioPathType}`);
                            var execOpts = {
                                cwd: path.dirname(audioPath),
                                shell: '/bin/bash',
                                maxBuffer,
                            };
                            var response = {
                                url,
                                contentType,
                                audioPath,
                                suttaSegId,
                                language,
                                author,
                                reader,
                            };
                            var resCvt = that.convertResponse(response, resolve, reject);
                        });
                    }).on('error', (e) => {
                        logger.warn(e.stack);
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.warn(e.stack);
                        req.abort();
                    });
                } catch(e) {reject(e);} })();
            });
        }

        cacheSuttaAudio(opts) {
            var {
                suid,
                language,
                author,
                reader,
                suttaStore,
                soundStore,
            } = opts;
            var that = this;
            if (suid == null) {
                return Promise.reject(new Error(
                    'ScAudio.cacheSuttaAudio() suid is required'));
            }
            suttaStore = suttaStore || this.suttaStore;
            if (suttaStore == null) {
                return Promise.reject(new Error(`expected suttaStore`));
            }
            soundStore = soundStore || this.soundStore;
            if (soundStore == null) {
                return Promise.reject(new Error(`expected soundStore`));
            }
            language = language || this.language;
            author = author || this.author;
            reader = reader || this.reader;

            return new Promise((resolve, reject) => {
                (async function() { try {
                    var segmentAudio = {};
                    var result = {
                        suid,
                        segmentAudio,
                    };
                    var {
                        fragments,
                    } = await that.aeneasMap(suid, language, author, reader);
                    var resSearch = await suttaStore.search(suid);
                    var {
                        sutta,
                    } = resSearch.results[0];
                    var segments = sutta.segments;
                    var iFrag = 0;
                    var frag = fragments[iFrag];
                    for (var iSeg=0; iSeg < segments.length; iSeg++) {
                        var seg = segments[iSeg];
                        if (seg.scid === frag.id) {
                            frag = fragments[++iFrag];
                        }
                    }
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }
    }

    module.exports = exports.SCAudio = SCAudio;
})(typeof exports === "object" ? exports : (exports = {}));

