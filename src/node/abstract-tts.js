(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const winston = require('winston');
    const { MerkleJson } = require('merkle-json');
    const SoundStore = require('./sound-store');
    const Words = require('./words');
    const ABSTRACT_METHOD = "abstract method must be overridden and implemented by base class";
    const { exec } = require('child_process');

    class AbstractTTS {
        constructor(opts={}) {
            this.language = opts.language || 'en';
            this.languageUnknown = opts.languageUnknown || this.language;
            this.hits = 0;
            this.misses = 0;
            this.voice = null;
            this.api = opts.api || null;
            this.apiVersion = opts.apiVersion || null;
            this.audioSuffix = opts.audioSuffix || ".ogg";
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            this.store = opts.store || new SoundStore();
            Object.defineProperty(this, 'credentials', {
                writable: true,
            });
            var words = opts.words || null;
            if (!(words instanceof Words)) {
                words = new Words(words, {
                    language: this.language,
                });
            }
            Object.defineProperty(this, 'words', {
                value: words,
            });
            this.audioFormat = opts.audioFormat || 'audio/ogg';
            this.prosody = opts.prosody || {
                rate: "-10%",
            };
            this.breaks = opts.breaks || [0.001,0.1,0.2,0.4,0.8];
            this.reNumber = /^[-+]?[0-9]+(\.[0-9]+)?$/;
            var vowels = this.words._ipa.vowels || "aeiou";
            this.reVowels1 = new RegExp(`^[${vowels}].*`, 'u');
        }

        get ERROR_SIZE() { return 1000 }

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
            return !!text.match(this.reNumber);
        }

        break(index) {
            return `<break time="${this.breaks[index]}s"/>`;
        }

        wordInfo(word) {
            word = word && word.toLowerCase();
            var wordValue = word && this.words.words[word];
            if (typeof wordValue === 'string') { // synonym
                wordValue = this.wordInfo(wordValue);
            }
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

        wordSSML(word) {
            var wordInfo = this.wordInfo(word);
            if (wordInfo) {
                if (wordInfo.ipa) { // use custom IPA
                    var ipa = wordInfo.ipa;
                } else if (wordInfo.language !== this.language.split('-')[0]) { // generate IPA
                    var ipa = this.words.ipa(word, wordInfo.language); 
                } else {
                    var ipa = null;
                }
            } else { // unknown word or punctuation
                if (this.words.isWord(word) && this.languageUnknown !== this.language) { 
                    var ipa = this.words.ipa(word, this.languageUnknown); 
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
            var tokens = text instanceof Array ? text : this.tokenize(text);
            var tokensSSML = tokens.map(token => {
                return this.wordSSML(token) || token;
            });
            return tokensSSML;
        }

        segment(tokens) {
            var symbols = this.words.symbols;
            var acc = tokens.reduce((acc,token) => {
                if (token.length === 1 && !this.words.isWord(token) && !this.isNumber(token)) {
                    var symbol = symbols[token];
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
                    if (acc.cuddle === 'right') {
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
                console.error(`synthesize() failed ${outpath}`, stats.size, err);
                reject(new Error(`sound file is too short (${stats.size}): ${err}`));
            }
            resolve(this.createResponse(request, false));
        }

        createResponse(request, cached = false) {
            var signature = request.signature;
            var jsonPath = this.store.signaturePath(signature, ".json");
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
            return new Promise((resolve, reject) => {
                try {
                    var cache = opts.cache == null ? true : opts.cache;
                    var rate = this.prosody.rate || "0%";
                    var pitch = this.prosody.pitch || "0%";
                    var ssml = `<prosody rate="${rate}" pitch="${pitch}">${ssmlFragment}</prosody>`;
                    var signature = this.signature(ssml);
                    var outpath = this.store.signaturePath(signature);
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
                        this.misses++;

                        this.serviceSynthesize(resolve, error => {
                            console.error(`synthesize() error:`, error.stack);
                            reject(error);
                        }, request);
                    }
                } catch (e) {
                    reject(e);
                }
            });
        }

        synthesizeText(text, opts={}) {
            var that = this;
            return new Promise((resolve, reject) => {
                (async function() {
                    var result = null;
                    if (typeof text === 'string') {
                        var segments = that.segmentSSML(text);
                        var promises = segments.map(ssml => that.synthesizeSSML(ssml, opts));
                        result = await Promise.all(promises);
                    } else if (text instanceof Array) {
                        var textArray = text;
                        var segments = [];
                        //var promises = textArray.map(t => that.synthesizeText(t, opts));
                        var promises = textArray.reduce((acc, t) => {
                            var segs = that.segmentSSML(t);
                            segs.forEach(ssml => {
                                acc.push(that.synthesizeSSML(ssml, opts));
                            });
                            segments.push(segs);
                            return acc;
                        }, []);
                        result = await Promise.all(promises);
                    }
                    if (result) {
                        if (result.length === 1) {
                            result = result[0];
                        } else {
                            var files = result.map(r => r.file);
                            result = await that.ffmpegConcat(files);
                        }
                        resolve(Object.assign({
                            segments,
                        }, result));
                    } else {
                        reject(new Error("synthesizeText(text?) expected string or Array"));
                    }
                })();
            });
        }

        serviceSynthesize(resolve, reject, request) {
            reject (new Error(ABSTRACT_METHOD));
        }

        ffmpegConcat(files, opts = {}) {
            return new Promise((resolve, reject) => {
                var inputs = `file '${files.join("'\nfile '")}'\n`;
                var signature = {
                    api: "ffmegConcat",
                    files,
                }
                signature[this.mj.hashTag] = this.mj.hash(signature);
                var outpath = this.store.signaturePath(signature, this.audioSuffix);
                var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                var cache = opts.cache == null ? true : opts.cache;
                var request = {
                    signature,
                    outpath,
                    files,
                };
                if (cache && stats && stats.size > this.ERROR_SIZE) {
                    this.hits++;
                    resolve(this.createResponse(request, true));
                } else {
                    var inpath = this.store.signaturePath(signature, ".txt");
                    fs.writeFileSync(inpath, inputs);
                    var cmd = `bash -c "ffmpeg -y -safe 0 -f concat -i ${inpath} -c copy ${outpath}"`;
                    exec(cmd, (err, stdout, stderr) => {
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
                            resolve(this.createResponse(request, false));
                        }
                    });
                }
            });

        }

    }

    module.exports = exports.AbstractTTS = AbstractTTS;
})(typeof exports === "object" ? exports : (exports = {}));

