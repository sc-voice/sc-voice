
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
    const SuttaCentralApi = require('./sutta-central-api');
    const PoParser = require('./po-parser');
    const Voice = require('./voice');
    const SuttaCentralId = require('./sutta-central-id');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds/');

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
            this.suttaCentralApi = opts.suttaCentralApi;
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
            });
            Object.defineProperty(this, "handlers", {
                value: super.handlers.concat([
                    this.resourceMethod("get", 
                        "audio/:guid/:filename", this.getAudio, this.audioMIME),
                    this.resourceMethod("get", 
                        "recite/section/:sutta_uid/:language/:translator/:iSection", 
                        this.getReciteSection),
                    this.resourceMethod("get", 
                        "review/section/:sutta_uid/:language/:translator/:iSection", 
                        this.getReviewSection),
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

                ]),
            });
        }

        getAudio(req, res, next) {
            return new Promise((resolve, reject) => { try {
                var guid = req.params.guid;
                var filePath = this.soundStore.guidPath(guid, this.audioSuffix);
                var filename = req.params.filename;
                var data = fs.readFileSync(filePath);
                res.set('accept-ranges', 'bytes');
                res.set('do_stream', 'true');
                res.set('Content-disposition', 'attachment; filename=' + filename);

                resolve(data);
            } catch (e) { reject(e) } });
        }

        suttaParms(req) {
            return {
                sutta_uid: req.params.sutta_uid || 'mn1',
                language: req.params.language || 'en',
                translator: req.params.translator || 'sujato', // TODO
                usage: req.params.usage || 'recite',
            };
        }

        reciteSection(req, res, next, usage) {
            var that = this;
            var { sutta_uid, language, translator } = that.suttaParms(req);
            var iSection = Number(req.params.iSection == null ? 0 : req.params.iSection);
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
                    resolve(sutta);
                } catch(e) { reject(e); } })();
            });
        }
    }

    module.exports = exports.ScvRest = ScvRest;
})(typeof exports === "object" ? exports : (exports = {}));

