(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Queue = require('promise-queue');
    const { MerkleJson } = require('merkle-json');
    const {
        logger,
    } = require('rest-bundle');
    const SoundStore = require('./sound-store');
    const Words = require('./words');
    const ABSTRACT_METHOD = "abstract method must be overridden and implemented by base class";
    const maxBuffer = 4 * 1024 * 1024;
    const { exec } = require('child_process');
    const RE_PARA = new RegExp(`^[${Words.U_RSQUOTE}${Words.U_RDQUOTE}]*\n$`,'u');
    const RE_PARA_EOL = /^\n\n+$/u;
    const RE_NUMBER = new RegExp(Words.PAT_NUMBER);
    const RE_STRIPNUMBER = new RegExp(`\\(?${Words.PAT_NUMBER}\\)?`);
    const MAX_SEGMENT = 1000;

    class AbstractTTS {
        constructor(opts={}) {
            this.language = opts.language || 'en';
            this.languageUnknown = opts.languageUnknown || this.language;
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
            this.queue = new Queue(opts.maxConcurrentServiceCalls || 5, Infinity);
            this.usage = opts.usage || "recite";
            this.maxSSML = opts.maxSSML || 5000;
            this.maxSegment = opts.maxSegment || MAX_SEGMENT;
            this.maxCuddle = opts.maxCuddle || 1;
            this.usages = opts.usages || {};
            this.customWords = opts.customWords;
            this.syllableVowels = opts.syllableVowels;
            this.syllabifyLength = opts.syllabifyLength;
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            this.soundStore = opts.soundStore || new SoundStore(opts);
            Object.defineProperty(this, 'credentials', {
                writable: true,
            });
            var words = opts.words || null;
            if (words instanceof Words) {
                // provided
            } else {
                words = new Words(words, {
                    language: this.language,
                });
                logger.info(`${this.constructor.name}() `+
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

        wordInfo(word) {
            word = word && word.toLowerCase();
            var wordValue = word && this.words.words[word];
            if (wordValue && typeof wordValue === 'string') { // synonym
                wordValue = this.wordInfo(wordValue);
            }
            if (!wordValue) {
                return null;
            }
            var customWord = this.customWords && this.customWords[word];
            customWord && Object.assign(wordValue, customWord);
            return wordValue;
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
            if (this.syllabifyLength && word.length >= this.syllabifyLength) {
                word = this.syllabify(word);
            }
            return this.words.ipa(word, language);
        }

        wordSSML(word) {
            var wordInfo = this.wordInfo(word);
            if (wordInfo) {
                if (wordInfo.ipa) { // use custom IPA
                    var ipa = wordInfo.ipa;
                } else if (wordInfo.language !== this.language.split('-')[0]) { // generate IPA
                    var ipa = this.wordIPA(word, wordInfo.language);
                } else {
                    var ipa = null;
                }
            } else { // unknown word or punctuation
                if (Words.RE_ACRONYM.test(word)) {
                    return word
                        .replace('{', '<say-as interpret-as="spell">')
                        .replace('}', '</say-as>');
                } else if (word.trim() === '') {
                    var ipa = null;
                } else if (this.words.isWord(word)) {
                    var w = word.endsWith(`’`) ? word.substring(0,word.length-1) : word;
                    if (this.languageUnknown !== this.language && 
                        this.words.isForeignWord(w)) { 
                        var ipa = this.wordIPA(word, this.languageUnknown);
                    } else {
                        var ipa = null;
                    }
                } else if (word.endsWith(`’`)) {
                    var ipa = null; 
                } else {
                    var ipa = null; 
                }
            }
            if (ipa) {
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
            return this.words.tokenize(text);
        }

        tokensSSML(text) {
            if (this.stripNumbers) {
                text = text.replace(RE_STRIPNUMBER,' ');
            }
            if (this.stripQuotes) {
                text = text.replace(/[„“‟‘‛'’"”»«]+/ug,' ');
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
                    acc.push(`${this.break(5)}`);
                    acc.push('\n');
                } else if (token === '&') {
                    acc.push('&amp;');
                } else {
                    acc.push(this.wordSSML(token) || token);
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
                var tword = this.words.isWord(token);
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
                    if (symbols[token].endSegment) {
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
            var stats = fs.existsSync(outpath) && fs.statSync(outpath);
            if (stats && stats.size <= this.ERROR_SIZE) {
                var err = fs.readFileSync(outpath).toString();
                reject(new Error(`sound file is too short (${stats.size}): ${outpath} ${this.audioFormat} ${this.audioSuffix}`));
                //reject(new Error(`sound file is too short (${stats.size}): ${outpath} ${err}`));
            }
            resolve(this.createResponse(request, false));
        }

        createResponse(request, cached = false) {
            var signature = request.signature;
            var jsonPath = this.soundStore.signaturePath(signature, ".json");
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

        synthesizeSSML(ssmlFragment, opts={}) {
            var that = this;
            if (ssmlFragment.length > this.maxSSML) {
                var oldLen = ssmlFragment.length;
                ssmlFragment = ssmlFragment.replace(/>[^<]+<\/phoneme/iug, '/');
                logger.info(`AbstractTts.synthesizeSSML() shrinking large SSML (1) `+
                    `before:${oldLen} `+
                    `after:${ssmlFragment.length} `+
                    `ssml:${ssmlFragment.substring(0, 500)}...`);
                if (ssmlFragment.length > this.maxSSML) {
                    ssmlFragment = ssmlFragment.replace(/<break[^>]+>/iug, '');
                    logger.info(`AbstractTts.synthesizeSSML() shrinking large SSML (2) `+
                        `before:${oldLen} `+
                        `after:${ssmlFragment.length} `);
                } 
            }
            return new Promise((resolve, reject) => {
                try {
                    var soundStore = that.soundStore;
                    var cache = opts.cache == null ? true : opts.cache;
                    var rate = this.prosody.rate || "0%";
                    var pitch = this.prosody.pitch || "0%";
                    var ssml = `<prosody rate="${rate}" pitch="${pitch}">${ssmlFragment}</prosody>`;
                    var signature = this.signature(ssml);
                    opts.volume && (signature.volume = opts.volume);
                    signature.chapter = opts.chapter;
                    opts.guid && (signature.guid = opts.guid);
                    var outpath = soundStore.signaturePath(signature, this.audioSuffix);
                    var request = {
                        ssml,
                        signature,
                        outpath,
                    };

                    var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                    if (cache && stats && stats.size > this.ERROR_SIZE) {
                        this.hits++;
                        resolve(this.createResponse(request, true));
                    } else {
                        that.misses++;

                        that.serviceSynthesize(resolve, e => {
                            if (/EAI_AGAIN/.test(e.message)) {
                                logger.warn(`synthesizeSSML() ${e.message} (retrying...)`);
                                that.serviceSynthesize(resolve, e => {
                                    logger.warn(`synthesizeSSML() ${e.message} `+
                                        `ssml:${ssmlFragment.length}utf16 ${ssmlFragment}`);
                                    reject(e);
                                }, request);
                            } else {
                                logger.warn(`synthesizeSSML() ${e.message} `+
                                    `ssml:${ssmlFragment.length}utf16 ${ssmlFragment}`);
                                reject(e);
                            }
                        }, request);
                    }
                } catch (e) {
                    logger.warn(`synthesizeSSML() ${e.message} ssml:${ssmlFragment}`);
                    reject(e);
                }
            });
        }

        stripHtml(text) {
            text = text.replace(/<[^>]*>/ug, '');
            return text;
        }

        synthesizeText(text, opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                var queue = that.queue;
                (async function() { try {
                    var result = null;
                    //var ssmlAll = []; // useful for debugging
                    var ssmlAll = null;
                    if (typeof text === 'string') {
                        var segments = that.segmentSSML(that.stripHtml(text));
                        var promises = segments.map(ssml => {
                            ssmlAll && ssmlAll.push(ssml);
                            return queue.add(() => that.synthesizeSSML(ssml, opts));
                        });
                        result = await Promise.all(promises);
                    } else if (text instanceof Array) {
                        if (text.length === 0) {
                            throw new Error(`synthesizeText(${text}) no text`);
                        }
                        var textArray = text;
                        var segments = [];
                        var promises = textArray.reduce((acc, t) => {
                            var segs = that.segmentSSML(that.stripHtml(t));
                            segs.forEach(ssml => {
                                ssmlAll && ssmlAll.push(ssml);
                                acc.push(queue.add(() => that.synthesizeSSML(ssml, opts)));
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
                            var files = result.map(r => r.file);
                            var ffmpegOpts = Object.assign({
                                ssmlAll,
                            }, opts);
                            result = await that.ffmpegConcat(files, ffmpegOpts);
                        }
                        resolve(Object.assign({
                            segments,
                        }, result));
                    } else {
                        reject(new Error(`synthesizeText(${text}) expected string or Array`));
                    }
                } catch(e) { reject(e);} })();
            });
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
                //console.log(`dbg m:${m} c:${c} i:${i} s:${s} word:${word}`);
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

        ffmpegConcat(files, opts = {}) {
            var soundStore = this.soundStore;
            var storePath = soundStore.storePath;
            var rePath = new RegExp(`${storePath}/?`);
            if (files == null || !files.length) {
                return Promise.reject(new Error(`ffmpegConcat(no-files?)`));
            }
            return new Promise((resolve, reject) => { try {
                // IMPORTANT: store-relative paths ensure that content 
                // on different servers will always have the same hash
                var ffmpegfiles = files.map(f => f.replace(rePath, '../../')); 
                var sigfiles = files.map(f => f.replace(rePath, '')); 

                var inputs = `file '${ffmpegfiles.join("'\nfile '")}'\n`;
                var signature = {
                    api: "ffmegConcat",
                    files:sigfiles,
                }
                opts.volume && (signature.volume = opts.volume);
                signature[this.mj.hashTag] = this.mj.hash(signature);
                var outpath = soundStore.signaturePath(signature, this.audioSuffix);
                var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                var cache = opts.cache == null ? true : opts.cache;
                var request = {
                    signature,
                    outpath,
                    files:sigfiles,
                };
                if (cache && stats && stats.size > this.ERROR_SIZE) {
                    this.hits++;
                    resolve(this.createResponse(request, true));
                } else {
                    if (opts.ssmlAll) {
                        var ssmlPath = soundStore.signaturePath(signature, ".ssml");
                        fs.writeFileSync(ssmlPath, JSON.stringify(opts.ssmlAll, null, 2));
                    }
                    var inpath = soundStore.signaturePath(signature, ".txt");
                    fs.writeFileSync(inpath, inputs);
                    var cmd = `bash -c "ffmpeg -y -safe 0 -f concat -i ${inpath} -c copy ${outpath}"`;
                    var execOpts = {
                        cwd: storePath,
                        maxBuffer,
                    };
                    exec(cmd, execOpts, (err, stdout, stderr) => {
                        if (err) {
                            console.error(err.stack);
                            reject(err);
                            return;
                        }

                        var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                        if (stats && stats.size <= this.ERROR_SIZE) {
                            var err = fs.readFileSync(outpath).toString();
                            console.error(`ffmpegConcat() failed ${outpath}`, stats.size, err);
                            reject(new Error(err));
                        } else {
                            soundStore.addEphemeral(signature.guid);
                            resolve(this.createResponse(request, false));
                        }
                    });
                }
            } catch(e) { reject(e); } });

        }

    }

    module.exports = exports.AbstractTTS = AbstractTTS;
})(typeof exports === "object" ? exports : (exports = {}));

