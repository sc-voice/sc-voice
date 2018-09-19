
(function(exports) {
    const winston = require('winston');
    const fs = require('fs');
    const path = require('path');
    const {
        RestBundle,
    } = require('rest-bundle');
    const srcPkg = require("../../package.json");
    const Words = require('./words');
    const Section = require('./section');
    const Sutta = require('./sutta');
    const SuttaFactory = require('./sutta-factory');
    const PoParser = require('./po-parser');
    const Voice = require('./voice');
    const SuttaCentralId = require('./sutta-central-id');
    const PATH_SOUNDS = path.join(__dirname, '../../local/sounds/');

    const EXPANDABLE_SUTTAS = {
        mn1: true,
        mn41: true, 
    };
    const SUPPORTED_TRANSLATORS = {
        sujato: true,
    };
    const SUPPORTED_LANGUAGES = {
        en: true,
    };

    class ScvRest extends RestBundle { 
        constructor(opts = {
            audioFormat: 'mp3',
        }) {
            super(opts.name || 'scv', Object.assign({
                srcPkg,
            }, opts));
            winston.info(`ScvRest.ctor(${this.name})`);
            if (opts.audioFormat === 'ogg') {
                this.audioSuffix = '.ogg';
                this.audioFormat = 'ogg_vorbis';
                this.audioMIME = 'audio/ogg';
            } else if (opts.audioFormat === 'mp3') {
                this.audioSuffix = '.mp3';
                this.audioFormat = 'mp3';
                this.audioMIME = 'audio/mp3';
            } else {
                throw new Error(`unsupported audioFormat:${opts.audioFormat}`);
            }
            Object.defineProperty(this, "handlers", {
                value: super.handlers.concat([
                    this.resourceMethod("get", "audio/:guid", this.getAudio, this.audioMIME),
                    this.resourceMethod("get", 
                        "recite/section/:suttaId/:language/:translator/:iSection", 
                        this.getReciteSection),
                    this.resourceMethod("get", 
                        "review/section/:suttaId/:language/:translator/:iSection", 
                        this.getReviewSection),
                    this.resourceMethod("get", "sutta/:suttaId/:language/:translator", 
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
                resolve(data);
            } catch (e) { reject(e) } });
        }

        reciteSection(req, res, next, name, usage) {
            var audioFormat = this.audioFormat;
            var audioSuffix = this.audioSuffix;
            var suttaId = req.params.suttaId || 'mn1';
            var language = req.params.language || 'en';
            if (SUPPORTED_LANGUAGES[language] !== true) {
                return Promise.reject(new Error(`SC-Voice does not support language: ${language}`));
            }
            var translator = req.params.translator || 'sujato';
            if (SUPPORTED_TRANSLATORS[translator] !== true) {
                return Promise.reject(new Error(`SC-Voice does not support translator: ${translator}`));
            }
            var iSection = Number(req.params.iSection == null ? 0 : req.params.iSection);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await SuttaFactory.loadSutta(suttaId);
                    if (EXPANDABLE_SUTTAS[suttaId]) {
                        sutta = new SuttaFactory().expandSutta(sutta);
                    }
                    if (iSection < 0 || sutta.sections.length <= iSection) {
                        throw new Error(`Sutta ${suttaId}/${translator} has no section:${iSection}`);
                    }
                    var lines = Sutta.textOfSegments(sutta.sections[iSection].segments);
                    var text = `${lines.join('\n')}\n`;
                    var voice = Voice.createVoice({
                        name,
                        languageUnknown: "pli",
                        audioFormat,
                        audioSuffix,
                    });
                    var result = await voice.speak(text, {
                        cache: true, // false: use TTS web service for every request
                        usage,
                    });
                    var guid = result.signature.guid;
                    resolve({
                        usage,
                        name,
                        suttaId,
                        language,
                        translator,
                        section:iSection,
                        guid,
                    });
                } catch(e) { reject(e); } })();
            });
        }

        getReciteSection(req, res, next) {
            return this.reciteSection(req, res, next, 'amy', 'recite');
        }

        getReviewSection(req, res, next) {
            return this.reciteSection(req, res, next, 'raveena', 'review');
        }

        getSutta(req, res, next) {
            var language = req.params.language || 'en';
            if (language !== 'en') { 
                return Promise.reject(new Error(`SC-Voice does not support language: ${language}`));
            }
            var suttaId = req.params.suttaId || 'mn1';
            var translator = req.params.translator || 'sujato';
            if (SUPPORTED_TRANSLATORS[translator] !== true) {
                return Promise.reject(new Error(`SC-Voice does not support translator: ${translator}`));
            }
            var iSection = Number(req.params.iSection == null ? 0 : req.params.iSection);
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var sutta = await SuttaFactory.loadSutta(suttaId);
                    if (EXPANDABLE_SUTTAS[suttaId]) {
                        sutta = new SuttaFactory().expandSutta(sutta);
                    }
                    resolve(sutta);
                } catch(e) { reject(e); } })();
            });
        }
    }

    module.exports = exports.ScvRest = ScvRest;
})(typeof exports === "object" ? exports : (exports = {}));

