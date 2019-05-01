(function(exports) {
    const http = require('http');
    const https = require('https');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const DEFAULT_MAX_RESULT_AGE = 24 * 60 * 60; // one day cache of audio urls
    const FLAC_ROOT = "https://raw.githubusercontent.com/sujato/sc-audio/master/flac";
    const DO_ROOT = "https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com";
    const WIKI_ROOT = "https://github.com/sc-voice/sc-voice/wiki";
    const PATHNAME_DEFAULT = (opts={}) => {
        var {
            suttaId,
            lang,
            nikaya,
            major,
            author,
            speaker,
            extension,
        } = opts;
        return `${lang}/${nikaya}/${major}/${suttaId}-${lang}-${author}-${speaker}.${extension}`;
    };
    const SUJATO_SRC_PLI = {
        rootUrl: DO_ROOT,
        extension: 'webm',
        pathName: PATHNAME_DEFAULT,
        lang: 'pli',
        author: 'mahasangiti',
        speaker: 'sujato',
        source: 'Bhante Sujato (Pali)',
    };
    const SUJATO_SRC_EN = {
        rootUrl: DO_ROOT,
        extension: 'webm',
        pathName: PATHNAME_DEFAULT,
        author: 'sujato',
        lang: 'en',
        speaker: 'sujato',
        source: 'Bhante Sujato (English)',
    };
    const WIKI_SRC = {
        rootUrl: WIKI_ROOT,
        extension: 'md',
        pathName: (opts={}) => (`Audio-${opts.suttaId}`),
        lang: 'other',
        source: 'Other (various)',
    };

    class AudioUrls {
        constructor(opts={}) {
            this.sources = opts.sources || [SUJATO_SRC_PLI, SUJATO_SRC_EN, WIKI_SRC];
            this.map = {};
            this.maxResultAge = (opts.maxResultAge || DEFAULT_MAX_RESULT_AGE) * 1000;
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
                extension,
            } = opts || {};
            if (suttaId == null) {
                throw new Error(
                    `Expected sutta suttaId field in: ${JSON.stringify(opts)}`);
            }
            suttaId = suttaId.toLowerCase();
            var defaultSource = opts.source || this.sources[0];
            var rootUrl = opts.rootUrl || defaultSource.rootUrl || 'noRootUrl';
            var lang = opts.lang || defaultSource.lang || 'noLang';
            var nikaya = opts.nikaya || suttaId.replace(/[0-9].*/, '').toLowerCase();
            var major = opts.major || suttaId.split('.')[0];
            var author = opts.author || defaultSource.author || 'noAuthor';
            var speaker = opts.speaker || defaultSource.speaker || 'noSpeaker';
            var extension = opts.extension || defaultSource.extension || 'noExtension';
            var buildPathName = opts.pathName || defaultSource.pathName || PATHNAME_DEFAULT;
            var pathName = buildPathName({
                suttaId, lang, author, speaker, extension, nikaya, major,
            });
            return `${rootUrl}/${pathName}`;
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
                            logger.info(`audioUrl(${url}) redirect:${result.url}`);
                            resolve(result);
                            break;
                        case 404:
                            logger.info(`audioUrl(${url}) not found`);
                            result.urlUnavailable = url;
                            result.url = null;
                            resolve(result);
                            break;
                        default:
                            logger.warn(`audioUrl(${url}) statusCode:${statusCode}`);
                            result.urlUnavailable = url;
                            result.url = null;
                            resolve(result);
                            break;
                        }
                    }).on('error', (e) => {
                        logger.warn(`audioUrl(${url}) error:${e.message}`);
                        result.urlUnavailable = url;
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

        sourceUrls(opts) {
            if (typeof opts === 'string') {
                var suttaId = opts;
                opts = { suttaId, };
            }
            var suttaId = opts.suttaId;
            var result = this.map[suttaId];
            if (result) {
                if (Date.now() - result.date < this.maxResultAge) {
                    return Promise.resolve(result);
                }
            }
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = [];
                    for (var i = 0; i< that.sources.length; i++) {
                        var src = that.sources[i];
                        var srcOpts = Object.assign({}, src);
                        srcOpts.suttaId = suttaId;
                        var srcResult = Object.assign({}, srcOpts);
                        var audioUrl = await that.audioUrl(srcResult);
                        if (audioUrl.url) {
                            srcResult.url = audioUrl.url;
                            delete srcResult.pathName;
                            result.push(srcResult);
                        }
                    }
                    that.map[suttaId] = result;
                    result.date = new Date();
                    resolve(result);
                } catch(e) { reject(e);} })();
            });
        }
            
    }

    module.exports = exports.AudioUrls = AudioUrls;
})(typeof exports === "object" ? exports : (exports = {}));

