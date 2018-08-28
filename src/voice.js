(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Polly = require('./polly');
    const Words = require('./words');

    class Voice { 
        constructor(opts={}) {
            this.language = opts.language || 'en-IN';
            this.service = opts.service || 'aws-polly';
            this.name = opts.name || 'Raveena';
            this.rates = opts.rates || {
                navigate: Voice.RATE_FAST,
                recite: Voice.RATE_SLOW,
            }
            this.gender = opts.gender || "female";
            this.usage = opts.usage || "recite";
            this.ipa = opts.ipa || {};
            this.pitch = opts.pitch || "-0%";
            Object.defineProperty(this, '_services', {
                writable: true,
                value: opts.services || null,
            });
        }

        static get RATE_FAST() { return "+5%"; }
        static get RATE_SLOW() { return "-20%"; }

        static loadVoices(voicePath) {
            voicePath == null && (voicePath = path.join(__dirname, '../words/voices.json'));
            var json = JSON.parse(fs.readFileSync(voicePath).toString());
            return json.map(voice => new Voice(voice));
        }

        static createVoice(opts) {
            if (typeof opts === 'string') {
                opts = {
                    language: opts,
                }
            } else if (opts == null) {
                opts = {
                    language: "en-IN"
                };
            }
            var voices = Voice.loadVoices();
            var voiceJson = 
                opts.language && voices.filter(v => v.language === opts.language)[0] ||
                opts.name && voices.filter(v => v.name === opts.name)[0];
            var ipa = voiceJson && voiceJson.ipa;
            if (ipa == null) {
                throw new Error("not implemented");
                var words = new Words();
                ipa = words.ipa;
            }
            voiceJson = Object.assign({
                ipa,
            }, voiceJson, opts);
            return new Voice(voiceJson);
        }

        get services() {
            if (this._services == null) {
                var words = this.voiceWords();
                this._services = {};
                Object.keys(this.rates).forEach(key => {
                    if (this.service === 'aws-polly') {
                        this._services[key] = new Polly({
                            words,
                            voice: this.name,
                            prosody: {
                                rate: this.rates[key],
                                pitch: this.pitch,
                            }
                        });
                    } else {
                        throw new Error(`unknown service:${this.service}`);
                    }
                });

            }
            return this._services;
        }

        voiceWords() {
            var words = new Words();
            words._ipa = this.ipa;
            return words;
        }

        speak(text, opts={}) {
            var usage = opts.usage || this.usage;
            var service = this.services[usage];
            if (service == null) {
                var avail = Object.keys(this.services);
                return Promise.reject(new Error(`Unsupported TTS service usage:${usage} available:${avail}`));
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = await service.synthesizeText(text, opts);
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

    }

    module.exports = exports.Voice = Voice;
})(typeof exports === "object" ? exports : (exports = {}));

