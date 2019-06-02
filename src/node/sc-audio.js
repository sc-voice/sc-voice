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
    const LOCAL = path.join(__dirname, '..', '..', 'local');
    const URL_RAW = 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac';
    const URL_SEGMENTS = 'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com';
    const URL_MAP = 'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com';
    
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
        }

        nikayaOf(suid) {
            return suid.replace(/[0-9].*/,'');
        }

        majorIdOf(suid) {
            return suid.replace(/\..*/,'');
        }

            
        mapUrl(suid, lang=this.language, author=this.author, reader=this.reader) {
            suid = suid.toLowerCase();
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

        mapJson(suid, lang=this.language, author=this.author, reader=this.reader) {
            var that = this;
            var url = that.mapUrl(suid, lang, author, reader);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var httpx = url.startsWith('https') ? https : http;
                    var req = httpx.get(url, res => {
                        const { statusCode } = res;
                        const contentType = res.headers['content-type'];
                        let error;
                        if (statusCode !== 200) {
                            error = new Error('Request Failed.\n' +
                                              `Status Code: ${statusCode}`);
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

        catalog() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var url = that.urlMap;
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
                        let result = {suttas: [
                        ]};
                        let remainder = '';
                        res.on('data', chunk => { 
                            chunk = remainder + chunk.toString();
                            var chunkLines = chunk.toString().split('.json</Key>');
                            remainder = chunkLines[chunkLines.length-1];
                            chunkLines = chunkLines.slice(0, chunkLines.length-1);
                            chunkLines.forEach(line => {
                                if (line.match(/Key>/u)) {
                                    line = line.replace(/.*Key>/u,'');
                                    line = line.replace(/.*\//u,'');
                                    line = line.replace(/-en|-pli|-sujato/ug,'');
                                    result.suttas.push(line);
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
            var suid = segIdParts[0];
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

    }

    module.exports = exports.SCAudio = SCAudio;
})(typeof exports === "object" ? exports : (exports = {}));

