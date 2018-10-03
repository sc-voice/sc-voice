
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
        RestBundle,
    } = require('rest-bundle');
    const srcPkg = require("../../package.json");
    const Words = require('./words');
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
            this.suttaCentralApi = opts.suttaCentralApi;
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi: this.suttaCentralApi,
            });
            Object.defineProperty(this, "handlers", {
                value: super.handlers.concat([
                    this.resourceMethod("get", "audio/:guid", this.getAudio, this.audioMIME),
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
                    this.resourceMethod("get", "sutta/:sutta_uid/:language/:translator", 
                        this.getSutta),

                ]),
            });
        }

        getAudio(req, res, next) {
            return new Promise((resolve, reject) => { try {
                var guid = req.params.guid;
                var folder = guid.substring(0, 2);
                var root = path.join(PATH_SOUNDS, guid.substring(0,2));
                var filePath = path.join(root, `${guid}${this.audioSuffix}`);
                var data = fs.readFileSync(filePath);
                res.set('accept-ranges', 'bytes');
                res.set('do_stream', 'true');
                resolve(data);
            } catch (e) { reject(e) } });
        }

        suttaRef(req) {
            return {
                sutta_uid: req.params.sutta_uid || 'mn1',
                language: req.params.language || 'en',
                translator: req.params.translator || 'sujato', // TODO
            };
        }

        reciteSection(req, res, next, name, usage) {
            var that = this;
            var { sutta_uid, language, translator } = that.suttaRef(req);
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
                        name,
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
                        name,
                        sutta_uid,
                        language,
                        translator,
                        section:iSection,
                        guid: result.signature.guid,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        reciteSutta(req, res, next, name, usage) {
            var that = this;
            var { sutta_uid, language, translator } = that.suttaRef(req);
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
                        name,
                        languageUnknown: "pli",
                        audioFormat: that.audioFormat,
                        audioSuffix: that.audioSuffix,
                    });
                    var msStart = Date.now();
                    var result = await voice.speak(text, {
                        cache: true, // false: use TTS web service for every request
                        usage,
                    });
                    logger.info(`reciteSutta() ms:${Date.now()-msStart} ${text.substring(0,50)}`);
                    resolve({
                        usage,
                        name,
                        sutta_uid,
                        language,
                        translator,
                        guid: result.signature.guid,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        getReciteSection(req, res, next) {
            var promise =  this.reciteSection(req, res, next, 'amy', 'recite');
            promise.catch(e => {
                console.error(e.stack);
            });
            return promise;
        }

        getReviewSection(req, res, next) {
            return this.reciteSection(req, res, next, 'raveena', 'review');
        }

        getReciteSutta(req, res, next) {
            var promise =  this.reciteSutta(req, res, next, 'amy', 'recite');
            promise.catch(e => {
                console.error(e.stack);
            });
            return promise;
        }

        getReviewSutta(req, res, next) {
            return this.reciteSutta(req, res, next, 'raveena', 'review');
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

