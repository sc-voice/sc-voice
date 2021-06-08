(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Queue = require('promise-queue');
    const { MerkleJson } = require('merkle-json');
    const { logger } = require('log-instance');
    const SoundStore = require('./sound-store');
    const Words = require('./words');
    const AudioTrans = require('./audio-trans');
    const ABSTRACT_METHOD = 
        "abstract method must be overridden and implemented by base class";
    const maxBuffer = 4 * 1024 * 1024;
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);  
    const RE_PARA = new RegExp(`^[${Words.U_RSQUOTE}${Words.U_RDQUOTE}]*\n$`,'u');
    const RE_PARA_EOL = /^\n\n+$/u;
    const RE_PAUSE3 = /[\u2014;:]./;  // \u2014:em-dash
    const RE_NUMBER = new RegExp(Words.PAT_NUMBER);
    const RE_STRIPNUMBER = new RegExp(`\\(?${Words.PAT_NUMBER}\\)?`);
    //const ELLIPSIS_BREAK = '<break time="1.000s"/>';
    const ELLIPSIS_BREAK = '.';
    const PAUSE_SSML = `<break time="0.5s"/>`;
    const MAX_SEGMENT = 1000;
    const APP_DIR = path.join(__dirname, '..', '..');

    class AbstractTTS {
        constructor(opts={}) {
            (opts.logger || logger).logInstance(this, opts);
            this.language = opts.language || 'en';
            this.localeIPA = opts.localeIPA || this.language;
            this.hits = 0;
            this.misses = 0;
            this.voice = null;
            this.api = opts.api || null;
            this.fullStopComma = opts.fullStopComma;
            this.stripNumbers = opts.stripNumbers;
            this.stripQuotes = opts.stripQuotes;
            this.stripChars = opts.stripChars || /[\u200b]/g;
            this.apiVersion = opts.apiVersion || null;
            this.audioSuffix = opts.audioSuffix || ".ogg";
            this.pauseSSML = opts.pauseSSML || PAUSE_SSML;
            this.maxConcurrentServiceCalls = 
                opts.maxConcurrentServiceCalls || 5;
            this.queue = new Queue(this.maxConcurrentServiceCalls, 
                Infinity);
            this.usage = opts.usage || "recite";
            this.maxSSML = opts.maxSSML || 5000;
            this.maxSegment = opts.maxSegment || MAX_SEGMENT;
            this.maxCuddle = opts.maxCuddle || 1;
            this.noAudioPath = opts.noAudioPath;
            this.usages = opts.usages || {};
            this.customWords = opts.customWords;
            this.syllableVowels = opts.syllableVowels;
            this.syllabifyLength = opts.syllabifyLength;
            this.unknownLang = opts.unknownLang; // optional lang to use
            this.ellipsisBreak = opts.ellipsisBreak || ELLIPSIS_BREAK;
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            this.soundStore = opts.soundStore || new SoundStore(opts);
            this.audioTrans = opts.audioTrans || new AudioTrans({
                genre: 'Dhamma',
                audioSuffix: this.audioSuffix,
                publisher: 'voice.suttacentral.net',
                album: 'voice.suttacentral.net',
                cwd: this.soundStore.storePath,
                coverPath: opts.coverPath ||
                    path.join(APP_DIR, 'public', 'img', 'wheel100.png'),
            });
            Object.defineProperty(this, 'credentials', {
                writable: true,
            });
            var words = opts.words || null;
            if (words instanceof Words) {
                // provided
            } else {
                words = new Words(words, {
                    language: this.language,
                    fwsEn: opts.fwsEn,
                });
                this.log(`${this.constructor.name}() `+
                    `default words:${Object.keys(words.words).length}`);
            }
            Object.defineProperty(this, 'words', {
                value: words,
            });
            this.audioFormat = opts.audioFormat || 'audio/ogg';
            this.prosody = opts.prosody || {
                rate: "-10%",
            };
            var usage = this.usages[this.usage] || {};
            this.breaks = opts.breaks || usage.breaks || [0.001,0.1,0.2,0.6,1];
            var vowels = this.words._ipa.vowels || "aeiou";
            this.reVowels1 = new RegExp(`^[${vowels}].*`, 'u');
        }

        get SECTION_BREAK() { return -1 }

        get ERROR_SIZE() { return 500 }

        get username() {
            return this.credentials && this.credentials.username;
        }

        get password() {
            return this.credentials && this.credentials.password;
        }

        set username(value) {
            this.credentials == null && (this.credentials = {});
            this.credentials.username = value;
            return value;
        }

        set password(value) {
            this.credentials == null && (this.credentials = {});
            this.credentials.password = value;
            return value;
        }

        isNumber(text) {
            return this.words.isNumber(text); 
        }

        break(index) {
            var t = this.breaks[index] || this.breaks[this.breaks.length-1];
            return `<break time="${t}s"/>`;
        }

        sectionBreak() {
            return this.break(this.breaks.length-1);
        }

        synthesizeBreak(index = this.SECTION_BREAK) {
            var i = index < 0
                ? this.breaks.length-index
                : i;

            var t = this.breaks[i] || this.breaks[this.breaks.length-1];
            return this.synthesizeSSML(`<break time="${t}s"/>`);
        }

        wordInfo(word='') {
            var {
                customWords,
                words,
                unknownLang,
            } = this;
            word = word.toLowerCase();
            if (word === 'should') { // HACK for should.js
                return {
                    language: 'en',
                }
            }
            word = word.replace(words.wordTrimPat, '');
            var wordValue = customWords && customWords[word]
            var wordValue = wordValue || words.words[word];
            if (wordValue && typeof wordValue === 'string') { // synonym
                wordValue = this.wordInfo(wordValue);
            }
            if (unknownLang && word && !wordValue && this.words.isWord(word)) {
                wordValue = {
                    language: unknownLang,
                }
            }

            // console.log(`dbg wordInfo`, word, unknownLang);

            return wordValue || null;
        }

        ipa_word(ipa, word) {
            var ssml = `<phoneme alphabet="ipa" ph="${ipa}">${word}</phoneme>` +
                this.break(0);
            if (ipa.match(this.reVowels1)) {
                ssml = this.break(0)+ssml;
            }

            return ssml;
        }

        wordIPA(word, language) {
            var {
                syllabifyLength: sylLen,
            } = this;
            var sylWord = sylLen && word.length >= sylLen
                ? this.syllabify(word)
                : word;
            return this.words.ipa(sylWord, language);
        }

        wordSSML(word, lang=this.language.split('-')[0]) {
            var wi = this.wordInfo(word, lang);
            var symbols = this.words.symbols;
            var ipa = null;
            if (wi) {
                if (wi.ipa) { // use custom IPA
                    this.debug(`wordSSML1.1`, {word}, wi);
                    ipa = wi.ipa;
                } else if (lang === 'en' && wi.language !== lang) {
                    // use IPA for non-English words in English
                    this.debug(`wordSSML1.3`, {word, lang}, wi);
                    ipa = this.wordIPA(word, wi.language);
                } else if (lang === 'pli' || wi.language === 'pli') { // generate IPA
                    // use IPA for root text
                    this.debug(`wordSSML1.4`, {word}, wi);
                    ipa = this.wordIPA(word, wi.language);
                } else {
                    this.debug(`wordSSML1.5`, {word, lang}, wi);
                }
            } else { // unknown word or punctuation
                if (Words.RE_ACRONYM.test(word)) {
                    this.debug(`wordSSML2.1`, {word}, wi);
                    return word
                        .replace('{', '<say-as interpret-as="spell">')
                        .replace('}', '</say-as>');
                } else if (word.trim() === '') {
                    // ipa = null
                    this.debug(`wordSSML2.2`, {word}, wi);
                } else if (this.words.isWord(word)) {
                    var w = word.endsWith(`’`) 
                        ? word.substring(0,word.length-1) 
                        : word;
                    if (this.localeIPA !== this.language && 
                        this.words.isForeignWord(w)) { 
                        var ipa = this.wordIPA(word, this.localeIPA);
                        this.debug(`wordSSML2.3.1`, {word, w}, wi);
                    } else {
                        this.debug(`wordSSML2.3.2`, {word, w}, wi);
                    }
                } else if (word.endsWith(`’`)) {
                    // ipa = null
                    this.debug(`wordSSML2.4`, {word}, wi);
                } else {
                    var symInfo = symbols[word];
                    if (0 && symInfo && symInfo.isEllipsis) {
                        this.debug(`w&ordSSML2.5.1`, word);
                        return this.ellipsisBreak;
                    }
                    this.debug(`wordSSML2.5.2`, {word}, wi);
                }
            }
            if (ipa) {
                this.debug(`wordSSML3`, word, ipa);
                if (ipa.endsWith('(.)')) {
                    var pauses = ipa.split('(.)');
                    ipa = pauses.map(x => {
                        return this.ipa_word(x, word);
                    }).join(this.break(1));
                    return ipa;
                } else {
                    return this.ipa_word(ipa, word);
                }
            }
            return word;
        }

        tokenize(text) {
            let tokens = this.words.tokenize(text);
            return tokens;
        }

        tokensSSML(text) {
            if (this.stripNumbers) {
                text = text.replace(RE_STRIPNUMBER,' ');
            }
            if (this.stripQuotes) {
                text = text.replace(/[„“‟‘‛'"”»«]+/ug,' ');
            }
            if (this.fullStopComma) {
                text = text.replace(/, /ug,'. ');
            }
            text = text.replace(this.stripChars, '');
            var tokens = text instanceof Array ? text : this.tokenize(text);
            if (tokens.length === 0) {
                tokens.push(' ');
            }
            var tokensSSML = tokens.reduce((acc, token) => {
                if (RE_PARA_EOL.test(token)) {
                    acc.length && acc.push('\n');
                    acc.push(`${this.break(4)}`);
                    acc.push('\n');
                    this.debug(`tokensSSML() RE_PARA_EOL`, {token});
                } else if (RE_PAUSE3.test(token)) {
                    acc.length && acc.push(' ');
                    acc.push(`${this.break(3)} `);
                    this.debug(`tokensSSML() RE_PAUSE3`, {token});
                } else if (token === '&') {
                    this.debug(`tokensSSML() ampersand`, {token});
                    acc.push('&amp;');
                } else {
                    let wordSSML = this.wordSSML(token) || token;
                    this.debug(`tokensSSML() wordSSML`, {token, wordSSML});
                    acc.push(wordSSML);
                }
                return acc;
            }, []);
            if (tokensSSML[0] === '.') {
                tokensSSML.shift();
            }

            return tokensSSML;
        }

        segment(tokens) {
            var symbols = this.words.symbols;
            var acc = tokens.reduce((acc,token) => {
                var symbol = symbols[token];
                var tlen = token.length;
                var tword = this.words.isWord(token) || token.match(/phoneme/);
                var tnumber = !tword && this.words.isNumber(token);
                var seglen = acc.segment.length;
                var maxCuddle = this.maxCuddle;
                var overflow = this.maxSegment 
                    ? seglen + tlen + maxCuddle > this.maxSegment
                    : false;
                if (!this.cuddle && overflow && tword) {
                    acc.segments.push(acc.segment);
                    acc.segment = token;
                    acc.cuddle = null;
                } else if (tlen === 1 && !tword && !tnumber) {
                    if (symbol == null) {
                        throw new Error(`undefined symbol: ${token}`);
                    }
                    acc.cuddle = symbol.cuddle;
                    if (acc.cuddle === 'left') {
                        acc.segment = acc.segment + token;
                    } else if (symbol.isEllipsis) {
                        acc.segment && acc.segments.push(acc.segment);
                        acc.segments.push(this.ellipsisBreak);
                        acc.segment = '';
                    } else if (symbol.eol) {
                        if (acc.segment) {
                            acc.segments.push(acc.segment + token);
                        } else if (acc.segments) {
                            acc.segments[acc.segments.length-1] += token;
                        }
                        acc.segment = '';
                    } else {
                        acc.segment = acc.segment ? acc.segment + ' ' + token : token;
                    }
                    if (acc.segment && symbols[token].endSegment) {
                        acc.segments.push(acc.segment);
                        acc.segment = '';
                    }
                } else {
                    if (symbol && symbol.cuddle === 'left') {
                        acc.segment = acc.segment + token;
                    } else if (acc.cuddle === 'right') {
                        acc.segment = acc.segment + token;
                    } else {
                        acc.segment = acc.segment ? acc.segment + ' ' + token : token;
                    }
                    acc.cuddle = null;
                }
                acc.prevToken = token;
                return acc;
            }, {
                segments: [],
                segment: '',
                cuddle: null,
                prevToken: null,
            });
            acc.segment && acc.segments.push(acc.segment);
            return acc.segments;
        }

        segmentSSML(text) {
            var tokens = this.tokensSSML(text);
            return this.segment(tokens);
        }

        signature(text) {
            var signature = {
                api: this.api,
                apiVersion: this.apiVersion,
                audioFormat: this.audioFormat,
                voice: this.voice,
                prosody: this.prosody,
                language: this.language,
                text,
            };
            signature[this.mj.hashTag] = this.mj.hash(signature);
            return signature;
        }
        
        synthesizeResponse(resolve, reject, request) {
            var hitPct = (100*this.hits/(this.hits+this.misses)).toFixed(1);
            var outpath = request.outpath;
            if (fs.existsSync(outpath)) {
                var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                if (stats && stats.size <= this.ERROR_SIZE) {
                    var err = fs.readFileSync(outpath).toString();
                    reject(new Error(`sound file is too short (${stats.size}): `+
                        `${outpath} ${this.audioFormat} ${this.audioSuffix}`));
                }
                resolve(this.createResponse(request, false, true));
            } else {
                this.warn(`synthesizeResponse()`,
                    `no audio voice:${this.voice} outpath:${outpath}`);
                request.outpath = this.noAudioPath;
                resolve(this.createResponse(request, false, false));
            }
        }

        createResponse(request, cached = false, writeSignature=true) {
            var signature = request.signature;
            var jsonPath = this.soundStore.signaturePath(signature, ".json");
            writeSignature &&
                fs.writeFileSync(jsonPath, JSON.stringify(signature, null, 2)+'\n');
            var response = {
                file: request.outpath,
                hits: this.hits,
                misses: this.misses,
                signature,
                cached: false,
            };
            return response;
        }

        signatureSSML(ssmlFragment) {
            var rate = this.prosody.rate || "0%";
            var pitch = this.prosody.pitch || "0%";
            return [
                `<prosody rate="${rate}" pitch="${pitch}">`,
                `${ssmlFragment}`,
                `</prosody>`,
            ].join('');
        }

        synthesizeSSML(ssmlFragment, opts={}) {
            var that = this;
            if (ssmlFragment.length > this.maxSSML) {
                var oldLen = ssmlFragment.length;
                ssmlFragment = ssmlFragment
                    .replace(/>[^<]+<\/phoneme/iug, '/');
                this.log([
                    `AbstractTts.synthesizeSSML()`,
                    `shrinking large SSML (1)`,
                    `before:${oldLen}`,
                    `after:${ssmlFragment.length}`,
                    `ssml:${ssmlFragment.substring(0, 500)}...`,
                ].join(' '));
                if (ssmlFragment.length > this.maxSSML) {
                    ssmlFragment = ssmlFragment
                        .replace(/<break[^>]+>/iug, '');
                    this.log([
                        `AbstractTts.synthesizeSSML()`,
                        `shrinking large SSML (2)`,
                        `before:${oldLen}`,
                        `after:${ssmlFragment.length} `,
                    ].join(' '));
                } 
            }
            return new Promise((resolve, reject) => {
                try {
                    var soundStore = that.soundStore;
                    var cache = opts.cache == null ? true : opts.cache;
                    var ssml = this.signatureSSML(ssmlFragment);
                    var signature = this.signature(ssml);
                    opts.volume && (signature.volume = opts.volume);
                    signature.chapter = opts.chapter;
                    opts.guid && (signature.guid = opts.guid);
                    var outpath = soundStore
                        .signaturePath(signature, this.audioSuffix);
                    var request = {
                        ssml,
                        signature,
                        outpath,
                    };

                    var stats = fs.existsSync(outpath) && 
                        fs.statSync(outpath);
                    if (cache && stats && stats.size > this.ERROR_SIZE) {
                        this.hits++;
                        resolve(this.createResponse(request, true));
                    } else {
                        that.misses++;

                        that.serviceSynthesize(resolve, e => {
                            if (/EAI_AGAIN/.test(e.message)) {
                                that.warn(`synthesizeSSML() ${e.message} (retrying...)`);
                                that.serviceSynthesize(resolve, e => {
                                    that.warn(`synthesizeSSML() ${e.message}`,
                                        `ssml:${ssmlFragment.length}utf16`,
                                        `${ssmlFragment}`,
                                    );
                                    reject(e);
                                }, request);
                            } else {
                                that.warn(`synthesizeSSML() ${e.message}`,
                                    `ssml:${ssmlFragment.length}utf16`,
                                    `${ssmlFragment}`,
                                );
                                reject(e);
                            }
                        }, request);
                    }
                } catch (e) {
                    that.warn(`synthesizeSSML() ${e.message} ssml:${ssmlFragment}`);
                    reject(e);
                }
            });
        }

        stripHtml(text) {
            text = text.replace(/<[^>]*>/ug, '');
            text = text.replace(/\.\.\./ug, '\u2026');
            return text;
        }

        synthesizeText(text, opts={}) {
            var that = this;
            var pbody = (resolve, reject) => {
                var queue = that.queue;
                (async function() { try {
                    var result = null;
                    //var ssmlAll = []; // useful for debugging
                    var ssmlAll = null;
                    if (typeof text === 'string') {
                        var segments = that.segmentSSML(
                            that.stripHtml(text));
                        var promises = segments.map(ssml => {
                            ssmlAll && ssmlAll.push(ssml);
                            return queue.add(() => 
                                that.synthesizeSSML(ssml, opts));
                        });
                        result = await Promise.all(promises);
                    } else if (text instanceof Array) {
                        if (text.length === 0) {
                            throw new Error(
                                `synthesizeText(${text}) no text`);
                        }
                        var textArray = text;
                        var segments = [];
                        var promises = textArray.reduce((acc, t) => {
                            var segs = that.segmentSSML(that.stripHtml(t));
                            segs.forEach(ssml => {
                                ssmlAll && ssmlAll.push(ssml);
                                acc.push(queue.add(() => 
                                    that.synthesizeSSML(ssml, opts)));
                            });
                            segments.push(segs);
                            return acc;
                        }, []);
                        result = await Promise.all(promises);
                    }
                    if (result && result.length) {
                        if (result.length === 1) {
                            result = result[0];
                        } else {
                            let files = result.map(r => r.file);
                            let audioOpts = Object.assign({
                                ssmlAll,
                            }, opts);
                            result = await that.concatAudio(files, audioOpts);
                        }
                        resolve(Object.assign({
                            voice: that.voice,
                            segments,
                        }, result));
                    } else {
                        that.log([
                            `synthesizeText("${text}",`,
                            JSON.stringify(opts),
                            `)`,
                        ].join(' '));
                        text = that.pauseSSML;
                        return pbody(resolve,reject);
                    }
                } catch(e) { reject(e);} })();
            };
            return new Promise(pbody);
        }

        syllabify(word) {
            var re = this.syllabifyRegExp;
            var vowels = this.syllableVowels;
            if (vowels == null) {
                return word;
            }
            if (re == null) {
                var regOpts = "gui";
                var patVowel = `[${vowels}]`;
                this.reVowel = new RegExp(patVowel, regOpts);
                var patConsonant = `[^${vowels}]`;
                var pat = `${patVowel}.${patConsonant}?${patConsonant}?`;
                re = this.syllabifyRegExp = new RegExp(pat, regOpts);
            }
            var c = 'no-c';
            return word.replace(re, (m, i, s)=> {
                var remaining = word.length - (i + m.length);
                if (s) {
                    switch (m.length) {
                        case 2: return remaining 
                            ? `${m[0]} ${m[1]}`                 // ATa => a ta
                            : m;                                // tAT => tat
                        case 3: return this.reVowel.test(m[1])
                            ? `${m[0]} ${m[1]}${m[2]}`          // tAAT => ta at
                            : `${m[0]}${m[1]} ${m[2]}`;         // ATTa => at ta
                        case 4: return this.reVowel.test(m[1])
                            ? `${m[0]} ${m[1]}${m[2]} ${m[3]}`  // tAATTa => ta at ta
                            : `${m[0]}${m[1]} ${m[2]}${m[3]}`;  // tATTHa => tat tha
                        default: return m;
                    }
                }
                return m;
            });
        }

        serviceSynthesize(resolve, reject, request) {
            reject (new Error(ABSTRACT_METHOD));
        }

        async concatAudio(files, opts = {}) { try {
            var soundStore = this.soundStore;
            var storePath = soundStore.storePath;
            var rePath = new RegExp(`${storePath}/?`);
            if (files == null || !files.length) {
                throw new Error(`concatAudio(no-files?)`);
            }

            // IMPORTANT: store-relative paths ensure that content 
            // on different servers will always have the same hash
            var ffmpegfiles = files.map(f => f.replace(rePath, '../../')); 
            var sigfiles = files.map(f => f.replace(rePath, '')); 

            var inputs = `file '${ffmpegfiles.join("'\nfile '")}'\n`;
            var signature = {
                api: "ffmegConcat", // don't change misspelling--it's cached
                files:sigfiles,
            }
            opts.volume && (signature.volume = opts.volume);
            signature[this.mj.hashTag] = this.mj.hash(signature);
            let audioSuffix = opts.audioSuffix || this.audioSuffix;
            var outpath = soundStore.signaturePath(signature, audioSuffix);
            var stats = fs.existsSync(outpath) && fs.statSync(outpath);
            var cache = opts.cache == null ? true : opts.cache;
            var request = {
                signature,
                outpath,
                files:sigfiles,
            };
            if (cache && stats && stats.size > this.ERROR_SIZE) {
                this.hits++;
                return this.createResponse(request, true);
            } else {
                if (opts.ssmlAll) {
                    let ssmlPath = soundStore.signaturePath(signature, ".ssml");
                    await fs.promises.writeFile(ssmlPath, 
                        JSON.stringify(opts.ssmlAll, null, 2));
                }
                var inpath = soundStore.signaturePath(signature, ".txt");
                await fs.promises.writeFile(inpath, inputs);
                await this.audioTrans.concat(Object.assign({
                    inpath,
                    outpath,
                    version: signature.guid,
                    cwd: storePath,
                }, opts));
                soundStore.addEphemeral(signature.guid);
                return this.createResponse(request, false);
            }
        } catch (e) {
            this.warn(`concatAudio()`, e.message);
            throw e;
        }}

        synthesizeSegment(opts={}) {
            var {
                segment,
                language,
                usage,
                volume,
            } = opts;
            if (segment == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() segment is required`));
            }
            if (language == null) {
                return Promise.reject(new Error(
                    `synthesizeSegment() language is required`));
            }
            usage = usage || this.usage;
            var text = segment[language.split('-')[0]] || '(no text)';
            return this.synthesizeText(text, {
                scid: segment.scid,
                language,
                usage,
                volume,
            });
        }

    }

    module.exports = exports.AbstractTTS = AbstractTTS;
})(typeof exports === "object" ? exports : (exports = {}));

