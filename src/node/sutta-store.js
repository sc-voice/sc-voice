(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        exec,
    } = require('child_process');
    const Playlist = require('./playlist');
    const Sutta = require('./sutta');
    const SuttaCentralApi = require('./sutta-central-api');
    const SuttaCentralId = require('./sutta-central-id');
    const SuttaFactory = require('./sutta-factory');
    const Words = require('./words');
    const ROOT = path.join(__dirname, '..', '..', 'local', 'suttas');
    const maxBuffer = 10 * 1024 * 1024;
    const SUTTAIDS_PATH = path.join(__dirname, '..', '..', 'src', 'node', 'sutta-ids.json');
    const COLLECTIONS = {
        an: {
            name: 'an',
            folder: 'an',
            subchapters: true,
        },
        mn: {
            name: 'mn',
            folder: 'mn',
            subchapters: false,
        },
        dn: {
            name: 'dn',
            folder: 'dn',
            subchapters: false,
        },
        sn: {
            name: 'sn',
            folder: 'sn',
            subchapters: true,
        },
        thig: {
            name: 'thig',
            folder: 'kn',
            subchapters: true,
        },
        thag: {
            name: 'thag',
            folder: 'kn',
            subchapters: true,
        }
    }

    var suttaPaths = {};
    var supportedSuttas = {}; // from https://github.com/sc-voice/scv-suttas

    class SuttaStore {
        constructor(opts={}) {
            this.suttaCentralApi = opts.suttaCentralApi || new SuttaCentralApi();
            this.suttaFactory = opts.suttaFactory || new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
                autoSection: true,
            });
            this.suttaIds = opts.suttaIds;
            this.maxDuration = opts.maxDuration || 3 * 60 * 60;
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

                    var suttaIds = supportedSuttas[that.root];
                    if (suttaIds == null) {
                        var sp = suttaPaths[that.root];
                        if (sp == null) {
                            var cmd = `find . -name '*.json'`;
                            var findOpts = {
                                cwd: that.root,
                                shell: '/bin/bash',
                                maxBuffer,
                            };
                            var sp = await new Promise((resolve, reject) => {
                                exec(cmd, findOpts, (err,stdout,stderr) => {
                                    if (err) {
                                        logger.log(stderr);
                                        reject(err);
                                    } else {
                                        resolve(stdout && stdout.trim().split('\n') || []);
                                    }
                                });
                            });
                            if (sp.length === 0) {
                                throw new Error(`SuttaStore.initialize() `+
                                    `no sutta files:${that.root}`);
                            }
                            suttaPaths[that.root] = sp;
                        }

                        // eliminate multi-lingual duplicates
                        var uids = sp.reduce((acc,sp) => { 
                            var uid = sp.replace(/.*\//,'').replace('.json','');
                            acc[uid] = true;
                            return acc;
                        },{});
                        suttaIds = supportedSuttas[that.root] = 
                            Object.keys(uids).sort(SuttaCentralId.compareLow);
                    }
                    that.suttaIds = that.suttaIds || suttaIds;

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
                                        `${spath} OK`);
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
                return 0 === SuttaCentralId.compareLow(sutta_uid, id);
            })[0] || sutta_uid;
            return path.join(authorPath, `${fname}.json`);
        }

        static isUidPattern(pattern) {
            var commaParts = pattern.toLowerCase().split(',').map(p=>p.trim());
            return commaParts.reduce((acc,part) => {
                return acc && /^[a-z]+ ?[0-9]+[-0-9a-z.:\/]*$/i.test(part);
            }, true);
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
            // replace quotes (code injection on grep argument)
            pattern = pattern.replace(/["']/g,'.'); 
            // eliminate tabs, newlines and carriage returns
            pattern = pattern.replace(/\s/g,' '); 
            // remove control characters
            pattern = pattern.replace(/[\u0000-\u001f\u007f]+/g,''); 
            // must be valid
            new RegExp(pattern);

            return pattern;
        }

        static normalizePattern(pattern) {
            // normalize white space to space
            pattern = pattern.replace(/[\s]+/g,' +'); 
            
            return pattern;
        }

        
        static paliPattern(pattern) {
            return /^[a-z]+$/i.test(pattern) 
                ? pattern
                    .replace(/a/iug, '(a|ā)')
                    .replace(/i/iug, '(i|ī)')
                    .replace(/u/iug, '(u|ū)')
                    .replace(/m/iug, '(m|ṁ|ṃ)')
                    .replace(/d/iug, '(d|ḍ)')
                    .replace(/n/iug, '(n|ṅ|ñ|ṇ)')
                    .replace(/l/iug, '(l|ḷ)')
                    .replace(/t/iug, '(t|ṭ)')
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
            var cmd = `grep -rciE '${grex}' `+
                `--exclude-dir=examples `+
                `--exclude-dir=.git `+
                `--exclude='*.md' `+
                `|grep -v ':0'`+
                `|sort -g -r -k 2,2 -k 1,1 -t ':'`;
            maxResults && (cmd += `|head -${maxResults}`);
            logger.info(`SuttaStore.search() ${cmd}`);
            var opts = {
                cwd: this.root,
                shell: '/bin/bash',
                maxBuffer,
            };
            console.log(`dbg`, cmd);
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

        static grepComparator(a,b) {
            var cmp = b.count - a.count;
            if (cmp === 0) {
                cmp = a.fpath.localeCompare(b.fpath);
            }
            return cmp;
        }

        patternKeywords(pattern) {
            var keywords = pattern.split(' +'); // + was inserted by normalizePattern();
            return keywords.map(w => 
                /^[a-z]+$/iu.test(w) && this.words.isForeignWord(w)
                ? `\\b${SuttaStore.paliPattern(w)}`
                : `\\b${w}\\b`);
        }

        keywordSearch(args) {
            var {
                pattern,
                maxResults,
                language,
                searchMetadata,
                comparator,
            } = args;
            comparator = comparator || SuttaStore.grepComparator;
            var that = this;
            var keywords = this.patternKeywords(pattern);
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
                                    var newItem = {
                                        fpath,
                                        count: Math.min(mrgIn[0].count, count),
                                    };
                                    mrgOut.push(newItem);
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
                        lines: mrgOut.sort(comparator)
                            .map(v => `${v.fpath}:${v.count}`)
                            .slice(0, maxResults),
                    });
                } catch(e) {reject(e);} })();
            });
        }

        static compareSuttaUids(a,b) {
            var aprefix = a.substring(0,a.search(/[0-9]/));
            var bprefix = b.substring(0,b.search(/[0-9]/));
            var cmp = aprefix.localeCompare(bprefix);
            if (cmp === 0) {
                var adig = a.replace(/[^0-9]*([0-9]*.?[0-9]*).*/,"$1").split('.');
                var bdig = b.replace(/[^0-9]*([0-9]*.?[0-9]*).*/,"$1").split('.');
                var cmp = Number(adig[0]) - Number(bdig[0]);
                if (cmp === 0 && adig.length>1 && bdig.length>1) {
                    cmp = Number(adig[1]) - Number(bdig[1]);
                }
            }
            return cmp;
        }

        sutta_uidSuccessor(sutta_uid, logical) {
            var prefix = sutta_uid.replace(/[-0-9.:]*$/u, '');
            var dotParts = sutta_uid.substring(prefix.length).split(".");
            var dotLast = dotParts.length-1;
            var rangeParts = sutta_uid.split("-");
            var rangeLast = rangeParts.length - 1;
            if (logical) { // logical
                dotParts[dotParts.length-1] = (rangeParts.length < 2) 
                    ? `${Number(dotParts[dotLast])+1}`
                    : `${Number(rangeParts[rangeLast])+1}`;
                var uidEnd = prefix+dotParts.join(".");
                return uidEnd;
            } else { // physical
                dotParts[dotParts.length-1] = (rangeParts.length < 2) 
                    ? `${Number(dotParts[dotLast])}`
                    : `${Number(rangeParts[rangeLast])}`;
                var uidLast = prefix+dotParts.join(".");
                var iLast = this.suttaIndex(uidLast, false);
                var uidNext = this.suttaIds[iLast+1];
                return uidNext;
            }
        }

        supportedSutta(sutta_uid) {
            var i = this.suttaIndex(sutta_uid);
            return this.suttaIds[i] || null;
        }

        suttaIndex(suttaRef, strict=true) {
            if (!this.isInitialized) {
                throw new Error("SuttaStore.initialize() is required");
            }
            var sutta_uid = suttaRef.split('/')[0];
            var iEnd = this.suttaIds.length;
            var i1 = 0;
            var i2 = iEnd;
            var cmp;
            while (i1 <= i2) {
                var i = Math.trunc((i1+i2)/2);
                var sf = this.suttaIds[i];
                cmp = SuttaCentralId.compareLow(sutta_uid, sf);

                if (cmp === 0) {
                    return i;
                }
                if (cmp < 0) {
                    if (i < i2) {
                        i2 = i;
                    } else {
                        break;
                    }
                } else if (i1 < i) { // cmp > 0
                    i1 = i;
                } else {
                    break;
                }
            }
            if (cmp < 0) {
                return i === 0 ? null : i;
            } 
            if (strict) {
                var uidNext = this.sutta_uidSuccessor(this.suttaIds[i], true);
                var cmpNext = SuttaCentralId.compareLow(sutta_uid, uidNext);
                if (cmpNext < 0) {
                    return i;
                }
                return null;
            }
            return i;
        }

        expandRange(suttaRef) {
            var cname = suttaRef.replace(/[-.:0-9.].*/u, '');
            var suffix = suttaRef.replace(/[^/]*([a-z\/]*)$/iu, '$1');
            suttaRef = suttaRef.replace(suffix, '');
            var range = suttaRef.substring(cname.length);
            var coll = Object.keys(COLLECTIONS).reduce((acc,ck) => {
                var c = COLLECTIONS[ck];
                return acc || cname === c.name && c;
            }, false);
            var result = [];
            if (!coll) { // no collection
                throw new Error(`Unrecognized sutta collection: ${suttaRef} [E4]`);
            }
            var rangeParts = range.split('-');
            var dotParts = rangeParts[0].split('.');
            if (dotParts.length > 2) {
                throw new Error(`Invalid sutta reference: ${suttaRef} [E3]`);
            }
            if (coll.subchapters) { // e.g., SN, AN
                if (dotParts.length === 1) { // e.g. SN50
                    var prefix = `${suttaRef}.`;
                    var first = rangeParts.length === 1 ? 1 : Number(rangeParts[0]);
                    var last = rangeParts.length === 1 ? 999 : Number(rangeParts[1]);
                } else if (rangeParts.length === 1) {
                    var prefix = `${cname}${dotParts[0]}.`;
                    rangeParts[0] = dotParts[1];
                    var first = Number(rangeParts[0]);
                    var last = first;
                } else { // e.g., SN50.1
                    var prefix = `${cname}${dotParts[0]}.`;
                    var first = Number(dotParts[1]);
                    var last = Number(rangeParts[1]);
                }
                if (isNaN(first) || isNaN(last)) {
                    throw new Error(`Invalid sutta reference: ${suttaRef} [E1]`);
                }
                var firstItem = `${prefix}${first}`;
                var iCur = this.suttaIndex(firstItem, false);
                if (iCur == null) {
                    throw new Error(`Sutta ${firstItem} not found`);
                }
                var endUid = this.sutta_uidSuccessor(`${prefix}${last}`);
                var iEnd = this.suttaIndex(endUid);
                for (var i = iCur; i < iEnd; i++) {
                    result.push(`${this.suttaIds[i]}${suffix}`);
                }
            } else { // e.g., MN, DN
                if (rangeParts.length === 1) {
                    var first = Number(rangeParts[0]);
                    var last = first;
                } else {
                    var first = Number(rangeParts[0]);
                    var last = Number(rangeParts[1]);
                }
                if (isNaN(first) || isNaN(last)) {
                    throw new Error(`Invalid sutta reference: ${suttaRef} [E2]`);
                }
                var firstItem = `${cname}${first}`;
                var iCur = this.suttaIndex(firstItem, false);
                if (iCur == null) {
                    throw new Error(`Sutta ${firstItem} not found`);
                }
                var lastItem = `${cname}${last}`;
                var endUid = this.sutta_uidSuccessor(lastItem);
                var iEnd = this.suttaIndex(endUid);
                for (var i = iCur; i < iEnd; i++) {
                    result.push(`${this.suttaIds[i]}${suffix}`);
                }
            }
            return result;
        }

        suttaList(list) {
            if (typeof list === 'string') {
                list = list.split(',');
            }
            try {
                return list.reduce((acc, item) => {
                    var suttaRef = item.toLowerCase().replace(/ /gu, '');
                    this.expandRange(suttaRef).forEach(item => acc.push(item));
                    return acc;
                }, []);
            } catch (e) {
                throw e;
            }
        }

        grepSearchResults(args) {
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
                try {
                    var fnameparts = fname.split('/');
                    var collection_id = fnameparts[fnameparts.length-4];
                    var text = fs.readFileSync(fname);
                    var json = JSON.parse(text);
                    var sutta = new Sutta(json);
                } catch(e) {
                    logger.warn(`${e.message} fname:${fname}`);
                    throw e;
                }
                sutta = this.suttaFactory.sectionSutta(sutta);
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
                    sutta
                }
            }) || [];
        }

        suttaSearchResults(args) {
            var {
                suttaRefs,
                lang,
                maxResults,
            } = args;
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var results = [];
                    for (var i = 0; i < Math.min(maxResults,suttaRefs.length); i++) {
                        var ref = suttaRefs[i];
                        var refParts = ref.split('/');
                        var uid = refParts[0];
                        var refLang = refParts[1] || lang;
                        var refTranslator = refParts[2];
                        if (refTranslator == null) {
                            var localPath = suttaPaths[that.root]
                                .filter(sp => sp.indexOf(uid) >= 0)[0];
                            var suttaPath = path.join(that.root, localPath);
                            var spParts = suttaPath.split('/');
                            refTranslator = spParts[spParts.length-2];
                        }
                        var collection_id = uid.replace(/[-0-9.:]*$/,'');
                        var sutta = await that.suttaFactory.loadSutta({
                            scid: uid,
                            translator: refTranslator,
                            language: refLang,
                            expand: true,
                        });
                        var suttaplex = sutta.suttaplex;
                        var nSegments = sutta.segments.length;
                        var translation = sutta.translation;
                        results.push({
                            count: 1,
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
                            quote: sutta.segments[1], // usually title
                            sutta,
                        });
                    }
                    resolve(results);
                } catch(e) { reject(e); } })();
            });
        }

        voiceResults(grepSearchResults, lang) {
            var voice = this.voice;
            if (voice == null) {
                return Promise.resolve(grepSearchResults);
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    for (var i = 0; i < grepSearchResults.length; i++) {
                        var result = grepSearchResults[i];
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
                    resolve(grepSearchResults);
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

        createPlaylist(...args) {
            var that = this;
            var opts = args[0];
            if (typeof opts === 'string') {
                opts = {
                    pattern: args[0],
                    maxResults: args[1],
                };
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var {
                        language,
                        method,
                        suttaRefs,
                        suttas,
                        resultPattern,
                    } = await that.findSuttas(opts);
                    var maxDuration = opts.maxDuration || that.maxDuration;
                    var playlist = new Playlist({
                        languages: opts.languages || ['pli', language],
                    });
                    suttas.forEach(sutta => {
                        playlist.addSutta(sutta);
                    });
                    var duration = playlist.stats().duration;
                    if (duration > that.maxDuration) {
                        playlist = new Playlist({
                            languages: opts.languages || [language],
                        });
                        var minutes = (that.maxDuration / 60).toFixed(0);
                        playlist.addTrack("createPlaylist_error1", 
                            `Play list is too long to be played. `+
                            `All play lists must be less than ${minutes} minutes long`);
                    }
                    resolve(playlist);
                } catch(e) {reject(e);} })();
            });
        }

        sutta_uidSearch(pattern, maxResults=5, language='en') {
            var method = 'sutta_uid';
            var uids = this.suttaList(pattern).slice(0, maxResults);
            var suttaRefs = uids.map(ref => {
                var refParts = ref.split('/');
                var uid = refParts[0];
                var refLang = refParts[1] || language;
                var refTranslator = refParts[2];
                if (refTranslator == null) {
                    var localPath = suttaPaths[this.root]
                        .filter(sp => sp.indexOf(uid) >= 0)[0];
                    var suttaPath = path.join(this.root, localPath);
                    var spParts = suttaPath.split('/');
                    refTranslator = spParts[spParts.length-2];
                }
                return `${uid}/${refLang}/${refTranslator}`;
            });

            return {
                method,
                uids,
                suttaRefs,
            }
        }

        findSuttas(...args) {
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
            var maxResults = Number(
                opts.maxResults==null ? that.maxResults : opts.maxResults);
            if (isNaN(maxResults)) {
                throw new Error("SuttaStore.search() maxResults must be a number");
            }
            var sortLines = opts.sortLines;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    if (SuttaStore.isUidPattern(pattern)) {
                        var {
                            method,
                            uids,
                            suttaRefs,
                        } = that.sutta_uidSearch(pattern, maxResults, language);
                    } else {
                        var method = 'phrase';
                        var lines = [];
                        pattern = SuttaStore.normalizePattern(pattern);
                        var searchOpts = {
                            pattern, 
                            maxResults, 
                            language, 
                            searchMetadata
                        };

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
                        sortLines && lines.sort(sortLines);
                        var suttaRefs = lines.map(line => {
                            var iColon = line.indexOf(':');
                            var pathParts = line.substring(0,iColon).split('/');
                            var suttaRef = 
                                pathParts[3].replace(/.json/,'') + '/' +
                                pathParts[1] + '/' +
                                pathParts[2];
                            return suttaRef;
                        });
                    }
                    var suttas = [];
                    for (var i = 0; i < suttaRefs.length; i++) {
                        var refParts = suttaRefs[i].split('/');
                        var sutta = await that.suttaFactory.loadSutta({
                            scid: refParts[0],
                            language: refParts[1],
                            translator: refParts[2],
                            expand: true,
                        });
                        suttas.push(sutta);
                    }
                    resolve({
                        method,
                        suttaRefs,
                        suttas,
                        resultPattern,
                        language,
                    });
                } catch(e) {reject(e);} })();
            });
        }

        search(...args) { 
            // implementation deprecated. should use findSuttas
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
                    if (SuttaStore.isUidPattern(pattern)) {
                        var method = 'sutta_uid';
                        var uids = that.suttaList(pattern).slice(0, maxResults);
                        var results = await that.suttaSearchResults({
                            suttaRefs: uids, 
                            lang: language,
                            maxResults,
                        });
                    } else {
                        var method = 'phrase';
                        var lines = [];
                        pattern = SuttaStore.normalizePattern(pattern);
                        var searchOpts = {
                            pattern, 
                            maxResults, 
                            language, 
                            searchMetadata
                        };

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
                        var grepSearchResults = that.grepSearchResults({
                            lines,
                            sortLines,
                            pattern: resultPattern,
                        });
                        var results = await that.voiceResults(grepSearchResults, language);
                    }
                    resolve({
                        method,
                        results,
                        resultPattern,
                    });
                } catch(e) {reject(e);} })();
            });
        }

        nikayaSuttaIds(nikaya, language='en', author='sujato') {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var nikayaPath = path.join(that.root, nikaya);
                    var lang = language === 'pli' ? 'en' : language;
                    var langPath = path.join(nikayaPath, lang, author);
                    fs.readdir(langPath, null, (err, files) => {
                        if (err) {
                            logger.info(`nikayaSuttaIds(${nikaya}) ${err.message}`);
                            resolve([]);
                        } else {
                            var sutta_uids = files.reduce((acc,f) => {
                                if (f.endsWith('.json')) {
                                    acc.push(f.replace(/\.json/u, ''));
                                }
                                return acc;
                            }, []);
                            var cmp = SuttaCentralId.compareLow;
                            resolve(sutta_uids.sort(cmp));
                        }
                    });
                } catch(e) {reject(e);} })();
            });
        }

    }

    module.exports = exports.SuttaStore = SuttaStore;
})(typeof exports === "object" ? exports : (exports = {}));

