(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const AbstractTTS = require('./abstract-tts');
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
    }

    module.exports = exports.HumanTts = HumanTts;
})(typeof exports === "object" ? exports : (exports = {}));

