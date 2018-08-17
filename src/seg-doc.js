(function(exports) {

    class SegDoc { // segmented document
        constructor(json={}, opts={}) {
            this.segments = json.segments || [];
        }

        find(pat, opts={}) {
            if (!(pat instanceof RegExp)) {
                pat = new RegExp(pat);
            }
            var prop = opts.prop || 'en';
            return this.segments.reduce((acc, seg, i) => {
                pat.test(seg[prop]) && acc.push(i);
                return acc;
            },[]);
        }

    }

    module.exports = exports.SegDoc = SegDoc;
})(typeof exports === "object" ? exports : (exports = {}));

