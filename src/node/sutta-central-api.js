(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const http = require('http');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const PoParser = require('./po-parser');
    const GuidStore = require('./guid-store');
    const Definitions = require('./definitions');
    const { MerkleJson } = require('merkle-json');
    const EXPANSION_PATH = path.join(__dirname, '..', '..', 'local', 'expansion.json');
    const DEFAULT_LANGUAGE = 'en';
    const DEFAULT_API_URL = 'http://suttacentral.net/api';
    const ANY_LANGUAGE = '*';
    const ANY_TRANSLATOR = '*';
    const PO_SUFFIX_LENGTH = '.po'.length;
    const { 
        logger,
        RbServer,
    } = require('rest-bundle');
    RbServer.logDefault();
    logger.level = 'info';

    var singleton;

    class SuttaCentralApi {
        constructor(opts={}) {
            this.language = opts.language || DEFAULT_LANGUAGE;
            this.translator = opts.translator;
            this.expansion = opts.expansion || [{}];
            this.apiStore = opts.apiStore || new GuidStore({
                type: 'ApiStore',
                suffix: '.json',
                storeName: 'api',
            });
            this.apiCacheSeconds = opts.apiCacheSeconds || 10*60; 
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            this.initialized = false;
            this.apiUrl = opts.apiUrl || DEFAULT_API_URL;
        }

        static loadJson(url) {
            singleton = singleton || new SuttaCentralApi();
            return singleton.loadJson(url);
        }

        loadJson(url) {
            var guid = this.mj.hash({
                method: 'get',
                url,
            });
            var cachedPath = this.apiStore.guidPath(guid);
            var stat = fs.existsSync(cachedPath) && fs.statSync(cachedPath);
            var age = stat && (Date.now() - stat.ctimeMs)/1000 || this.apiCacheSeconds;
            if (age < this.apiCacheSeconds) {
                var res = JSON.parse(fs.readFileSync(cachedPath));
                logger.debug(`loadJson() => cached response guid:${guid} url:${url}`);
                var result = Promise.resolve(res);
            } else {
                var result = this.loadJsonRest(url);
                result.then(res => {
                    fs.writeFileSync(cachedPath, JSON.stringify(res,null,2));
                    logger.info(`loadJson() => updated apiStore guid:${guid} url:${url}`);
                });
            }
            return result;
        }

        loadJsonRest(url) {
            return new Promise((resolve, reject) => { try {
                var req = http.get(url, res => {
                    const { statusCode } = res;
                    const contentType = res.headers['content-type'];

                    let error;
                    if (statusCode !== 200) {
                        error = new Error('Request Failed.\n' +
                                          `Status Code: ${statusCode}`);
                    } else if (!/^application\/json/.test(contentType)) {
                        error = new Error('Invalid content-type.\n' +
                                          `Expected application/json but received ${contentType}`);
                    }
                    if (error) {
                        res.resume(); // consume response data to free up memory
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
                            logger.info(`loadJsonRest() ${url} => HTTP200`);
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
            } catch(e) {reject(e);} });
        }

        static loadExpansion(apiUrl=DEFAULT_API_URL) {
            if (fs.existsSync(EXPANSION_PATH)) {
                try {
                    var expansion = JSON.parse(fs.readFileSync(EXPANSION_PATH));
                    return Promise.resolve(expansion);
                } catch(e) {
                    return Promise.reject(e);
                }
            } else {
                return new Promise((resolve, reject) => {
                    var url = `${apiUrl}/expansion`;
                    SuttaCentralApi.loadJson(url).then(res => {
                        fs.writeFileSync(EXPANSION_PATH, JSON.stringify(res,null,2));
                        resolve(res);
                    }).catch(e => reject(e));
                });
            }
        }

        initialize() {
            return new Promise((resolve,reject) => { try {
                SuttaCentralApi.loadExpansion(this.apiUrl).then(res => {
                    this.expansion = res;
                    this.initialized = true;
                    resolve(this);
                }).catch(e => reject(e));
            } catch(e) {reject(e);} });
        }

        expandAbbreviation(abbr) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            return this.expansion[0][abbr];
        }

        suttaFromApiText(apiJson) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            var translation = apiJson.translation;
            var html = translation.text;
            var resultAside = (/<aside/um).exec(html);
            if (resultAside) {
                let start = html.indexOf('>', resultAside.index)+1;
                let end = html.indexOf('</aside', start);
                var metaarea = html.substring(start, end);
                let reAside = new RegExp('<aside[^]*</aside>', 'gum');
                html = html.replace(reAside, '');
            } else {
                var metaArea = '';
            }
            html = html.replace(/(.*\n)*<section[^>]*>\n*/um, '');
            html = html.replace(/<\/section>[^]*/um, '');
            html = html.replace(/(.*\n)*<blockquote[^>]*>\n*/um, '');
            html = html.replace(/<\/blockquote>[^]*/um, '');
            html = html.replace(/<br>\n/gum, ' ');
            html = html.replace(/<\/p>/gum, '');
            //html = html.replace(/<\/?[^a][^>]+>/igum, ''); 
            html = html.replace(/<\/?article[^>]*>/igum, ''); 
            html = html.replace(/<\/?div[^>]*>/igum, ''); 
            html = html.replace(/<\/?h[0-9][^>]*>/igum, ''); 
            html = html.replace(/<\/?i[^>]*>/igum, ''); 
            html = html.replace(/\n( *\n)*/gum, '\n');
            html = html.replace(/\n*$/gum, '');
            var lines = html.split('\n');
            var suttaplex = apiJson.suttaplex;
            var uid = suttaplex.uid;
            var lang = translation.lang;
            var collId = uid.replace(/[0-9.-]+/u, '');
            var collNum = uid.replace(/[a-z]*/iu, '');
            var collNames = this.expandAbbreviation(collId);
            var collName = collNames && collNames[collNames.length-1];
            var headerSegments = [{
                scid:`${uid}:0.1`,
                [lang]: `${collName || colId} ${collNum}`,
            },{
                scid:`${uid}:0.2`,
                [lang]: `${translation.title}`,
                [suttaplex.root_lang]: `${suttaplex.original_title}`,
            }];
            var textSegments = lines.map((line,i) => {
                var tokens = line.split('</a>');
                if (tokens.length > 1) {
                    return {
                        scid: tokens[0].replace(/.*sc/u,`${uid}:`).replace(/".*/u,''),
                        [lang]: tokens[2],
                    }
                } else { // really raw HTML with just line counts
                    line = line.replace(/<\/?[^>]+>/gum, '');
                    return {
                        scid: `${uid}:${i+1}`,
                        [lang]: line,
                    }
                }
            });
            return new Sutta({
                support: Definitions.SUPPORT_LEVELS.Legacy,
                metaarea,
                segments: headerSegments.concat(textSegments),
            });
        }

        normalizeScid(scid) {
            if (scid == null) {
                throw new Error('Sutta reference identifier is required');
            }
            try {
                var popath = PoParser.suttaPath(scid);
                var basename = path.basename(popath);
                scid = basename.substring(0, basename.length-PO_SUFFIX_LENGTH);
                scid = scid.replace(/([^0-9])0*/gu,'$1');
                var support = Definitions.SUPPORT_LEVELS.Supported;
            } catch(e) {
                // ignore and pass to api (possibly not in Pootl)
                logger.debug(e.stack);
                var support = Definitions.SUPPORT_LEVELS.Legacy;
            }
            return {
                support,
                scid,
            };
        }

        loadSuttaJson(opts={}, ...args) {
            var that = this;
            return new Promise((resolve, reject) => (async function(){ 
                try {
                    if (typeof opts === 'string') {
                        opts = {
                            scid: opts,
                            language: args[0],
                            translator: args[1],
                        };
                    }
                    var {
                        scid,
                        support,
                    } = that.normalizeScid(opts.scid);
                    var language = opts.language || that.language;
                    var translator = opts.translator || that.translator;
                    var apiSuttas = `${that.apiUrl}/suttas`;
                    var request = `${apiSuttas}/${scid}`;
                    if (translator && translator !== ANY_TRANSLATOR) {
                        request += `/${translator}`;
                    }
                    if (language && language !== ANY_LANGUAGE) {
                        request += `?lang=${language}`;
                    }
                    logger.debug(`loadSuttaJson()`, request);

                    var result = await SuttaCentralApi.loadJson(request);
                    result.support = support;
                    var suttaplex = result.suttaplex;
                    var translations = suttaplex && suttaplex.translations;
                    if (translations == null || translations.length === 0) {
                        throw new Error(`loadSuttaJson() no sutta found for id:${scid}`);
                    }
                    if (translations && language && language !== ANY_LANGUAGE) {
                        suttaplex.translations = 
                            translations.filter(t => t.lang === language);
                    }
                    resolve(result);
                } catch(e) {
                    reject(e);
                } 
            })()); 
        }

        loadSutta(opts={}, ...args) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                (async function(){ try {
                    var result = await that.loadSuttaJson(opts);
                    var translations = result.suttaplex.translations;
                    if (result.translation == null && translations.length>0) {
                        var {
                            author_uid,
                            lang,
                        } = translations[0];
                        var uid = result.suttaplex.uid;
                        // multiple translations found, using first
                        var result = await that.loadSuttaJson(uid, lang, author_uid);
                    }
                    var translation = result.translation;
                    if (translation) {
                        var author_uid = translation.author_uid;
                        if (translation.text) {
                            var sutta = that.suttaFromApiText(result);
                        } else {
                            var rootStrings = result.root_text.strings;
                            var segObj = {};
                            Object.keys(rootStrings).forEach(scid => {
                                segObj[scid] = segObj[scid] || { scid };
                                segObj[scid].pli = rootStrings[scid];
                                segObj[scid].en = "";
                            });
                            var transStrings = translation.strings;
                            Object.keys(transStrings).forEach(scid => {
                                segObj[scid] = segObj[scid] || { scid };
                                var text = transStrings[scid];
                                text = text.replace(/<\/?i>/gum, '');
                                segObj[scid][translation.lang] = text;
                            });
                            var segments = Object.keys(segObj).map(scid => segObj[scid]);
                            var sutta = new Sutta({
                                support: result.support,
                                segments,
                            });
                        }
                        sutta.author_uid = translation.author_uid;
                        sutta.suttaplex = result.suttaplex,
                        resolve(sutta);
                    } else { // no unique translation 
                        resolve(result);
                    }
                } catch(e) {reject(e);} })();
            } catch(e) {reject(e);} });
        }
        
    }

    module.exports = exports.SuttaCentralApi = SuttaCentralApi;
})(typeof exports === "object" ? exports : (exports = {}));

