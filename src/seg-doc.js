(function(exports) {
    const Words = require('./words');

    class SegDoc { // segmented document
        constructor(json={}, opts={}) {
            this.segments = json.segments || [];
            this.words = new Words();
        }

        findIndexes(pat, opts={}) {
            if (!(pat instanceof RegExp)) {
                pat = new RegExp(pat);
            }
            var prop = opts.prop || 'en';
            return this.segments.reduce((acc, seg, i) => {
                pat.test(seg[prop]) && acc.push(i);
                return acc;
            },[]);
        }

        findSegments(pat, opts={}) {
            if (!(pat instanceof RegExp)) {
                pat = new RegExp(pat);
            }
            var prop = opts.prop || 'en';
            return this.segments.reduce((acc, seg, i) => {
                pat.test(seg[prop]) && acc.push(seg);
                return acc;
            },[]);
        }

        createPattern(text) {
            var words = this.words.tokenize(text);
            var pat = words.reduce((acc,word) => {
                var alts = this.words.alternates(word);
                var wordPat = (alts.length === 1)
                    ? alts[0]
                    : `(${alts.join('|')})`;
                acc = acc ? `${acc} ${wordPat}` : wordPat;
                return acc;
            }, "");
            var wordEnd = this.words.wordEnd || "";
            return new RegExp(`${pat}${wordEnd}`, "iu");
        }

    }

    module.exports = exports.SegDoc = SegDoc;
})(typeof exports === "object" ? exports : (exports = {}));

