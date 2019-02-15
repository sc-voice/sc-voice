(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('rest-bundle');
    const SoundStore = require('./sound-store');
    const Voice = require('./voice');
    const ROOT_PATH = path.join(process.cwd(), 'local', 'vm');

    class VoiceModule {
        constructor(opts={}) {
            this.rootPath = opts.rootPath || ROOT_PATH;
            this.name = opts.name || "no-name";
            var storePath = path.join(this.rootPath, this.name);
            this.storePath = storePath;

            // Voice options
            this.voiceName = opts.voiceName || 'Aditi';
            this.language = opts.language || 'hi-IN';
            this.stripNumbers = opts.stripNumbers == null ? true : opts.stripNumbers;
            this.stripQuotes = opts.stripQuotes == null ? true : opts.stripQuotes;
            this.usage = !!opts.usage || 'recite';
            this.languageUnknown = opts.languageUnknown || 'pli';

        }

        initialize() {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = {};
                    var soundStore = new SoundStore({
                        storePath: that.storePath,
                    });
                    that.soundStore = soundStore;
                    that.voice = Voice.createVoice({
                        name: that.voiceName,
                        usage: that.usage,
                        language: that.language,
                        soundStore,
                        stripNumbers: that.stripNumbers,
                        stripQuotes: that.stripQuotes,
                        languageUnknown: that.languageUnknown,
                        audioFormat: soundStore.audioFormat,
                        audioSuffix: soundStore.audioSuffix,
                    });

                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

    }

    module.exports = exports.VoiceModule = VoiceModule;
})(typeof exports === "object" ? exports : (exports = {}));

