(function(exports) {
    const Words = require('./words');

    class SegDoc { // segmented document
        constructor(json={}, opts={}) {
            this.segments = json.segments || [];
            this.words = new Words();
            this.groupSep = opts.groupSep || '';
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

        indexOf(segid,opts={}) {
            var prop = opts.prop || "scid";
            if (typeof segid === "number") {
                return segid;
            } else if (typeof segid === "string") {
                var findOpts = Object.assign({
                    prop,
                }, opts);
                var indexes = this.findIndexes(segid, findOpts);
                if (indexes.length < 1) {
                    throw new Error(`Segment not found for segid:${segid}`);
                } else if (indexes.length > 1) {
                    throw new Error(`Ambiguous match for segid:${segid} matches:${indexes.length}`);
                }
                return indexes[0];
            } else {
                throw new Error("invalid segid");
            }
        }

        static segmentGroups(scid) {
            var tokens = scid.split(':');
            return tokens[tokens.length-1].split('.');
        }

        excerpt(range={}) {
            var start = this.indexOf(range.start || 0);
            var end = this.indexOf(range.end || this.segments.length);
            var segments = this.segments.slice(start, end);
            if (range.prop != null) {
                var prevGroups = null;
                return segments.reduce((acc, seg, i) => {
                    var scidGroups = SegDoc.segmentGroups(seg.scid);
                    var curGroups = JSON.stringify(scidGroups.slice(0, scidGroups.length-1));
                    if (prevGroups && curGroups != prevGroups) {
                        acc.push(this.groupSep);
                    }
                    acc.push(seg[range.prop]);
                    prevGroups = curGroups;
                    return acc;
                }, []);
                return segments.map(seg => seg[range.prop]);
            }
            return segments;
        }

    }

    module.exports = exports.SegDoc = SegDoc;
})(typeof exports === "object" ? exports : (exports = {}));

