(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const winston = require('winston');
    const { MerkleJson } = require('merkle-json');
    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');
    const SoundStore = require('./sound-store');

    class Watson {
        constructor(opts={}) {
            var credentials = opts.credentials;
            if (credentials == null) {
                var credpath = path.join(__dirname, '../local/watson/credentials.json');
                if (fs.existsSync(credpath)) {
                    credentials = JSON.parse(fs.readFileSync(credpath));
                }
            }
            this.credentials = credentials;
            this.voice = opts.voice || 'en-GB_KateVoice';
            this.language = this.voice.split('-')[0];
            this.hits = 0;
            this.misses = 0;
            this.mj = new MerkleJson({
                hashTag: 'guid',
            });
            var wordpath = path.join(__dirname, `../words/${this.language}.json`);
            if (!fs.existsSync(wordpath)) {
                var wordpath = path.join(__dirname, `../words/en.json`);
            }
            this.store = new SoundStore();
            this.words = JSON.parse(fs.readFileSync(wordpath));
            var symbols = this.words._symbols;
            var symAcc= Object.keys(symbols).reduce((acc,text) => {
                if (text === ']') {
                    text = '\\' + text;
                }
                acc.text += text;
                return acc;
            }, { text: '' });
            this.symbolPat = new RegExp(`[${symAcc.text}]`);
            this.audioMIME = opts.audioMIME || 'audio/ogg';
            this.prosody = opts.prosody || {
                pitch: "-30%",
                rate: "-10%",
            };
            this.breaks = opts.breaks || [0,0.1,0.2,0.4,0.8];
            this.service_url = opts.service_url || "https://stream.watsonplatform.net/text-to-speech/api/v1";
            this.output = opts.output || {
                path: path.join(__dirname, '../local/audio'),
                file: 'output.ogg',
            };
        }

        get textToSpeech() {
            if (this._textToSpeech == null) {
                this._textToSpeech = new TextToSpeechV1(this.credentials);
            }
            return this._textToSpeech;
        }

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

        break(index) {
            return `<break time="${index}s"></break>`;
        }

        wordInfo(word) {
            word = word && word.toLowerCase();
            var wordValue = word && this.words[word];
            if (typeof wordValue === 'string') { // synonym
                wordValue = this.wordInfo(wordValue);
            }
            return wordValue || null;
        }

        wordSSML(word) {
            var wordInfo = this.wordInfo(word);
            if (wordInfo) {
                var ipa = wordInfo.ipa;
                if (ipa.endsWith('(.)')) {
                    var pauses = ipa.split('(.)');
                    ipa = pauses.map(x => {
                        return x && `<phoneme alphabet="ipa" ph="${x}">${word}</phoneme>` || '';
                    }).join(this.break(1));
                    return ipa;
                } else {
                    return `<phoneme alphabet="ipa" ph="${ipa}">${word}</phoneme>`;
                }
            } else {
                return word;
            }
        }

        tokenize(text) {
            return text.split(' ').reduce((acc,t) => {
                for (var matches;  (matches = this.symbolPat.exec(t)); ) {
                    matches.index && acc.push(t.substring(0, matches.index));
                    acc.push(t.substring(matches.index,matches.index+1));
                    t = t.substring(matches.index+1);
                }
                t && acc.push(t);
                return acc;
            }, []);
        }

        tokensSSML(text) {
            var tokens = text instanceof Array ? text : this.tokenize(text);
            var tokensSSML = tokens.map(token => {
                return this.wordSSML(token) || token;
            });
            return tokensSSML;
        }

        segment(tokens) {
            var symbols = this.words._symbols;
            var acc = tokens.reduce((acc,token) => {
                if (token.length === 1 && this.symbolPat.test(token)) {
                    var symbol = symbols[token];
                    if (symbol == null) {
                        throw new Error(`undefined symbol: ${token}`);
                    }
                    acc.cuddle = symbol.cuddle;
                    if (acc.cuddle === 'left') {
                        acc.segment = acc.segment + token;
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
                return acc;
            }, {
                segments: [],
                segment: '',
                cuddle: null,
            });
            acc.segment && acc.segments.push(acc.segment);
            return acc.segments;
        }

        segmentSSML(text) {
            return this.segment(this.tokensSSML(text));
        }

        signature(text) {
            var json = {
                api: 'watson/text-to-speech/v1',
                audioMIME: this.audioMIME,
                voice: this.voice,
                prosody: this.prosody,
                text,
            }
            json[this.mj.hashTag] = this.mj.hash(json);
            return json;
        }

        synthesizeSSML(ssml, opts={}) {
            return new Promise((resolve, reject) => {
                var cache = opts.cache == null ? true : opts.cache;
                var rate = this.prosody.rate;
                var pitch = this.prosody.pitch;
                var synthesizeParams = {
                  text: `<prosody rate="${rate}" pitch="${pitch}">${ssml}</prosody>`,
                  accept: this.audioMIME,
                  voice: this.voice,
                };
                var signature = this.signature(synthesizeParams.text);
                var ERROR_SIZE = 1000;

                var outpath = this.store.signaturePath(signature);
                var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                if (cache && stats && stats.size > ERROR_SIZE) {
                    this.hits++;
                    resolve({
                        file: outpath,
                        stats,
                        signature,
                        hits: this.hits,
                        misses: this.misses,
                        cached: true,
                    });
                } else {
                    this.misses++;
                    var ostream = fs.createWriteStream(outpath);

                    this.textToSpeech.synthesize(synthesizeParams)
                    .on('error', function(error) {
                        console.log(`synthesize() error:`, error.stack);
                        reject(error);
                    })
                    .on('end', () => {
                        var hitPct = (100*this.hits/(this.hits+this.misses)).toFixed(1);
                        var stats = fs.existsSync(outpath) && fs.statSync(outpath);
                        if (stats && stats.size <= ERROR_SIZE) {
                            var err = fs.readFileSync(outpath).toString();
                            console.log(`synthesize() failed ${outpath}`, stats.size, err);
                            reject(new Error(err));
                        }
                        //console.log(`synthesize() ${outpath} cache:${cache} ${stats.size}B hits:${hitPct}%`);
                        var jsonPath = this.store.signaturePath(signature, ".json");
                        fs.writeFileSync(jsonPath, JSON.stringify(signature, null, 2));
                        resolve({
                            file: outpath,
                            stats,
                            hits: this.hits,
                            misses: this.misses,
                            signature,
                            cached: false,
                        });
                    })
                    .pipe(ostream);
                }
            });
        }

        synthesizeText(text, opts={}) {
            if (typeof text === 'string') {
                var promises = this.segmentSSML(text).map(ssml => this.synthesizeSSML(ssml, opts));
            } else if (text instanceof Array) {
                var textArray = text;
                var promises = textArray.map(t => this.synthesizeText(t));
            } else {
                return Promise.reject(new Error("synthesizeText(text?) expected string or Array"));
            }
            return Promise.all(promises);
        }
    }

    module.exports = exports.Watson = Watson;
})(typeof exports === "object" ? exports : (exports = {}));

