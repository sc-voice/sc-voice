
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const URL = require('url');
    const http = require('http');
    const https = require('https');
    var jwt = require('jsonwebtoken');
    const {
        logger,
        RestBundle,
        UserStore,
    } = require('rest-bundle');
    const srcPkg = require("../../package.json");
    const Words = require('./words');
    const GuidStore = require('./guid-store');
    const Section = require('./section');
    const SoundStore = require('./sound-store');
    const Sutta = require('./sutta');
    const SuttaFactory = require('./sutta-factory');
    const SuttaStore = require('./sutta-store');
    const SuttaCentralApi = require('./sutta-central-api');
    const MdAria = require('./md-aria');
    const PoParser = require('./po-parser');
    const Voice = require('./voice');
    const SuttaCentralId = require('./sutta-central-id');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds/');
    const PATH_EXAMPLES = path.join(__dirname, `../../words/examples/`);
    const DEFAULT_USER = {
        username: "admin",
        isAdmin: true,
        credentials: '{"hash":"13YYGuRGjiQad/G1+MOOmxmLC/1znGYBcHWh2vUgkdq7kzTAZ6dk76S3zpP0OwZq1eofgUUJ2kq45+TxOx5tvvag","salt":"Qf1NbN3Jblo8sCL9bo32yFmwiApHSeRkr3QOJZu3KJ0Q8hbWMXAaHdoQLUWceW83tOS0jN4tuUXqWQWCH2lNCx0S","keyLength":66,"hashMethod":"pbkdf2","iterations":748406}',
    };

    const VOICES = [{
        name: 'Amy',
        usage: 'recite',
    },{
        name: 'Russell',
        usage: 'recite',
    },{
        name: 'Raveena',
        usage: 'review',
    }];

    const SECRET = `JWT${Math.random()}`;

    class ScvRest extends RestBundle { 
        constructor(opts = {
            audioFormat: 'mp3',
        }) {
            super(opts.name || 'scv', Object.assign({
                srcPkg,
            }, opts));
            logger.info(`ScvRest.ctor(${this.name})`);
            this.wikiUrl = opts.wikiUrl || 'https://github.com/sc-voice/sc-voice/wiki';
            this.wikiUrl = opts.wikiUrl || 'https://raw.githubusercontent.com/wiki/sc-voice/sc-voice';
            this.examples = opts.examples;
            this.soundStore = opts.soundStore || new SoundStore(opts);
            this.audioMIME = this.soundStore.audioMIME;
            this.suttaCentralApi = opts.suttaCentralApi || new SuttaCentralApi();
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
                autoSection: true,
            });
            this.userStore = opts.userStore || new UserStore({
                defaultUser: DEFAULT_USER,
            });
            this.mdAria = opts.mdAria || new MdAria();
            this.voicePali = Voice.createVoice({
                name: 'Aditi',
                usage: 'recite',
                language: 'hi-IN',
                soundStore: this.soundStore,
                stripNumbers: true,
                stripQuotes: true,
                languageUnknown: "pli",
                audioFormat: this.soundStore.audioFormat,
                audioSuffix: this.soundStore.audioSuffix,
            });
            this.suttaStore = new SuttaStore({
                suttaCentralApi: this.suttaCentralApi,
                suttaFactory: this.suttaFactory,
                voice: null,
            });
            Object.defineProperty(this, "handlers", {
                value: super.handlers.concat([
                    this.resourceMethod("get", 
                        "audio/:guid", this.getAudio, this.audioMIME),
                    this.resourceMethod("get", 
                        "audio/:guid/:filename", this.getAudio, this.audioMIME),
                    this.resourceMethod("get", 
                        "recite/section/:sutta_uid/:language/:translator/:iSection", 
                        this.getReciteSection),
                    this.resourceMethod("get", 
                        "review/section/:sutta_uid/:language/:translator/:iSection", 
                        this.getReviewSection),
                    this.resourceMethod("get", 
                        "play/segment/:sutta_uid/:language/:translator/:scid/:iVoice", 
                        this.getPlaySegment),
                    this.resourceMethod("get", 
                        "play/section/:sutta_uid/:language/:translator/:iSection/:iVoice", 
                        this.getPlaySection),
                    this.resourceMethod("get", 
                        "recite/sutta/:sutta_uid/:language/:translator", 
                        this.getReciteSutta),
                    this.resourceMethod("get", 
                        "review/sutta/:sutta_uid/:language/:translator", 
                        this.getReviewSutta),
                    this.resourceMethod("get", 
                        "download/sutta/:sutta_uid/:language/:translator/:usage", 
                        this.getDownloadSutta, this.audioMIME),
                    this.resourceMethod("get", 
                        "download/playlist/:langs/:voice/:pattern",
                        this.getDownloadPlaylist, this.audioMIME),
                    this.resourceMethod("get", "sutta/:sutta_uid/:language/:translator", 
                        this.getSutta),
                    this.resourceMethod("get", "search/:pattern", 
                        this.getSearch),
                    this.resourceMethod("get", "examples/:n", 
                        this.getExamples),
                    this.resourceMethod("get", "wiki-aria/:page", 
                        this.getWikiAria),
                    this.resourceMethod("get", "debug/ephemerals", 
                        this.getDebugEphemerals),
                    this.resourceMethod("post", "login", 
                        this.postLogin),

                ]),
            });
        }

        initialize() {
            var that = this;
            logger.info(`ScvRest initialize() BEGIN`);
            var superInit = super.initialize;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    await that.suttaCentralApi.initialize();
                    await that.suttaFactory.initialize();
                    await that.suttaStore.initialize();
                    var result = await superInit.call(that);
                    logger.info(`ScvRest initialize() COMPLETED`);
                    resolve(result);
                } catch(e) {
                    logger.error(e.stack);
                    reject(e);
                }})();
            });
        }

        getAudio(req, res, next) {
            return new Promise((resolve, reject) => { try {
                var guid = req.params.guid;
                var filePath = this.soundStore.guidPath(guid);
                var filename = req.params.filename;
                var data = fs.readFileSync(filePath);
                res.set('accept-ranges', 'bytes');
                res.set('do_stream', 'true');
                filename && res.set('Content-disposition', 
                    'attachment; filename=' + filename);

                resolve(data);
            } catch (e) { reject(e) } });
        }

        suttaParms(req) {
            var parms = Object.assign({
                language: 'en',
                usage: 'recite',
                iSection: 0,
                scid: null,
                iVoice: 0,
            }, req.params);
            parms.iSection = Number(parms.iSection);
            parms.iVoice = Number(parms.iVoice);
            parms.sutta_uid = parms.sutta_uid || parms.scid && parms.scid.split(':')[0];
            return parms;
        }

        reciteSection(req, res, next, usage) {
            var that = this;
            var { sutta_uid, language, translator, iSection } = that.suttaParms(req);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await that.suttaFactory.loadSutta({
                        scid: sutta_uid,
                        translator,
                        language,
                        expand: true,
                    });
                    if (iSection < 0 || sutta.sections.length <= iSection) {
                        var suttaRef = `${sutta_uid}/${language}/${translator}`;
                        throw new Error(`Sutta ${suttaRef} has no section:${iSection}`);
                    }
                    var lines = Sutta.textOfSegments(sutta.sections[iSection].segments);
                    var text = `${lines.join('\n')}\n`;
                    var voice = Voice.createVoice({
                        language,
                        usage,
                        soundStore: that.soundStore,
                        languageUnknown: "pli",
                        audioFormat: that.soundStore.audioFormat,
                        audioSuffix: that.soundStore.audioSuffix,
                    });
                    var result = await voice.speak(text, {
                        cache: true, // false: use TTS web service for every request
                        usage,
                    });
                    resolve({
                        usage,
                        name: voice.name,
                        sutta_uid,
                        language,
                        translator,
                        section:iSection,
                        guid: result.signature.guid,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        synthesizeSutta(sutta_uid, language, translator, usage) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await that.suttaFactory.loadSutta({
                        scid: sutta_uid,
                        translator,
                        language,
                        expand: true,
                    });
                    var preamble = [
                        `suttacentral voice recording\n`,
                        `{${sutta.suttaCode}}\n`,
                    ].join('');
                    var lines = Sutta.textOfSegments(sutta.segments);
                    var text = `${preamble}\n${lines.join('\n')}\n`;
                    var voice = Voice.createVoice({
                        language,
                        usage,
                        soundStore: that.soundStore,
                        languageUnknown: "pli",
                        audioFormat: that.soundStore.audioFormat,
                        audioSuffix: that.soundStore.audioSuffix,
                    });
                    var msStart = Date.now();
                    if (lines.length > 750) {
                        logger.info(`synthesizeSutta()`+
                            `lines:${lines.length} text:${text.length*2}B`);
                    }
                    var result = await voice.speak(text, {
                        cache: true, // false: use TTS web service for every request
                        usage,
                    });
                    logger.info(`synthesizeSutta() ms:${Date.now()-msStart} `+
                        `${text.substring(0,50)}`);
                    resolve({
                        usage,
                        name: voice.name,
                        sutta_uid,
                        language,
                        translator,
                        guid: result.signature.guid,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        getReciteSection(req, res, next) {
            var promise =  this.reciteSection(req, res, next, 'recite');
            promise.catch(e => {
                console.error(e.stack);
            });
            return promise;
        }

        getReviewSection(req, res, next) {
            return this.reciteSection(req, res, next, 'review');
        }

        getPlaySection(req, res, next) {
            var that = this;
            var { 
                sutta_uid, language, translator, iSection, iVoice 
            } = this.suttaParms(req);
            var suttaRef = `${sutta_uid}/${language}/${translator}`;
            logger.info(`GET play/section/${suttaRef}/${iSection}/${iVoice}`);
            var usage = VOICES[iVoice].usage || 'recite';
            var voiceName = VOICES[iVoice].name || 'Amy';
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await that.suttaFactory.loadSutta({
                        scid: sutta_uid,
                        translator,
                        language,
                        expand: true,
                    });
                    if (iSection < 0 || sutta.sections.length <= iSection) {
                        throw new Error(`Sutta ${suttaRef} has no section:${iSection}`);
                    }
                    var voicePali = that.voicePali;
                    var section = sutta.sections[iSection];
                    var segments = [];
                    for (var iSeg = 0; iSeg < section.segments.length; iSeg++) {
                        var segment = Object.assign({}, section.segments[iSeg]);
                        segment.audio = {};
                        segments.push(segment);
                    }
                    resolve({
                        sutta_uid,
                        language,
                        translator,
                        title: section.title,
                        section:iSection,
                        nSections: sutta.sections.length,
                        iVoice,
                        segments,
                        voiceLang: VOICES[iVoice].name,
                        voicePali: voicePali.name,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        getPlaySegment(req, res, next) {
            var that = this;
            var { 
                sutta_uid, language, translator, scid, iVoice 
            } = this.suttaParms(req);
            var suttaRef = `${sutta_uid}/${language}/${translator}`;
            logger.info(`GET play/segment/${suttaRef}/${scid}/${iVoice}`);
            var usage = VOICES[iVoice].usage || 'recite';
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await that.suttaFactory.loadSutta({
                        scid: sutta_uid,
                        translator,
                        language,
                        expand: true,
                    });
                    if (iSection < 0 || sutta.sections.length <= iSection) {
                        throw new Error(`Sutta ${suttaRef} has no section:${iSection}`);
                    }
                    var voiceLang = Voice.createVoice({
                        name: VOICES[iVoice].name,
                        usage,
                        soundStore: that.soundStore,
                        languageUnknown: "pli",
                        audioFormat: that.soundStore.audioFormat,
                        audioSuffix: that.soundStore.audioSuffix,
                    });
                    var voicePali = that.voicePali;
                    var sections = sutta.sections;
                    var iSegment = sutta.segments
                        .reduce((acc,seg,i) => seg.scid == scid ? i : acc, null);
                    if (iSegment == null) {
                        throw new Error(`segment ${scid} not found`);
                    }
                    var segment = sutta.segments[iSegment];
                    var iSection = 0;
                    var section = sutta.sections[iSection];
                    for (let i=iSegment; section && (section.segments.length <= i); ) {
                        i -= section.segments.length;
                        section = sutta.sections[++iSection];
                    }
                    segment.audio = {};
                    if (segment[language]) {
                        var speak = await voiceLang.speak(segment[language], {
                            usage,
                        });
                        segment.audio[language] = speak.signature.guid;
                    }
                    if (segment.pli) {
                        var speak = await voicePali.speak(segment.pli, {
                            usage: 'recite',
                        });
                        segment.audio.pli = speak.signature.guid;
                    }
                    resolve({
                        sutta_uid,
                        scid,
                        language,
                        translator,
                        title: section.title,
                        section:iSection,
                        nSections: sutta.sections.length,
                        iVoice,
                        iSegment,
                        segment,
                        voiceLang: voiceLang.name,
                        voicePali: voicePali.name,
                    });
                } catch(e) { reject(e); } })();
            });
        }


        getReciteSutta(req, res, next) {
            var { sutta_uid, language, translator } = this.suttaParms(req);
            return this.synthesizeSutta(sutta_uid, language, translator, 'recite');
        }

        getReviewSutta(req, res, next) {
            var { sutta_uid, language, translator } = this.suttaParms(req);
            return this.synthesizeSutta(sutta_uid, language, translator, 'review');
        }

        getDownloadSutta(req, res, next) {
            var that = this;
            return new Promise((resolve, reject) => { try {
                (async function() { try {
                    var { sutta_uid, language, translator, usage } = that.suttaParms(req);
                    var {
                        guid,
                    } = await that.synthesizeSutta(sutta_uid, language, translator, usage);
                    var filePath = that.soundStore.guidPath(guid);
                    var audioSuffix = that.soundStore.audioSuffix;
                    var filename = `${sutta_uid}-${language}-${translator}${audioSuffix}`;
                    var data = fs.readFileSync(filePath);
                    res.set('Content-disposition', 'attachment; filename=' + filename);
                    logger.info(`GET download/sutta => ` +
                        `${filename} size:${data.length} ${guid}`);
                    res.cookie('download-date',new Date());
                    resolve(data);
                } catch(e) {reject(e);} })();
            } catch(e) {reject(e);} });
        }

        getSutta(req, res, next) {
            var that = this;
            var language = req.params.language || 'en';
            var sutta_uid = req.params.sutta_uid || 'mn1';
            var translator = req.params.translator || 'sujato';
            var iSection = Number(req.params.iSection == null ? 0 : req.params.iSection);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await that.suttaFactory.loadSutta({
                        scid: sutta_uid,
                        translator,
                        language,
                        expand: true,
                    });
                    logger.info(`GET sutta => ${sutta_uid}/${language}/${translator}`);
                    resolve(sutta);
                } catch(e) { reject(e); } })();
            });
        }

        getSearch(req, res, next) {
            var that = this;
            var language = req.query.language || 'en';
            var pattern = req.params.pattern;
            if (!pattern) {
                return Promise.reject(new Error('Search pattern is required'));
            }
            var maxResults = Number(req.query.maxResults || that.suttaStore.maxResults);
            if (isNaN(maxResults)) {
                return Promise.reject(new Error('Expected number for maxResults'));
            }
            var promise = that.suttaStore.search({
                pattern,
                language,
                maxResults,
            });
            promise.then(sr => {
                var {
                    method,
                    results,
                } = sr;
                logger.info(`GET search(${pattern}) ${method} => ${results.map(r=>r.uid)}`);
            });
            return promise;
        }

        getDownloadPlaylist(req, res, next) {
            var that = this;
            if (!that.initialized) {
                return Promise.reject(new Error(
                    `${that.constructor.name} is not initialized`));
            }
            var langs = (req.params.langs || 'pli+en').toLowerCase().split('+');
            var language = req.query.lang || 'en';
            var vname = (req.params.voice || 'Amy').toLowerCase();
            var pattern = req.params.pattern;
            if (!pattern) {
                return Promise.reject(new Error('Search pattern is required'));
            }
            var usage = req.query.usage || 'recite';
            var maxResults = Number(req.query.maxResults || that.suttaStore.maxResults);
            if (isNaN(maxResults)) {
                return Promise.reject(new Error('Expected number for maxResults'));
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    try {
                    var playlist = await that.suttaStore.createPlaylist({
                        pattern,
                        languages: langs,
                        language,
                        maxResults,
                    });
                    } catch(e) {
                        console.log(`oopsie`, e.stack);
                        resolve(e.stack.toString());
                        return;
                    }
                    var stats = playlist.stats();
                    var voiceLang = Voice.createVoice({
                        name: vname,
                        usage,
                        soundStore: that.soundStore,
                        languageUnknown: "pli",
                        audioFormat: that.soundStore.audioFormat,
                        audioSuffix: that.soundStore.audioSuffix,
                    });
                    var audio = await playlist.speak({
                        voices: {
                            pli: that.voicePali,
                            [language]: voiceLang,
                        }
                    });
                    var result = {
                        audio,
                    }
                    var guid = audio.signature.guid;
                    var filePath = that.soundStore.guidPath(guid);
                    var audioSuffix = that.soundStore.audioSuffix;
                    var uriPattern = encodeURIComponent(
                        decodeURIComponent(pattern)
                            .replace(/[ ,\t]/g,'_')
                            .replace(/[\/]/g, '-')
                    );
                    var filename = `${uriPattern}_${langs.join('+')}_${vname}`+
                        `${audioSuffix}`;
                    var data = fs.readFileSync(filePath);
                    res.set('Content-disposition', 'attachment; filename=' + filename);
                    logger.info(`GET download/${langs}/${pattern} => ` +
                        `${filename} size:${data.length} secs:${stats.duration} ${guid}`);
                    res.cookie('download-date',new Date());
                    resolve(data);
                } catch(e) {
                    reject(e);
                } })();
            });
        }

        getExamples(req, res, next) {
            var language = req.query.language || 'en';
            var n = Number(req.params.n);
            n = Math.max(1, isNaN(n) ? 3 : n);
            var examples = this.examples;
            if (examples == null) {
                var fname = `examples-${language}.txt`;
                var fpath = path.join(PATH_EXAMPLES, fname);
                if (fs.existsSync(fpath)) {
                    examples = this.examples = fs.readFileSync(fpath)
                        .toString()
                        .trim()
                        .split('\n');
                } else {
                    logger.warn(`File not found: ${fpath}`);
                    throw new Error(`File not found: ${fname}`);
                }
            }
            var nShuffle = examples.length;
            for (var i = 0; i < nShuffle; i++) {
                var j = Math.trunc(Math.random() * examples.length);
                var t = examples[i];
                examples[i] = examples[j];
                examples[j] = t;
            }
            
            return examples.slice(0, n);
        }

        getWikiAria(req, res, next) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var page = req.query.page || 'Home.md';
                    var result = `${page} not found`;
                    var wikiUrl  = `${that.wikiUrl}/${page}`;
                    var httpx = wikiUrl.startsWith('https') ? https : http;
                    var httpOpts = Object.assign({
                        headers: {
                            "Cache-Control": "no-cache",
                            //"Pragma": "no-cache",
                        },
                    }, URL.parse(wikiUrl));
                    var wikiReq = httpx.get(httpOpts, function(wikiRes) {
                        const { statusCode } = wikiRes;
                        const contentType = wikiRes.headers['content-type'];

                        let error;
                        if (statusCode !== 200 && statusCode !== 302) {
                            error = new Error('Request Failed.\n' +
                                              `Status Code: ${statusCode}`);
                        } else if (/^text\/html/.test(contentType)) {
                            // OK
                        } else if (/^text\/plain/.test(contentType)) {
                            // OK
                        } else {
                            error = new Error('Invalid content-type.\n' +
                              `Expected application/json but received ${contentType}`);
                        }
                        if (error) {
                            wikiRes.resume(); // consume response data to free up memory
                            logger.error(error.stack);
                            reject(error);
                            return;
                        }

                        wikiRes.setEncoding('utf8');
                        let rawData = '';
                        wikiRes.on('data', (chunk) => { rawData += chunk; });
                        wikiRes.on('end', () => {
                            try {
                                var md = rawData.toString();
                                var html = that.mdAria.toHtml(md);
                                resolve({
                                    url: wikiUrl,
                                    html:html,
                                });
                            } catch (e) {
                                logger.error(e.stack);
                                reject(e);
                            }
                        });
                    }).on('error', (e) => {
                        reject(e);
                    }).on('timeout', (e) => {
                        logger.error(e);
                        wikiReq.abort();
                    });
                } catch(e) { reject(e); } })();
            });
        }

        getDebugEphemerals(req, res, next) {
            return {
                ephemeralAge: this.soundStore.ephemeralAge,
                ephemeralInterval: this.soundStore.ephemeralInterval,
                ephemerals: this.soundStore.ephemerals,
            }
        }

        authenticate(username, password) {
            logger.info(`ScvRest.authenticate(${username})`);
            return this.userStore.authenticate(username, password);
        }

        postLogin(req, res, next) {
            var that = this;
            var {
                username,
                password,
            } = req.body || {};

            return new Promise((resolve, reject) => {
                (async function() { try {
                    var authuser = await that.authenticate(username, password);
                    if (authuser == null) {
                        res.locals.status = 401;
                        logger.warn(`POST login ${username} => HTTP401 UNAUTHORIZED`);
                        throw new Error('Invalid username/password');
                    }
                    delete authuser.credentials;
                    logger.info(`POST login ${username} => OK`);
                    var token = jwt.sign(authuser, SECRET, {
                        expiresIn: '1h',
                    });
                    resolve(token);
                } catch(e) {reject(e);} })();
            });
        }
    }

    module.exports = exports.ScvRest = ScvRest;
})(typeof exports === "object" ? exports : (exports = {}));

