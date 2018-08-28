(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Polly = require('./polly');
    const Words = require('./words');

    function eqIgnoreCase(a,b) {
        a = a.toLocaleLowerCase();
        b = b.toLocaleLowerCase();
        return a.localeCompare(b) === 0;
    }

    class Voice { 
        constructor(opts={}) {
            this.language = opts.language || 'en-IN';
            this.languageUnknown = opts.languageUnknown || this.language;
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
            var voices = Voice.loadVoices();
            if (typeof opts === 'string') {
                var voiceJson = voices.filter(v => v.language.match(`^${opts}`))[0];
                if (voiceJson) {
                    opts = {
                        language: opts,
                    }
                } else {
                    var voiceJson = voices.filter(v => eqIgnoreCase(v.name, opts))[0];
                    if (voiceJson) {
                        opts = {
                            name: opts,
                        }
                    }
                } 
                if (voiceJson == null) {
                    throw new Error(`Could not create voice:${opts}`);
                }
            } else if (opts == null) {
                opts = {
                    language: "en-IN"
                };
            }
            if (voiceJson == null) {
                var voiceJson = 
                    opts.language && voices.filter(v => v.language.match(`^${opts.language}`))[0] ||
                    opts.name && voices.filter(v => eqIgnoreCase(v.name, opts.name))[0];
                if (voiceJson == null) {
                    throw new Error(`Could not find pre-defined voice:${JSON.stringify(opts)}`);
                }
            }
            if (voiceJson.ipa == null) {
                throw new Error(`Expected IPA lexicon for pre-configured voice: ${voiceJson.name}`);
            }
            var voiceOpts = Object.assign({}, voiceJson, opts);
            voiceOpts.language = voiceJson.language;
            voiceOpts.name = voiceJson.name;
            return new Voice(voiceOpts);
        }

        get services() {
            if (this._services == null) {
                var words = this.voiceWords();
                this._services = {};
                Object.keys(this.rates).forEach(key => {
                    if (this.service === 'aws-polly') {
                        this._services[key] = new Polly({
                            words,
                            language: this.language,
                            languageUnknown: this.languageUnknown,
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

