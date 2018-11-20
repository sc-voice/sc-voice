
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
        RestBundle,
    } = require('rest-bundle');
    const srcPkg = require("../../package.json");
    const Words = require('./words');
    const GuidStore = require('./guid-store');
    const Section = require('./section');
    const Sutta = require('./sutta');
    const SuttaFactory = require('./sutta-factory');
    const SuttaStore = require('./sutta-store');
    const SuttaCentralApi = require('./sutta-central-api');
    const PoParser = require('./po-parser');
    const Voice = require('./voice');
    const SuttaCentralId = require('./sutta-central-id');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds/');

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

    class ScvRest extends RestBundle { 
        constructor(opts = {
            audioFormat: 'mp3',
        }) {
            super(opts.name || 'scv', Object.assign({
                srcPkg,
            }, opts));
            logger.info(`ScvRest.ctor(${this.name})`);
            if (opts.audioFormat === 'ogg') {
                this.audioSuffix = '.ogg';
                this.audioFormat = 'ogg_vorbis';
                this.audioMIME = 'audio/ogg';
            } else if (opts.audioFormat == null || opts.audioFormat === 'mp3') {
                this.audioSuffix = '.mp3';
                this.audioFormat = 'mp3';
                this.audioMIME = 'audio/mp3';
            } else {
                throw new Error(`unsupported audioFormat:${opts.audioFormat}`);
            }
            this.soundStore = new GuidStore({
                storeName: 'sounds',
                storePath: PATH_SOUNDS,
                suffix: this.audioSuffix,
            });
            this.suttaCentralApi = opts.suttaCentralApi || new SuttaCentralApi();
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
                autoSection: true,
            });
            this.voicePali = Voice.createVoice({
                name: 'Aditi',
                usage: 'recite',
                language: 'hi-IN',
                stripNumbers: true,
                stripQuotes: true,
                languageUnknown: "pli",
                audioFormat: this.audioFormat,
                audioSuffix: this.audioSuffix,
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
                    this.resourceMethod("get", "sutta/:sutta_uid/:language/:translator", 
                        this.getSutta),
                    this.resourceMethod("get", "search/:pattern", 
                        this.getSearch),

                ]),
            });
        }

        initialize() {
            var that = this;
            var promise = super.initialize();
            promise.then(() => {
                (async function(){ try {
                    await that.suttaCentralApi.initialize();
                    await that.suttaFactory.initialize();
                    await that.suttaStore.initialize();
                } catch(e) {
                    logger.error(e.stack);
                }})();
            });
            return promise;
        }

        getAudio(req, res, next) {
            return new Promise((resolve, reject) => { try {
                var guid = req.params.guid;
                var filePath = this.soundStore.guidPath(guid, this.audioSuffix);
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
                        languageUnknown: "pli",
                        audioFormat: that.audioFormat,
                        audioSuffix: that.audioSuffix,
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
                        languageUnknown: "pli",
                        audioFormat: that.audioFormat,
                        audioSuffix: that.audioSuffix,
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
                        languageUnknown: "pli",
                        audioFormat: that.audioFormat,
                        audioSuffix: that.audioSuffix,
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
                    var filePath = that.soundStore.guidPath(guid, that.audioSuffix);
                    var filename = `${sutta_uid}-${language}-${translator}${that.audioSuffix}`;
                    var data = fs.readFileSync(filePath);
                    res.set('Content-disposition', 'attachment; filename=' + filename);
                    logger.info(`GET download/sutta => ${filename} size:${data.length}`);
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
    }

    module.exports = exports.ScvRest = ScvRest;
})(typeof exports === "object" ? exports : (exports = {}));

