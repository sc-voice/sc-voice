(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const { MerkleJson } = require('merkle-json');
    const AbstractTTS = require('./abstract-tts');
    const SoundStore = require('./sound-store');
    const SRC = path.join(__dirname, '..');
    const ASSETS = path.join(SRC, 'assets');
    const NOAUDIOPATH = path.join(ASSETS, 'no_audio.mp3');

    class HumanTts extends AbstractTTS {
        constructor(opts={}) {
            super((opts = HumanTts.options(opts)));
            this.voice = opts.voice;
            this.api = opts.api;
            this.apiVersion = opts.apiVersion;
            this.language = opts.language;
            this.languageUnknown = opts.languageUnknown;
            this.noAudioPath = opts.noAudioPath;
            this.scAudio = opts.scAudio;
            this.altTts = opts.altTts;
            this.mj = opts.mj || new MerkleJson({
                hashTag: 'guid',
            });

            this.prosody = {
                rate: "0%",
            };
            logger.info([
                `HumanTts.ctor()`,
                `voice:${this.voice}`,
                `language:${this.language}`,
                `noAudioPath:${this.noAudioPath}`,
            ].join(' '));
        }

        static options(opts) {
            var language = opts.language || 'pli';
            var newOpts = Object.assign({
                noAudioPath: NOAUDIOPATH,
                audioFormat: 'mp3', // iPhone does not support OGG
                audioSuffix: '.mp3', // iPhone does not support OGG
                voice: 'sujato_pli',
                language,
                languageUnknown: language,
                api: 'human-tts',
                apiVersion: 'v1',
            }, opts);

            return newOpts;
        }

        serviceSynthesize(resolve, reject, request) {
            var that = this;
            var params = {
                Text:`<speak>${request.ssml}</speak>`,
                TextType: 'ssml',
                OutputFormat: that.audioFormat,
                VoiceId: that.voice,
                LanguageCode: that.language,
            }
            logger.info(`HumanTts.serviceSynthesize() ${JSON.stringify(request)}`);

            that.synthesizeResponse(resolve, reject, request);
        }

        synthesizeSegment(opts={}) {
            var {
                segment,
                scAudio,
                altTts,
                language,
                soundStore,
                translator,
                usage,
                volume,
                downloadAudio,
            } = opts;
            if (segment == null) {
                return Promise.reject(new Error(`synthesizeSegment() segment is required`));
            }
            if (language == null) {
                return Promise.reject(new Error(`synthesizeSegment() language is required`));
            }
            altTts = altTts || this.altTts;
            var {
                voice,
                mj,
                noAudioPath,
            } = this;
            soundStore = soundStore || this.soundStore;
            if (soundStore == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() soundStore is required`));
            }
            scAudio = scAudio || this.scAudio;
            if (scAudio == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() scAudio is required`));
            }
            var signature = {
                api: 'human-tts',
                suttaSegId: segment.scid, 
                language,
                author: translator,
                reader: voice,
                volume,
            };
            var result = {
                signature,
            }
            var guid = signature[mj.hashTag] = mj.hash(signature);
            var extSeg = scAudio.extSeg;
            var soundPath = soundStore.signaturePath(signature, extSeg);
            if (fs.existsSync(soundPath)) {
                result.file = soundPath;
                return Promise.resolve(result);
            }

            if (altTts == null) {
                result.file = noAudioPath;
                return Promise.resolve(result);
            }

            usage = usage || this.usage;
            var text = segment[language.split('-')[0]] || '(no text)';

            return altTts.synthesizeText(text, {
                scid: segment.scid,
                language,
                usage,
                volume,
            });
        }
    }

    module.exports = exports.HumanTts = HumanTts;
})(typeof exports === "object" ? exports : (exports = {}));

