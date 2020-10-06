(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const http = require('http');
    const https = require('https');
    const Queue = require('promise-queue');
    const Words = require('./words');
    const Sutta = require('./sutta');
    const SuttaCentralId = require('./sutta-central-id');
    const { GuidStore } = require('memo-again');
    const Definitions = require('./definitions');
    const { MerkleJson } = require('merkle-json');
    const LOCAL = path.join(__dirname, '..', '..', 'local');
    const EXPANSION_PATH = path.join(LOCAL, 'expansion.json');
    const UID_EXPANSION_PATH = path.join(LOCAL, 'uid_expansion.json');
    const DEFAULT_LANGUAGE = 'en';
    const DEFAULT_API_URL = 'http://suttacentral.net/api';
    const UID_EXPANSION_URL = 'https://raw.githubusercontent.com/'+
        'suttacentral/sc-data/master/misc/uid_expansion.json';
    const ANY_LANGUAGE = '*';
    const ANY_TRANSLATOR = '*';
    const PO_SUFFIX_LENGTH = '.po'.length;
    const { logger } = require('log-instance');

    var singleton;

    var httpMonitor = 0;
    var DAY_SECONDS = 24*60*60;

    class SuttaCentralApi {
        constructor(opts={}) {
            (opts.logger || logger).logInstance(this, opts);
            this.language = opts.language || DEFAULT_LANGUAGE;
            this.translator = opts.translator;
            this.expansion = opts.expansion || [{}];
            this.apiStore = opts.apiStore || new GuidStore({
                type: 'ApiStore',
                suffix: '.json',
                storeName: 'api',
            });
            this.apiCacheSeconds = opts.apiCacheSeconds || 7*DAY_SECONDS;
            this.queue = new Queue(opts.maxConcurrentServiceCalls || 5, 
                Infinity);
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            this.apiUrl = opts.apiUrl || DEFAULT_API_URL;
        }

        static loadJson(url) {
            singleton = singleton || new SuttaCentralApi();
            return singleton.loadJson(url);
        }

        async loadJson(url) { try {
            var guid = this.mj.hash({
                method: 'get',
                url,
            });
            var cachedPath = this.apiStore.guidPath(guid);
            var stat = fs.existsSync(cachedPath) && fs.statSync(cachedPath);
            var age = stat && (Date.now() - stat.ctimeMs)/1000 || 
                this.apiCacheSeconds;
            if (age < this.apiCacheSeconds) {
                var result = JSON.parse(await fs.promises.readFile(cachedPath));
                this.debug(`SuttaCentralApi.loadJson(${url}) => cached:${guid}`);
            } else {
                var result = await this.loadJsonRest(url);
                fs.writeFileSync(cachedPath, JSON.stringify(res,null,2));
                this.log(`loadJson(${url}) => fresh:${guid}`);
            }
            return result;
        } catch (e) {
            this.error(e);
            throw e;
        }}

        async loadJsonRest(url) {
            var httpx = url.startsWith('https') ? https : http;
            if (++httpMonitor > 2) {
                // We are overwhelming SuttaCentralApi
                // implement throttling using Queue 
                // (see abstract-tts.js)
                this.warn(`SuttaCentralApi.loadJsonRest() `+
                    `httpMonitor:${httpMonitor} ${url}`);
            }
            var req = httpx.get(url, res => {
                httpMonitor--;
                const { statusCode } = res;
                const contentType = res.headers['content-type'];

                let error;
                if (statusCode !== 200) {
                    this.warn(`Request Failed:`,
                        `statusCode:${statusCode}`,
                        url);
                    error = new Error(`Request Failed.\n` +
                                      `Status Code: ${statusCode}`);
                } else if (/^application\/json/.test(contentType)) {
                    // OK
                } else if (/^text\/plain/.test(contentType)) {
                    // OK
                } else {
                    error = new Error(
                        `Invalid content-type:${contentType}\n` +
                        `Expected application/json for url:${url}`);
                }
                if (error) {
                    // consume response data to free up memory
                    res.resume(); 
                    this.error(error.stack);
                    reject(error);
                    return;
                }

                res.setEncoding('utf8');
                let rawData = '';
                res.on('data', (chunk) => { rawData += chunk; });
                res.on('end', () => {
                    try {
                        var result = JSON.parse(rawData);
                        that.log(`loadJsonRest() `+
                            `${url} => ${rawData.length}C`);
                        resolve(result);
                    } catch (e) {
                        this.error(e.stack);
                        reject(e);
                    }
                });
            }).on('error', (e) => {
                httpMonitor--;
                this.error(e.stack);
                reject(e);
            }).on('timeout', (e) => {
                this.error(e.stack);
                req.abort();
            });
        }

        static async loadUidExpansion(url=UID_EXPANSION_URL) { try {
            if (fs.existsSync(UID_EXPANSION_PATH)) {
                return JSON.parse(await fs.promises.readFile(UID_EXPANSION_PATH));
            } else {
                var res = await SuttaCentralApi.loadJson(url);
                this.info(`${url}`);
                fs.writeFileSync(UID_EXPANSION_PATH, JSON.stringify(res,null,2));
                return res;
            }
        } catch(e) {
            this.error(`${url} ${e.message}`);
            throw e;
        }}

        static async loadExpansion(apiUrl=DEFAULT_API_URL) { try {
            if (fs.existsSync(EXPANSION_PATH)) {
                return JSON.parse(await fs.promises.readFile(EXPANSION_PATH));
            } else {
                var url = `${apiUrl}/expansion`;
                var res = await SuttaCentralApi.loadJson(url);
                this.info(`${url}`);
                fs.writeFileSync(EXPANSION_PATH, JSON.stringify(res,null,2));
                return res;
            }
        } catch(e) {
            this.error(`${url} ${e.message}`);
            throw e;
        }}

        async initialize() { try {
            if (this.initialized === false) {
                throw new Error("initialize() in progress");
            }
            if (this.initialized === true) {
                return this;
            }
            this.initialized = false;
            this.log(`initialize() apiUrl:${this.apiUrl}`);
            await SuttaCentralApi.loadExpansion(this.apiUrl)
                .then(res => { this.expansion = res; })
                .catch(e => reject(e));
            await SuttaCentralApi.loadUidExpansion().then(res => {
                this.uid_expansion = res;
                }).catch(e => reject(e));
            this.initialized = true;
            return this;
        } catch(e) {
            this.error(e);
            throw e;
        }}

        expandAbbreviation(abbr) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            return this.expansion[0][abbr];
        }

        suttaFromHtml(html, opts={}) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            var lang = opts.lang || 'en';
            var author_uid = opts.author_uid || 'sujato';
            this.info(`suttaFromHtml(${JSON.stringify(opts)})`);
            var apiText = Object.assign({
                lang,
                uid: "uid?",
            }, opts);
            apiText.translation = Object.assign({
                title: "title?",
                text: html,
                lang,
                author_uid,
            }, opts.translation);
            apiText.suttaplex = Object.assign({
                uid: "suttaplex.uid?",
                root_lang: "pli",
                original_title: "suttaplex.original_title?",
            }, opts.suttaplex);
            return this.suttaFromApiText(apiText);
        }

        suttaFromApiText(apiJson) {
            if (!this.initialized) {
                throw new Error('initialize() must be called');
            }
            var {
                translation,
                segmented,
                suttaplex,
            } = apiJson;
            var lang = translation.lang;
            var uid = suttaplex.uid;
            var author_uid = translation.author_uid;
            var html = translation.text.trim();

            var debug = 0;
            var msStart = Date.now();
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

            var iH = html.match(/<h[0-9]/um);
            var iP = html.indexOf('<p');
            if (iH >= 0) {
                html = html.replace(/[^]*?(<h[0-9][^>]*)>/um, '$1');
            } else {
                html = html.replace(/[^]*?<p[^>]*>/um, '<p>');
            }
            html = html.replace(/<\/?div[^>]*>\n*/gum,'');
            html = html.replace(/<\/?blockquote[^>]*>\n*/gum,'');
            html = html.replace(/<\/?br[^>]*>\n*/gum,' ');

            var ipLast = html.lastIndexOf('</p>');
            var pEnd = '</p>';
            var ipEnd = html.lastIndexOf(pEnd);
            ipEnd >= 0 && (html = html.substring(0, ipEnd+pEnd.length));
            var lines = html.split('\n');

            var debug1 = 0;
            var debug2 = debug1 + 10;
            if (debug) {
                lines.slice(debug1, debug2).forEach((l,i) => {
                    var head = l.substring(0,40);
                    var tail = l.substring(l.length-10);
                    console.log(`${i+debug1} ${head}...${tail}"`)
                });
            }

            var section = 1;
            if (html.indexOf('id="sc') >= 0) {
            } else {
            }
            var id = '.0';
            var textSegments = lines.map((line,i) => {
                if (line.indexOf('id="sc') > 0) {
                    id = line.replace(/.*"sc([0-9]+)[^]*/u,'.$1');
                }
                if (i) {
                    section = line.match(/^<h[2-9]/u) ? section+1 : section;
                }
                var scid = `${uid}:${section}${id}.${i+1}`;
                line = line.replace(/<\/?[^>]*>/gu,'');
                return {
                    scid,
                    [lang]: line,
                }
            });

            if (debug) {
                console.log('elapsed', 
                    ((Date.now() - msStart)/1000).toFixed(3));
                textSegments.slice(debug1, debug2).forEach((seg,i) => {
                    var l = seg.en;
                    var len = Math.min(20,l.length/2-1);
                    console.log(`${i+debug1} ${seg.scid} "` +
                        l.substring(0,len)+
                        '...'+
                        `${l.substring(seg.en.length-len)}"`)
                });
            }

            var collId = uid.replace(/[0-9.-]+/u, '');
            var collNum = uid.replace(/[a-z]*/iu, '');
            var collNames = this.expandAbbreviation(collId);
            var collName = collNames && collNames[collNames.length-1];
            var headerSegments = [{
                scid:`${uid}:0.1`,
                [lang]: `${collName || collId} ${collNum}`,
            },{
                scid:`${uid}:0.2`,
                [lang]: `${translation.title}`,
                [suttaplex.root_lang]: `${suttaplex.original_title}`,
            }];
            var segments = headerSegments.concat(textSegments);
            var suttaRef = `${uid}/${lang}/${author_uid}`;
            this.info(`suttaFromApiText(${suttaRef}) `+
                `segs:${segments.length}`);
            return new Sutta({
                author_uid,
                sutta_uid: uid,
                lang,
                support: segmented
                    ? Definitions.SUPPORT_LEVELS.Supported
                    : Definitions.SUPPORT_LEVELS.Legacy,
                metaarea,
                segments,
                translation,
            });
        }

        normalizeScid(id) { // DEPRECATED
            if (id == null) {
                throw new Error('Sutta reference identifier is required');
            }
            var scid = SuttaCentralId.normalizeSuttaId(id);
            if (scid == null) {
                throw new Error(`Keyword search is not yet implemented:${id}`);
            }
            return {
                support: Definitions.SUPPORT_LEVELS.Legacy,
                scid,
            };
        }

        async loadSuttaJson(id, language, translator) { try {
            var {
                scid,
                support,
            } = this.normalizeScid({
                scid: id,
                language,
                translator,
            });
            var apiSuttas = `${this.apiUrl}/suttas`;
            var request = `${apiSuttas}/${scid}`;
            if (translator && translator !== ANY_TRANSLATOR) {
                request += `/${translator}`;
            }
            if (language && language !== ANY_LANGUAGE) {
                request += `?lang=${language}`;
            }
            this.debug(`loadSuttaJson() ${request}`);

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
            return result;
        } catch(e) {
            this.error(e.stack);
            throw e;
        }}

        async loadSuttaplexJson(scid, lang, author_uid) { try {
            var sutta_uid = SuttaCentralId.normalizeSuttaId(scid);
            var request = `${this.apiUrl}/suttaplex/${sutta_uid}`;
            this.debug(`loadSuttaPlexJson(${scid}) ${request}`);

            var result = await SuttaCentralApi.loadJson(request);
            var suttaplex = result[0];
            var translations = suttaplex && suttaplex.translations;
            if (translations == null || translations.length === 0) {
                throw new Error(`loadSuttaplexJson() sutta not found:${sutta_uid}`);
            }
            suttaplex.translations = 
                translations.filter(t => 
                    (!lang || lang === ANY_LANGUAGE || t.lang === lang)
                    &&
                    (!author_uid || t.author_uid === author_uid)
                );
            translations.sort((a,b) => {
                if (a.segmented === b.segmented) {
                    return (a.author_uid||'').localeCompare(b.author_uid||'');
                }
                return a.segmented ? 1 : -1;
            });
            this.debug(`SuttaCentralApi.loadSuttaplexJson`+
                `(${scid}, ${lang}, ${author_uid}) `+
                `${JSON.stringify(suttaplex,null,2)}`);
            return suttaplex;
        } catch(e) {
            this.error(e);
            throw e;
        }}

        async loadSutta(...args) { try {
            if (typeof args[0] === "string") {
                var opts = {
                    scid: args[0],
                    language: args[1] || this.language,
                    translator: args[2] || this.translator,
                }
            } else {
                opts = args[0];
            }
            var sutta_uid = SuttaCentralId.normalizeSuttaId(opts.scid);
            var language = opts.language;
            var author_uid = opts.translator;
            var suttaplex = await this.loadSuttaplexJson(
                sutta_uid, language, author_uid);
            var translations = suttaplex.translations;
            if (translations == null || translations.length == 0) {
                this.log(`loadSutta(${sutta_uid},${language}) => no translations`);
                return null;
            }

            author_uid = translations[0].author_uid;
            var result = await this.loadSuttaJson(sutta_uid, language, author_uid);
            if (result.translation == null && translations.length>0) {
                var trans = translations.filter(t=>t.segmented)[0];
                if (trans == null) {
                    console.log('debug3 no segmented');
                    trans = translations[0];
                }
                var {
                    author_uid,
                    lang,
                } = trans;

                var uid = result.suttaplex.uid;
                // multiple translations found, using first
                var result = await 
                    this.loadSuttaJson(uid, lang, author_uid);
            }
            var translation = result.translation;
            if (translation) {
                var author_uid = translation.author_uid;
                if (translation.text) {
                    var sutta = this.suttaFromApiText(result);
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
                    var segments = Object.keys(segObj)
                        .map(scid => segObj[scid]);
                    var sutta = new Sutta({
                        sutta_uid: result.suttaplex.uid,
                        support: result.segmented
                            ? Definitions.SUPPORT_LEVELS.Supported
                            : Definitions.SUPPORT_LEVELS.Legacy,
                        segments,
                        translation,
                    });
                }
                sutta.author_uid = translation.author_uid;
                sutta.suttaplex = result.suttaplex;
                return sutta;
            } else { // no unique translation 
                return result;
            }
        } catch(e) {
            this.error(e);
            throw e;
        }}
        
    }

    module.exports = exports.SuttaCentralApi = SuttaCentralApi;
})(typeof exports === "object" ? exports : (exports = {}));

