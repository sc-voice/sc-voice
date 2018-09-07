(function(exports) {
    const Words = require('./words');
    const SuttaCentralId = require('./sutta-central-id');
    const RE_PHRASE_END = new RegExp('.*[.?;,]$', 'u');
    const DEFAULT_PROP = 'scid';

    class Segments { // segmented document
        constructor(opts={}) {
            this.segments = opts.segments && opts.segments.map(seg => seg)  || [];
        }

        static get GROUP_SEP() { return '\n'; }

        static findIndexes(segments, pat, opts={}) {
            var prop = opts.prop || DEFAULT_PROP;
            if (prop === DEFAULT_PROP) {
                var re = pat instanceof RegExp ? pat : SuttaCentralId.scidRegExp(pat);
            } else {
                var re = pat instanceof RegExp ? pat : new RegExp(pat);
            }
            return segments.reduce((acc, seg, i) => {
                re.test(seg[prop]) && acc.push(i);
                return acc;
            },[]);
        }

        static findSegments(segments, pat, opts={}) {
            var prop = opts.prop || DEFAULT_PROP;
            if (prop === DEFAULT_PROP) {
                var re = pat instanceof RegExp ? pat : SuttaCentralId.scidRegExp(pat);
            } else {
                var re = pat instanceof RegExp ? pat : new RegExp(pat);
            }
            return segments.reduce((acc, seg, i) => {
                re.test(seg[prop]) && acc.push(seg);
                return acc;
            },[]);
        }

        static excerpt(segments, opts={}) {
            var rePhraseEnd = opts.rePhraseEnd || RE_PHRASE_END;
            if (!(rePhraseEnd instanceof RegExp)) {
                rePhraseEnd = new RegExp(rePhraseEnd, "u");
            }
            var groupSep = opts.groupSep || Segments.GROUP_SEP;
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
                        if (acc[i-1][acc[i-1].length-1] !== groupSep) {
                            acc[i-1] = acc[i-1] + groupSep;
                        }
                    } 
                    if (!segtext.match(rePhraseEnd)) {
                        segtext += groupSep;
                    }
                    acc.push(segtext);

                    prevgid = curgid;
                    return acc;
                }, []);
                return segments.map(seg => seg[opts.prop]);
            }
            return segments;
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

        /*
         * Copy the following if you don't want to extend Segments
         */
        findIndexes(pat, opts={}) {
            return Segments.findIndexes(this.segments, pat, opts);
        }

        findSegments(pat, opts={}) {
            return Segments.findSegments(this.segments, pat, opts);
        }

        indexOf(segid,opts={}) {
            return Segments.indexOf(this.segments, segid, opts);
        }

        excerpt(opts={}) {
            return Segments.excerpt(this.segments, opts);
        }

    }

    module.exports = exports.Segments = Segments;
})(typeof exports === "object" ? exports : (exports = {}));

