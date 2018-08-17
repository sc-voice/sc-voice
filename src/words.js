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
            this.alternates = {};
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
        }

    }

    module.exports = exports.Words = Words;
})(typeof exports === "object" ? exports : (exports = {}));

