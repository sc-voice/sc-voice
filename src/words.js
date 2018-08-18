(function(exports) {
    const fs = require('fs');
    const path = require('path');

    class Words { 
        constructor(json, opts={}) {
            this.language = opts.language || 'en';
            if (json == null) {
                var wordpath = path.join(__dirname, `../words/${this.language}.json`);
                if (!fs.existsSync(wordpath)) {
                    var wordpath = path.join(__dirname, `../words/en.json`);
                }
                json = fs.existsSync(wordpath)
                    ? JSON.parse(fs.readFileSync(wordpath))
                    : {
                        symbols: {},
                        words: {},
                    };
            } 
            this.symbols = json.symbols;
            this.words = json.words;
            this.wordEnd = json.wordEnd;
            this.altMap = null;
            this.alphabet = new RegExp(json.alphabet || '[a-z]*', "iu");
            var symAcc= Object.keys(this.symbols).reduce((acc,text) => {
                if (text === ']') {
                    text = '\\' + text;
                }
                acc.text += text;
                return acc;
            }, { text: '' });
            this.symbolPat = new RegExp(`[${symAcc.text}]`);
        }

        isWord(token) {
            return !this.symbolPat.test(token);
        }

        isForeignWord(token) {
            return !this.symbolPat.test(token) && !this.alphabet.test(token);
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

        canonical(word) {
            return this.words[word] || null;
        }

        lookup(word) {
            var value = this.words[word];
            if (typeof value === 'string') {
                value = this.lookup(value);
            }
            return value && Object.assign({ word }, value) || null;
        }

        alternates(word) {
            word = word.toLowerCase();
            if (this.altMap == null) {
                this.altMap = {};
                Object.keys(this.words).forEach(key => {
                    var value = this.words[key];
                    if (value == null) {
                        // undefined word
                    } else if (typeof value === 'string') { // key is alternate
                        let keyAlts = this.altMap[value];
                        if (keyAlts) {
                            keyAlts.push(key); // key is alternate
                            this.altMap[key] = keyAlts;
                        } else {
                            this.altMap[value] = 
                            this.altMap[key] = [value,key];
                        }
                    } else { // key is canonical
                        let keyAlts = this.altMap[key];
                        if (keyAlts == null) {
                            this.altMap[key] = [key];
                        }
                    }
                });
            }

            return this.altMap[word] || [word];
        }

    }

    module.exports = exports.Words = Words;
})(typeof exports === "object" ? exports : (exports = {}));

