(function(exports) {
    const Words = require('./words');
    const SuttaCentralId = require('./sutta-central-id');

    class SegDoc { // segmented document
        constructor(opts={}) {
            this.segments = opts.segments && opts.segments.map(seg => seg)  || [];
            this.groupSep = opts.groupSep || '\n';
            this.reSegEnd = opts.reSegEnd || ".*[.?;,]$";
            if (!(this.reSegEnd instanceof RegExp)) {
                this.reSegEnd = new RegExp(this.reSegEnd, "u");
            }
        }

        static findIndexes(segments, pat, opts={}) {
            var prop = opts.prop || 'scid';
            if (prop === 'scid') {
                var re = pat instanceof RegExp ? pat : SuttaCentralId.scidRegExp(pat);
            } else {
                var re = pat instanceof RegExp ? pat : new RegExp(pat);
            }
            return segments.reduce((acc, seg, i) => {
                re.test(seg[prop]) && acc.push(i);
                return acc;
            },[]);
        }

        findIndexes(pat, opts={}) {
            return SegDoc.findIndexes(this.segments, pat, opts);
        }

        static findSegments(segments, pat, opts={}) {
            var prop = opts.prop || 'scid';
            if (prop === 'scid') {
                var re = pat instanceof RegExp ? pat : SuttaCentralId.scidRegExp(pat);
            } else {
                var re = pat instanceof RegExp ? pat : new RegExp(pat);
            }
            return segments.reduce((acc, seg, i) => {
                re.test(seg[prop]) && acc.push(seg);
                return acc;
            },[]);
        }

        findSegments(pat, opts={}) {
            return SegDoc.findSegments(this.segments, pat, opts);
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

        excerpt(range={}) {
            var start = this.indexOf(range.start || 0);
            var end = this.indexOf(range.end || this.segments.length);
            var segments = this.segments.slice(start, end);
            if (range.prop != null) {
                var prevgid = null;
                return segments.reduce((acc, seg, i) => {
                    var segtext = seg[range.prop];
                    var scid = new SuttaCentralId(seg.scid);
                    var curgid = scid.parent.scid;

                    if (prevgid && curgid != prevgid) {
                        if (acc[i-1][acc[i-1].length-1] !== this.groupSep) {
                            acc[i-1] = acc[i-1] + this.groupSep;
                        }
                    } 
                    if (!segtext.match(this.reSegEnd)) {
                        segtext += this.groupSep;
                    }
                    acc.push(segtext);

                    prevgid = curgid;
                    return acc;
                }, []);
                return segments.map(seg => seg[range.prop]);
            }
            return segments;
        }

    }

    module.exports = exports.SegDoc = SegDoc;
})(typeof exports === "object" ? exports : (exports = {}));

