(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const {
        version,
    } = require('../../package');
    const http = require('http');
    const https = require('https');
    const SuttaStore = require('./sutta-store');
    const SoundStore = require('./sound-store');
    const LOCAL = path.join(__dirname, '..', '..', 'local');
    const URL_RAW = 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac';
    const URL_SEGMENTS = 'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com';
    const URL_MAP = 'https://sc-opus-store.sgp1.digitaloceanspaces.com';
    
    class SCAudio {
        constructor(opts ={}) {
            this.language = opts.language || 'en';
            this.urlRaw = opts.urlRaw || URL_RAW;
            this.urlSegments = opts.urlSegments || URL_SEGMENTS;
            this.urlMap = opts.urlMap || URL_MAP;
            this.author = opts.author || 'sujato';
            this.reader = opts.reader || 'sujato';
            this.extRaw = opts.extRaw || '.flac';
            this.extSeg = opts.extSeg || '.webm';
            this.suttaStore = opts.suttaStore;
            this.soundStore = opts.soundStore;
            this.downloadDir = opts.downloadDir || path.join(LOCAL, 'sc-audio');
            if (!fs.existsSync(this.downloadDir)) {
                logger.info(`creating SCAudio download directory:${this.downloadDir}`);
                fs.mkdirSync(this.downloadDir);
            }
        }

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
                    if (entry) {
                        var url = `${that.urlMap}/${entry[lang]}`;
                    } else {
                        var url = that.aeneasMapUrl(suid, lang, author, reader);
                    }
                    var httpx = url.startsWith('https') ? https : http;
                    logger.info(`ScAudio.aeneasMap ${url}`);
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
                            logger.error(`url:${url}`);
                            logger.error(error.stack);
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
                                logger.error(e.stack);
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.error(e.stack);
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
                            logger.error(error.stack);
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
                                    var lang = key.split('/')[0];
                                    if (lang !== 'v01') {
                                        var suid = key.replace(/.*\//u,'')
                                            .replace(/\.0*/ug,'.');
                                        suid = suid.replace(
                                            /-en|-pli|-sujato|-mahasangiti/ug,'');
                                        aeneasMaps[suid] = aeneasMaps[suid] || {};
                                        var altKey = aeneasMaps[suid][lang];
                                        if (altKey == null || altKey.length < key.length) {
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
                                logger.error(e.stack);
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.error(e.stack);
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

        downloadSegmentAudio(opts = {}) {
            var suttaSegId = opts.suttaSegId;
            if (suttaSegId == null) {
                return Promise.reject(new Error(`expected suttaSegId`));
            }
            suttaSegId = suttaSegId.replace(/\.00*/ug,'.');
            var audioPath = opts.audioPath;
            if (audioPath == null) {
                var filename = `${suttaSegId.replace(/:/g,'_')}${this.extSeg}`;
                audioPath = path.join(this.downloadDir, filename);
            }
            var language = opts.language || this.language;
            var author = opts.author || this.author;
            var reader = opts.reader || this.reader;
            var that = this;
            var url = that.segmentUrl(suttaSegId, language, author, reader);
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
                            var response = {
                                audioPath,
                                suttaSegId,
                                language,
                                author,
                                reader,
                            };
                            if (contentType === 'video/webm') {
                                resolve(response);
                            } else {
                                var e = new Error(
                                    `download failed for url:${url} error:${audioPath}`);
                                logger.warn(e.stack);
                                fs.existsSync(audioPath) && fs.unlinkSync(audioPath); 
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        logger.error(e.stack);
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.error(e.stack);
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
            if (suid == null) {
                return Promise.reject(new Error('suid is required'));
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

            var that = this;
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

