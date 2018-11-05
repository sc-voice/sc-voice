(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const Sutta = require('./sutta');
    const SuttaCentralApi = require('./sutta-central-api');
    const SuttaCentralId = require('./sutta-central-id');
    const SuttaFactory = require('./sutta-factory');
    const Words = require('./words');
    const ROOT = path.join(__dirname, '..', '..', 'local', 'suttas');
    const SUTTAIDS_PATH = path.join(__dirname, '..', '..', 'src', 'node', 'sutta-ids.json');
    const COLLECTIONS = {
        an: {
            folder: 'an',
        },
        mn: {
            folder: 'mn',
        },
        dn: {
            folder: 'dn',
        },
        sn: {
            folder: 'sn',
        },
        thig: {
            folder: 'kn',
        },
        thag: {
            folder: 'kn',
        }
    }

    class SuttaStore {
        constructor(opts={}) {
            this.suttaCentralApi = opts.suttaCentralApi || new SuttaCentralApi();
            this.suttaFactory = opts.suttaFactory || new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
            });
            this.suttaIds = opts.suttaIds || SuttaCentralId.supportedSuttas;
            this.root = opts.root || ROOT;
            this.maxResults = opts.maxResults || 5;
            this.voice = opts.voice;
            this.words = opts.words || new Words();
            Object.defineProperty(this, 'isInitialized', {
                writable: true,
                value: false,
            });
        }

        initialize() {
            if (this.isInitialized) {
                return Promise.resolve(this);
            }
            this.isInitialized = true;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    await that.suttaFactory.initialize();
                    if (!fs.existsSync(that.root)) {
                        fs.mkdirSync(that.root);
                    }
                    resolve(that);
                } catch(e) {reject(e);} })();
            });
        }

        updateSuttas(suttaIds, opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var maxAge = opts.maxAge || 0;
                    suttaIds = suttaIds || that.suttaIds;
                    for (let i = 0; i < suttaIds.length; i++) {
                        var id = suttaIds[i];
                        var sutta = await that.suttaCentralApi.loadSutta(id);
                        if (sutta) {
                            var translation = sutta.translation;
                            if (translation == null) {
                                logger.info(`SuttaStore.updateSuttas(${id}) NO TRANSLATION`);
                            } else {
                                var language = translation.lang;
                                var author_uid = translation.author_uid;
                                var spath = that.suttaPath(id, language, author_uid);
                                var updateFile = !fs.existsSync(spath) || maxAge === 0;
                                if (!updateFile) {
                                    var stats = fs.statSync(spath);
                                    var age = (Date.now() - stats.mtime)/1000;
                                    updateFile = age > maxAge;
                                }
                                if (updateFile) {
                                    fs.writeFileSync(spath, JSON.stringify(sutta, null, 2));
                                    logger.info(`SuttaStore.updateSuttas(${id}) => `+
                                        `${language} ${author_uid} OK`);
                                } else {
                                    logger.info(`SuttaStore.updateSuttas(${id}) (no change)`);
                                }
                            }
                        } else {
                            logger.info(`SuttaStore.updateSuttas(${id}) (no applicable sutta)`);
                        }
                    };
                    resolve(suttaIds);
                } catch(e) {reject(e);} })();
            });
        }

        suttaFolder(sutta_uid) {
            var group = sutta_uid.replace(/[^a-z]*/gu,'');
            var folder = Object.keys(COLLECTIONS).reduce((acc,key) => {
                var c = COLLECTIONS[key];
                return acc || key===group && c.folder;
            }, null);
            if (!folder) {
                throw new Error(`unsupported sutta:${sutta_uid} group:${group}`);
            }
            var fpath = path.join(this.root, folder);
            if (!fs.existsSync(fpath)) {
                logger.info(`SuttaStore.suttaFolder() mkdir:${fpath}`);
                fs.mkdirSync(fpath);
            }
            return fpath;
        }

        suttaPath(...args) {
            if (!this.isInitialized) {
                throw new Error("SuttaStore.initialize() is required");
            }
            var opts = args[0];
            if (typeof opts === 'string') {
                var opts = {
                    sutta_uid: args[0],
                    language: args[1],
                    author_uid: args[2],
                }
            }
            var sutta_uid = SuttaCentralId.normalizeSuttaId(opts.sutta_uid);
            if (!sutta_uid) {
                throw new Error('sutta_uid is required');
            }
            var folder = this.suttaFolder(sutta_uid);
            var language = opts.language || 'en';
            var langPath = path.join(folder, language);
            if (!fs.existsSync(langPath)) {
                fs.mkdirSync(langPath);
            }
            var author_uid = opts.author_uid;
            if (!author_uid) {
                throw new Error(`author_uid is required for: ${sutta_uid}`);
            }
            var authorPath = path.join(langPath, author_uid);
            if (!fs.existsSync(authorPath)) {
                fs.mkdirSync(authorPath);
            }
            var fname = this.suttaIds.filter(id => {
                return 0 === SuttaCentralId.compare(sutta_uid, id);
            })[0] || sutta_uid;
            return path.join(authorPath, `${fname}.json`);
        }

        static sanitizePattern(pattern) {
            if (!pattern) {
                throw new Error("SuttaStore.search() pattern is required");
            }
            const MAX_PATTERN = 1024;
            var excess = pattern.length - MAX_PATTERN;
            if (excess > 0) {
                throw new Error(`Search text too long by ${excess} characters.`);
            }
            // normalize white space to space
            pattern = pattern.replace(/[\s]+/g,' +'); 

            // remove control characters
            pattern = pattern.replace(/[\u0000-\u001f\u007f]+/g,''); 

            // replace quotes (code injection on grep argument)
            pattern = pattern.replace(/["']/g,'.'); 

            // must be valid
            new RegExp(pattern); 

            return pattern
        }
        
        static paliPattern(pattern) {
            return /^[a-z]+$/i.test(pattern) 
                ? pattern
                    .replace(/a/iug, '(a|ā)')
                    .replace(/i/iug, '(i|ī)')
                    .replace(/u/iug, '(u|ū)')
                    .replace(/m/iug, '(m|ṁ)')
                    .replace(/n/iug, '(n|ṅ|ñ|ṇ)')
                    .replace(/l/iug, '(l|ḷ)')
                : pattern;
        }

        grep(args) {
            var {
                pattern,
                maxResults,
                language,
                searchMetadata,
            } = args;
            var grex = searchMetadata
                ? pattern
                : `"(${language}|pli)":.*${pattern}`;
            var root = this.root.replace(ROOT, '');
            var cmd = `grep -rciE '${grex}' --exclude-dir=.git`+
                `|grep -v ':0'`+
                `|sort -g -r -k 2,2 -k 1,1 -t ':'`;
            maxResults && (cmd += `|head -${maxResults}`);
            logger.info(`SuttaStore.search() ${cmd}`);
            var opts = {
                cwd: this.root,
                shell: '/bin/bash',
            };
            return new Promise((resolve,reject) => {
                exec(cmd, opts, (err,stdout,stderr) => {
                    if (err) {
                        logger.log(stderr);
                        reject(err);
                    } else {
                        resolve(stdout && stdout.trim().split('\n') || []);
                    }
                });
            });
        }

        keywordSearch(args) {
            var {
                pattern,
                maxResults,
                language,
                searchMetadata,
            } = args;
            var that = this;
            var keywords = pattern.split(' +'); // the + was inserted by sanitizePattern();
            keywords = keywords.map(w => 
                /^[a-z]+$/iu.test(w) && this.words.isForeignWord(w)
                ? `\\b${SuttaStore.paliPattern(w)}`
                : `\\b${w}\\b`);
            logger.info(`SuttaStore.keywordSearch(${keywords})`);
            var wordArgs = Object.assign({}, args, {
                maxResults: 0,
            });
            return new Promise((resolve,reject) => {
                (async function() { try {
                    var mrgOut = [];
                    var mrgIn = [];
                    for (var i=0; i< keywords.length; i++) {
                        var keyword = keywords[i];
                        var wordlines = await that.grep(Object.assign({}, wordArgs, {
                            pattern: keyword,
                        }));
                        wordlines.sort();
                        mrgOut = [];
                        for (var iw = 0; iw < wordlines.length; iw++) {
                            var lineparts = wordlines[iw].split(':');
                            var fpath = lineparts[0];
                            var count = Number(lineparts[1]);
                            if (i === 0) {
                                mrgOut.push({
                                    fpath,
                                    count,
                                });
                            } else if (mrgIn.length) {
                                var cmp = mrgIn[0].fpath.localeCompare(fpath);
                                if (cmp === 0) {
                                    mrgOut.push({
                                        fpath,
                                        count: Math.min(mrgIn[0].count, count),
                                    });
                                    mrgIn.shift();
                                } else if (cmp < 0) {
                                    mrgIn.shift(); // discard left
                                    if (mrgIn.length === 0) {
                                        break;
                                    }
                                    iw--; // re-compare
                                } else {
                                    // discard right
                                }
                            }
                        }
                        mrgIn = mrgOut;
                    }
                    resolve({
                        resultPattern: keywords.join('|'),
                        lines: mrgOut.sort((a,b) => b.count - a.count)
                            .map(v => `${v.fpath}:${v.count}`)
                            .slice(0, maxResults),
                    });
                } catch(e) {reject(e);} })();
            });
        }

        static compareFilenames(a,b) {
            var aprefix = a.substring(0,a.search(/[1-9]/));
            var bprefix = b.substring(0,b.search(/[1-9]/));
            var cmp = aprefix.localeCompare(bprefix);
            if (cmp === 0) {
                var adig = a.replace(/[^1-9]*([1-9]*.?[0-9]*).*/,"$1").split('.');
                var bdig = b.replace(/[^1-9]*([1-9]*.?[0-9]*).*/,"$1").split('.');
                var cmp = Number(adig[0]) - Number(bdig[0]);
                if (cmp === 0) {
                    cmp = Number(adig[1]) - Number(bdig[1]);
                }
            }
            return cmp;
        }

        searchResults(args) {
            var {
                lines,
                pattern,
                sortLines,
            } = args;
            var rexlang = new RegExp(`\\b${pattern}\\b`,'i');
            var rexpli = new RegExp(`\\b${pattern}`,'i');
            sortLines && lines.sort(sortLines);
            return lines.length && lines.map(line => {
                var iColon = line.indexOf(':');
                var fname = path.join(ROOT,line.substring(0,iColon));
                var fnameparts = fname.split('/');
                var collection_id = fnameparts[fnameparts.length-4];
                var sutta = new Sutta(JSON.parse(fs.readFileSync(fname)));
                var suttaplex = sutta.suttaplex;
                var nSegments = sutta.segments.length;
                var translation = sutta.translation;
                var lang = translation.lang;
                var quote = sutta.segments.filter(seg => 
                    seg[lang] && 
                    (rexlang.test(seg[lang]) || rexpli.test(seg.pli))
                )[0];
                if (quote == null || !quote[lang]) {
                    // Pali search with no translated text
                    quote = sutta.segments[1]; // usually title
                }
                return {
                    count: Number(line.substring(iColon+1)),
                    uid: translation.uid,
                    author: translation.author,
                    author_short: translation.author_short,
                    author_uid: translation.author_uid,
                    author_blurb: translation.author_blurb,
                    lang,
                    nSegments,
                    title: translation.title,
                    collection_id,
                    suttaplex,
                    quote,
                }
            }) || [];
        }

        voiceResults(searchResults, lang) {
            var voice = this.voice;
            if (voice == null) {
                return Promise.resolve(searchResults);
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    for (var i = 0; i < searchResults.length; i++) {
                        var result = searchResults[i];
                        var quote = result.quote;
                        result.audio = {
                            [lang]: null,
                            pli: null,
                        };
                        if (quote[lang] != null) {
                            var vr = await voice.speak(quote[lang]);
                            result.audio[lang] = vr.signature.guid;
                            logger.debug(`voiceResults(${quote.scid}) `+
                                `${lang}:${vr.signature.guid}`);
                        }
                        if (quote.pli != null) {
                            var vr = await voice.speak(quote.pli);
                            result.audio.pli = vr.signature.guid;
                            logger.debug(`voiceResults(${quote.scid}) `+
                                `pli:${vr.signature.guid}`);
                        }
                    }
                    resolve(searchResults);
                } catch(e) {reject(e);} })();
            });
        }

        phraseSearch(args) {
            var pattern = `\\b${args.pattern}\\b`;
            logger.info(`SuttaStore.phraseSearch(${pattern})`);
            return this.grep(Object.assign({}, args, {
                pattern,
            }));
        }

        search(...args) {
            var that = this;
            var opts = args[0];
            if (typeof opts === 'string') {
                opts = {
                    pattern: args[0],
                    maxResults: args[1],
                };
            }
            var searchMetadata = opts.searchMetadata == null 
                ? true 
                : opts.searchMetadata == true || opts.searchMetadata === 'true';
            var pattern = SuttaStore.sanitizePattern(opts.pattern);
            var language = opts.language || 'en';
            var maxResults = opts.maxResults==null ? that.maxResults : opts.maxResults;
            var maxResults = Number(maxResults);
            var sortLines = opts.sortLines;
            if (isNaN(maxResults)) {
                throw new Error("SuttaStore.search() maxResults must be a number");
            }

            return new Promise((resolve, reject) => {
                (async function() { try {
                    var searchOpts = {
                        pattern, 
                        maxResults, 
                        language, 
                        searchMetadata
                    };
                    var method = 'phrase';
                    var lines = [];
                    if (!lines.length && !/^[a-z]+$/iu.test(pattern)) {
                        lines = await that.phraseSearch(searchOpts);
                    }
                    var resultPattern = pattern;
                    if (!lines.length) {
                        var method = 'keywords';
                        var data = await that.keywordSearch(searchOpts);
                        lines = data.lines;
                        resultPattern = data.resultPattern;
                    }
                    var searchResults = that.searchResults({
                        lines,
                        sortLines,
                        pattern: resultPattern,
                    });
                    var results = await that.voiceResults(searchResults, language);
                    resolve({
                        method,
                        results,
                        resultPattern,
                    });
                } catch(e) {reject(e);} })();
            });
        }

    }

    module.exports = exports.SuttaStore = SuttaStore;
})(typeof exports === "object" ? exports : (exports = {}));

