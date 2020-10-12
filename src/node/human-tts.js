(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    const { MerkleJson } = require('merkle-json');
    const AbstractTTS = require('./abstract-tts');
    const SoundStore = require('./sound-store');
    const SCAudio = require('./sc-audio');
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
            this.localeIPA = opts.localeIPA;
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
                `scAudio:${!!this.scAudio})`,
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
                localeIPA: language,
                api: 'human-tts',
                apiVersion: 'v1',
            }, opts);

            return newOpts;
        }

        synthesizeBreak(index) {
            var {
                altTts,
            } = this;

            return altTts
                ? altTts.synthesizeBreak(index)
                : super.syntthesizeBreak(index);
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
            logger.info(`HumanTts.serviceSynthesize(`+
                `${this.voice}) ${JSON.stringify(request)}`);

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
            var that = this;
            if (segment == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() segment is required`));
            }
            if (language == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() language is required`));
            }
            downloadAudio = !(downloadAudio === false);
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
            var scid = segment.scid;
            var suttaSegId = scid;
            var author = translator;
            var signature = {
                api: 'human-tts',
                suttaSegId,
                language,
                author,
                reader: voice,
                volume, // TODO remove
                scAudioVersion: SCAudio.VERSION,
            };
            var result = {
                signature,
            }
            var guid = signature[mj.hashTag] = mj.hash(signature);
            var audioPath = soundStore
                .signaturePath(signature, scAudio.extSeg); // .webm
            var soundPath = soundStore.signaturePath(signature); // .mp3
            var stats = fs.existsSync(soundPath) && fs.statSync(soundPath);
            if (stats && stats.size > this.ERROR_SIZE) {
                result.file = soundPath;
                return Promise.resolve(result);
            }
            usage = usage || this.usage;
            var text = segment[language.split('-')[0]] || '(no text)';
            var altVolume = altTts && SoundStore.suttaVolumeName(
                suttaSegId, language, translator, altTts.voice);
            var altArgs = {
                scid,
                language,
                usage,
                volume: altVolume || volume,
            };

            if (altTts == null || downloadAudio) {
                return new Promise((resolve, reject) => {
                    (async function() { try {
                        var scaResult = await scAudio.downloadSegmentAudio({
                            suttaSegId,
                            language,
                            author,
                            audioPath,
                        });
                        if (fs.existsSync(soundPath)) {
                            result.file = soundPath;
                            resolve(result);
                        } else {
                            result.file = noAudioPath;
                            reject(new Error(`no ${language} audio `+
                                `file:${soundPath} for:${suttaSegId}`
                            ));
                        }
                    } catch(e) {
                        if (altTts == null) {
                            logger.warn(`synthesizeSegment() failed `+
                                `with no altTts`);
                            reject(e);
                        } else {
                            var resAlt = await altTts
                                .synthesizeText(text, altArgs);
                            resAlt.altTts = altTts.voice;
                            resolve(resAlt);
                        }
                    } })();
                });
            }

            return new Promise((resolve, reject) => {
                (async function() { try {
                    var resAlt = await altTts.synthesizeText(text, altArgs);
                    resAlt.altTts = altTts.voice;
                    resolve(resAlt);
                } catch(e) {reject(e);} })();
            });
        }
    }

    module.exports = exports.HumanTts = HumanTts;
})(typeof exports === "object" ? exports : (exports = {}));

