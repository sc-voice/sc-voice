(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const { SayAgain } = require('say-again');
    const Polly = require('./polly');
    const JSON5 = require('json5');
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
            (opts.logger || logger).logInstance(this, opts);

            // serializable
            this.stripNumbers = opts.stripNumbers;
            this.stripQuotes = opts.stripQuotes;
            this.locale = opts.locale || "en-IN";
            this.trimSegmentSuffix = opts.trimSegmentSuffix;
            this.ellipsisBreak = opts.ellipsisBreak;
            this.langTrans = opts.langTrans || 'en';
            this.localeIPA = opts.localeIPA || this.langTrans;
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
            var soundStoreOpts = Object.assign({}, opts, {
                logger: this,
            })

            // non-serializable
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
            this.unknownLang = opts.unknownLang;

            Object.defineProperty(this, "soundStore", {
                value: (opts.soundStore || new SoundStore(soundStoreOpts)),
            });
            Object.defineProperty(this, "sayAgain", {
                value: (opts.sayAgain instanceof SayAgain
                    ? opts.sayAgain
                    : opts.sayAgain == null && this.soundStore.sayAgain
                ),
            });

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

        static loadVoices(voicePath, opts={}) {
            if (voicesCache) {
                return voicesCache;
            }
            voicePath == null && (voicePath = path.join(__dirname, '../../words/voices.json'));
            var json = JSON5.parse(fs.readFileSync(voicePath).toString());
            voicesCache = json.map(voiceOpts => {
                var voice = new Voice(Object.assign({},voiceOpts,opts));
                logger.info(`loaded Voice:${voice.name}`);
                return voice;
            });
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

        static compare(a,b) {
            var cmp = a.langTrans.localeCompare(b.langTrans);
            if (cmp === 0) {
                if (a.hasOwnProperty('iVoice') && b.hasOwnProperty('iVoice')) {
                    cmp = Number(a.iVoice) - Number(b.iVoice);
                }
                cmp = cmp || a.name.localeCompare(b.name);
            } else { // Pali voices last; en voices first
                if (a.langTrans === 'pli') {
                    cmp = 1;
                } else if (b.langTrans === 'pli') {
                    cmp = -1;
                } else if (a.langTrans === 'en') {
                    cmp = -1;
                } else if (b.langTrans === 'en') {
                    cmp = 1;
                }
            }
            return cmp;
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
            if (voiceOpts.altTts == null) {
                if (opts.name === 'sujato_pli') {
                    voiceOpts.altTts = Voice.voiceOfName('Aditi').services.recite;
                } else  if (opts.name === 'sujato_en') {
                    voiceOpts.altTts = Voice.voiceOfName('Amy').services.recite;
                }
            }
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
                        altTts: this.altTts,
                        breaks: usage.breaks,
                        customWords: this.customWords,
                        ellipsisBreak: this.ellipsisBreak,
                        fullStopComma: this.fullStopComma,
                        language: this.locale,
                        localeIPA: this.localeIPA,
                        logger: this,
                        maxSegment: this.maxSegment,
                        prosody: { rate: usage.rate, pitch: this.pitch, },
                        sayAgain: this.sayAgain,
                        scAudio: this.scAudio,
                        soundStore: this.soundStore,
                        stripNumbers: this.stripNumbers,
                        stripQuotes: this.stripQuotes,
                        syllabifyLength: this.syllabifyLength,
                        syllableVowels: this.syllableVowels,
                        unknownLang: this.unknownLang,
                        usage: key,
                        voice: this.name,
                        words,
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

        normalizeText(text) {
            if (typeof text === 'string') {
                var {
                    trimSegmentSuffix,
                } = this;
                if (trimSegmentSuffix) {
                    var reTrimSuffix = new RegExp(trimSegmentSuffix+"$");
                    text = text.replace(reTrimSuffix, '');
                }

                // The bizarre convention of periods after ellipses
                // wreaks havoc in the tokenization for Voice.
                // We expunge the period here.
                // e.g., SN55.61:1.1
                text = text.replace(/\u2026\./gu, '\u2026'); 
            }
            return text;
        }

        speak(text, opts={}) {
            var that = this;
            var {
                services,
            } = that;
            var usage = opts.usage || this.usage;
            var service = services[usage];
            if (service == null) {
                var avail = Object.keys(services);
                return Promise.reject(new Error([
                    `Voice.speak() unsupported TTS service`,
                    `usage:${usage} available:${avail}`,
                ].join(' ')));
            }
            return new Promise((resolve, reject) => {
                (async function() { try {
                    text = that.normalizeText(text);
                    var result = await service.synthesizeText(text, opts);
                    resolve(result);
                } catch(e) {reject(e);} })();
            });
        }

        speakSegment(opts={}) {
            var that = this;
            var {
                name,
                services,
            } = that;
            var {
                sutta_uid,
                segment,
                language,
                translator,
                trimSegmentSuffix,
                usage,
                downloadAudio,
            } = opts;
            usage = usage || this.usage;
            trimSegmentSuffix = trimSegmentSuffix || this.trimSegmentSuffix;
            var text = that.normalizeText(segment[language]);
            segment = Object.assign({}, segment, {
                [language]: text,
            });
            var service = services[usage];
            if (service == null) {
                var avail = Object.keys(services);
                return Promise.reject(new Error(
                    `Voice.speakSegment() unsupported TTS service `+
                    `usage:${usage} available:${avail}`));
            }
            var volume = SoundStore.suttaVolumeName(sutta_uid, language, 
                    translator, name);
            return service.synthesizeSegment({
                segment,
                translator,
                language,
                usage,
                volume,
                downloadAudio,
            });
        }

    }

    module.exports = exports.Voice = Voice;
})(typeof exports === "object" ? exports : (exports = {}));

