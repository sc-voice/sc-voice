(function(exports) {
    const http = require('http');
    const https = require('https');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const FLAC_ROOT = "https://raw.githubusercontent.com/sujato/sc-audio/master/flac";
    const DO_ROOT = "https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com";

    class AudioUrls {
        constructor(opts={}) {
            //this.rootUrl = opts.rootUrl || FLAC_ROOT;
            //this.rootMime = opts.rootMime || 'flac';
            this.rootUrl = opts.rootUrl || DO_ROOT;
            this.rootMime = opts.rootMime || 'webm';
            this.speaker = opts.speaker || 'sujato';
            this.lang = opts.lang || 'pli';
            this.author = opts.author || 'mahasangiti';
            this.map = {};
        }

        buildUrl(opts) {
            if (typeof opts === 'string') {
                opts = {
                   suttaId: opts,
                }
            }
            var {
                major,
                author,
                speaker,
                suttaId,
                mime,
            } = opts || {};
            if (suttaId == null) {
                throw new Error(
                    `Expected sutta suttaId field in: ${JSON.stringify(opts)}`);
            }
            var rootUrl = opts.rootUrl || this.rootUrl;
            var lang = opts.lang || this.lang;
            var nikaya = opts.nikaya || suttaId.replace(/[0-9].*/, '').toLowerCase();
            var major = opts.major || suttaId.split('.')[0];
            var author = opts.author || this.author;
            var speaker = opts.speaker || this.speaker;
            var mime = opts.mime || opts.mime || this.rootMime;
            var fname = `${suttaId}-${lang}-${author}-${speaker}.${mime}`;
            return [
                rootUrl,
                lang,
                nikaya,
                major,
                fname,
            ].join('/');
        }

        audioUrl(opts) {
            var that = this;
            return new Promise((resolve, reject) => { 
                (async function () { try {
                    var url = that.buildUrl(opts);
                    var result = {
                        url,
                    };
                    var httpx = url.startsWith('https') ? https : http;
                    var req = httpx.get(url, res => {
                        const { statusCode } = res;
                        result.statusCode = statusCode;
                        res.resume(); // consume response data to free up memory
                        switch (statusCode) {
                        case 200:
                            resolve(result);
                            break;
                        case 301:
                            result.url = res.headers.location;
                            resolve(result);
                            break;
                        case 404:
                            result.urlUnavailable = result.url;
                            result.url = null;
                            resolve(result);
                            break;
                        default:
                            logger.warn(`audioUrl(${url}) statusCode:${statusCode}`);
                            result.urlUnavailable = result.url;
                            result.url = null;
                            resolve(result);
                            break;
                        }
                    }).on('error', (e) => {
                        logger.warn(`audioUrl(${url}) error:${e.message}`);
                        result.urlUnavailable = result.url;
                        result.url = null;
                        resolve(result);
                    }).on('timeout', (e) => {
                        logger.warn(`audioUrl(${url}) timeout:${e.message}`);
                        req.abort();
                    });
                } catch(e) {
                    logger.error(e.stack);
                    reject(e);
                } })();
            });
        }
            
    }

    module.exports = exports.AudioUrls = AudioUrls;
})(typeof exports === "object" ? exports : (exports = {}));

