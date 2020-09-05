(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const Voice = require('./voice');
    const SoundStore = require('./sound-store');
    const SCAudio = require('./sc-audio');

    class VoiceFactory { 
        constructor(opts={}) {
            (opts.logger || logger).logInstance(this);
            this.voices = {};
            this.scAudio = opts.scAudio || new SCAudio();
            this.soundStore = opts.soundStore || new SoundStore();
            this.audioFormat = opts.audioFormat || this.soundStore.audioFormat;
            this.audioSuffix = opts.audioSuffix || this.soundStore.audioSuffix;
            this.usage = opts.usage || 'recite';
            this.localeIPA = opts.localeIPA || 'pli';
        }

        voiceOfName(name="Amy") {
            var that = this;
            name = name.toLowerCase();
            var voice = this.voices[name];
            if (voice == null) {
                that.info(`creating voice:${name}`);
                var {
                    audioFormat,
                    audioSuffix,
                    soundStore,
                    scAudio,
                    localeIPA,
                    usage,
                } = this;
                voice = Voice.createVoice({
                    name,
                    usage,
                    soundStore,
                    localeIPA,
                    audioFormat,
                    audioSuffix,
                    scAudio,
                });
                this.voices[name] = voice;
            }
            return voice;
        }

    }

    module.exports = exports.VoiceFactory = VoiceFactory;
})(typeof exports === "object" ? exports : (exports = {}));

