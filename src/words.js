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
            this._ipa = json.ipa || {};
            this._romanize = json.romanize || {};
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

        static get U_LSQUOTE() { return '\u2018'; }
        static get U_RSQUOTE() { return '\u2019'; }
        static get U_LDQUOTE() { return '\u201C'; }
        static get U_RDQUOTE() { return '\u201D'; }
        static get U_ENDASH() { return '\u2013'; }
        static get U_EMDASH() { return '\u2014'; }
        static get U_ELLPSIS() { return '\u2026'; }
        static get U_A_MACRON() { return '\u0100'; }
        static get U_a_MACRON() { return '\u0101'; }
        static get U_u_MACRON() { return '\u016d'; /* UTF-8 c5ab */ }

        isWord(token) {
            return !this.symbolPat.test(token) && !/^[0-9]*$/.test(token);
        }

        isForeignWord(token) {
            return !this.symbolPat.test(token) && !this.alphabet.test(token);
        }

        romanize(text) {
            if (this.romanizePats == null) {
                var srcChars = Object.keys(this._romanize);
                this.romanizePats = srcChars.map(c => ({
                    rep: this._romanize[c],
                    pat: new RegExp(c, "gui"),
                }));
            }
            var result = text.toLowerCase();
            this.romanizePats.forEach((pat,i) => {
                result = result.replace(pat.pat, pat.rep);
            });
            return result;
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

        utf16(text,minCode=0) {
            var result = "";
            for (var i=0; i < text.length; i++) {
                var code = text.charCodeAt(i);
                var c = text.charAt(i);
                if (code > minCode) {
                    var hex  = '000' + code.toString(16).toUpperCase();
                    c = `\\u${hex.substring(hex.length-4)}`;
                }
                result += c;
            }
            return result;
        }

        ipa(text,language='pli') {
            var map = this._ipa[language];
            if (map == null) {
                return text;
            }
            var result = String(text);
            var keys = Object.keys(map).sort((a,b) => {
                var c = a.length - b.length;
                if (c) {
                    return -c;
                }
                return a.localeCompare(b);
            });
            var pats = keys.map(key => {
                var value = this.utf16(map[key]).toUpperCase();
                var pat = new RegExp(`${key}`,"ug");
                result = result.replace(pat, value);
            });
            result = result.replace(/U/g,'u');
            return eval(`"${result}"`);
        }

    }

    module.exports = exports.Words = Words;
})(typeof exports === "object" ? exports : (exports = {}));

