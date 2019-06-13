(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Polly = require('./polly');
    const HumanTts = require('./human-tts');
    const Words = require('./words');
    const SoundStore = require('./sound-store');
    var voicesCache;

    function eqIgnoreCase(a,b) {
        a = a.toLocaleLowerCase();
        b = b.toLocaleLowerCase();
        return a.localeCompare(b) === 0;
    }

    class Voice { 
        constructor(opts={}) {
            this.stripNumbers = opts.stripNumbers;
            this.stripQuotes = opts.stripQuotes;
            this.locale = opts.locale || "en-IN";
            this.langSeg = opts.langSeg || 'en';
            this.langUnknown = opts.langUnknown || this.langSeg;
            this.fullStopComma = opts.fullStopComma;
            this.service = opts.service || 'aws-polly';
            this.name = opts.name || 'Raveena';
            this.label = opts.label || this.name;
            this.rates = opts.rates || {
                navigate: Voice.RATE_FAST,
                recite: Voice.RATE_SLOW,
            }
            this.scAudio = opts.scAudio;
            this.gender = opts.gender || "female";
            this.noAudioPath = opts.noAudioPath;
            this.soundStore = opts.soundStore || new SoundStore(opts);
            this.ipa = opts.ipa || {};
            this.pitch = opts.pitch || "-0%";
            this.usage = opts.usage || 'recite';
            this.usages = opts.usages || {[this.usage]:{}};
            this.customWords = opts.customWords;
            this.syllableVowels = opts.syllableVowels;
            this.syllabifyLength = opts.syllabifyLength;
            this.altTts = opts.altTts;
            this.iVoice = opts.iVoice; // legacy
            this.maxSegment = opts.maxSegment;
            Object.defineProperty(this, '_services', {
                writable: true,
                value: opts.services || null,
            });
            Object.defineProperty(this, 'language', { // deprecated
                get: () => {
                    throw new Error('language is deprecated');
                },
            });
        }

        static get RATE_FAST() { return "+5%"; }
        static get RATE_SLOW() { return "-20%"; }

        static loadVoices(voicePath) {
            if (voicesCache) {
                return voicesCache;
            }
            voicePath == null && (voicePath = path.join(__dirname, '../../words/voices.json'));
            var json = JSON.parse(fs.readFileSync(voicePath).toString());
            voicesCache = json.map(voiceOpts => new Voice(voiceOpts));
            return voicesCache;
        }

        static voiceOfName(name="Amy") {
            var voices = Voice.loadVoices();
            var iVoice = Number(name);
            if (!isNaN(iVoice)) {
                return voices.reduce((acc, voice) => {
                    if (iVoice===Number(voice.iVoice)) {
                        return voice;
                    }
                    return acc;
                }, null);
            }
            var lowername = name.toLowerCase();
            return voices.reduce((acc, voice) => {
                if (voice.name.toLowerCase() === lowername) {
                    return voice;
                }
                return acc;
            }, null);
        }

        static createVoice(opts) {
            var voices = Voice.loadVoices();
            if (opts === 'navigate' || opts === 'review' || opts === 'recite') {
                opts = {
                    usage: opts,
                }
                console.log(`createVoice()`, opts);
            } else if (typeof opts === 'string') {
                var voiceJson = voices.filter(v => v.locale.match(`^${opts}`))[0];
                if (voiceJson) {
                    opts = {
                        locale: opts,
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
                    locale: "en-IN"
                };
            }
            if (voiceJson == null) {
                var voiceJson = voices.filter(v => {
                    if (opts.locale && !v.locale.match(`^${opts.locale}`)) {
                        return false;
                    }
                    if (opts.name && !eqIgnoreCase(v.name, opts.name)) {
                        return false;
                    }
                    if (opts.usage && !v.usages[opts.usage]) {
                        return false;
                    }
                    return true;
                }).sort((v1,v2) => {
                    if (opts.usage) {
                        var u1 = v1.usages[opts.usage];
                        var u2 = v2.usages[opts.usage];
                        var p1 = u1 && u1.priority || 0;
                        var p2 = u2 && u2.priority || 0;
                        if (p1 === p2) {
                            return v1.name.localeCompare(v2.name);
                        }
                        return p2 - p1;
                    } else {
                        return v1.name.localeCompare(v2.name);
                    }
                })[0];
                if (voiceJson == null) {
                    throw new Error(`Could not find pre-defined voice:`+
                        `${JSON.stringify(opts)}`);
                }
            }
            if (voiceJson.ipa == null) {
                throw new Error(`Expected IPA lexicon for pre-configured voice: `+
                    `${voiceJson.name}`);
            }
            var voiceOpts = Object.assign({}, voiceJson);
            voiceOpts = Object.assign(voiceOpts, opts);
            voiceOpts.locale = voiceJson.locale;
            voiceOpts.name = voiceJson.name;
            var voice = new Voice(voiceOpts);
            return voice;
        }

        get services() {
            if (this._services == null) {
                var words = this.voiceWords();
                this._services = {};
                Object.keys(this.usages).forEach(key => {
                    let usage = this.usages[key];
                    let props= {
                        words,
                        language: this.locale,
                        langUnknown: this.langUnknown,
                        fullStopComma: this.fullStopComma,
                        stripNumbers: this.stripNumbers,
                        stripQuotes: this.stripQuotes,
                        voice: this.name,
                        customWords: this.customWords,
                        soundStore: this.soundStore,
                        maxSegment: this.maxSegment,
                        scAudio: this.scAudio,
                        altTts: this.altTts,
                        usage: key,
                        breaks: usage.breaks,
                        syllableVowels: this.syllableVowels,
                        syllabifyLength: this.syllabifyLength,
                        prosody: {
                            rate: usage.rate,
                            pitch: this.pitch,
                        }
                    }
                    this.noAudioPath && (props.noAudioPath = this.noAudioPath);
                    if (this.service === 'aws-polly') {
                        this._services[key] = new Polly(props);
                    } else if (this.service === 'human-tts') {
                        this._services[key] = new HumanTts(props);
                    } else {
                        throw new Error(`unknown service:${this.service}`);
                    }
                });

            }
            return this._services;
        }

        voiceWords() {
            var words = new Words(undefined, {
                language: this.locale.split('-')[0],
            });
            words._ipa = this.ipa;
            return words;
        }

        speak(text, opts={}) {
            var usage = opts.usage || this.usage;
            var service = this.services[usage];
            if (service == null) {
                var avail = Object.keys(this.services);
                return Promise.reject(new Error(
                    `Voice.speak() unsupported TTS service usage:${usage} available:${avail}`));
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var result = await service.synthesizeText(text, opts);
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

        speakSegment(opts={}) {
            var {
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            } = opts;
            usage = usage || this.usage;
            var service = this.services[usage];
            if (service == null) {
                var avail = Object.keys(this.services);
                return Promise.reject(new Error(
                    `Voice.speakSegment() unsupported TTS service `+
                    `usage:${usage} available:${avail}`));
            }
            var volume = SoundStore.suttaVolumeName(sutta_uid, language, 
                    translator, this.name);
            return service.synthesizeSegment({
                segment,
                translator,
                language,
                usage,
                volume,
            });
        }

    }

    module.exports = exports.Voice = Voice;
})(typeof exports === "object" ? exports : (exports = {}));

