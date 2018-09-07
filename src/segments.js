(function(exports) {
    const Words = require('./words');
    const SuttaCentralId = require('./sutta-central-id');

    class Segments { // segmented document
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
            return Segments.findIndexes(this.segments, pat, opts);
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
            return Segments.findSegments(this.segments, pat, opts);
        }

        indexOf(segid,opts={}) {
            return Segments.indexOf(this.segments, segid, opts);
        }

        static indexOf(segments, segid, opts={}) {
            var prop = opts.prop || "scid";
            if (typeof segid === "number") {
                return segid;
            } else if (typeof segid === "string") {
                var findOpts = Object.assign({
                    prop,
                }, opts);
                var indexes = Segments.findIndexes(segments, segid, findOpts);
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

        excerpt(opts={}) {
            opts = Object.assign({
                groupSep: this.groupSep,
                reSegEnd: this.reSegEnd,
                prop: this.prop,
            }, opts);
            return Segments.excerpt(this.segments, opts);
        }

        static excerpt(segments, opts={}) {
            var start = Segments.indexOf(segments, opts.start || 0);
            var end = Segments.indexOf(segments, opts.end || segments.length);
            var segments = segments.slice(start, end);
            if (opts.prop != null) {
                var prevgid = null;
                return segments.reduce((acc, seg, i) => {
                    var segtext = seg[opts.prop];
                    var scid = new SuttaCentralId(seg.scid);
                    var curgid = scid.parent.scid;

                    if (prevgid && curgid != prevgid) {
                        if (acc[i-1][acc[i-1].length-1] !== opts.groupSep) {
                            acc[i-1] = acc[i-1] + opts.groupSep;
                        }
                    } 
                    if (!segtext.match(opts.reSegEnd)) {
                        segtext += opts.groupSep;
                    }
                    acc.push(segtext);

                    prevgid = curgid;
                    return acc;
                }, []);
                return segments.map(seg => seg[opts.prop]);
            }
            return segments;
        }

    }

    module.exports = exports.Segments = Segments;
})(typeof exports === "object" ? exports : (exports = {}));

