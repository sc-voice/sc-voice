(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const Section = require('./section');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const RE_PHRASE_END = new RegExp('.*[.?;,]$', 'u');
    const FIND_PROP = 'scid';
    const OPTS_EN = {
        prop: 'en',
    };

    class Sutta { 
        constructor(opts={}) {
            this.sections = opts.sections || [new Section({
                segments: opts.segments || [],
            })];
        }

        static get GROUP_SEP() { return '\n'; }

        static scidGroup(segments, scid) {
            if (typeof scid === 'string') {
                scid = new SuttaCentralId(scid);
            }

            if (!(scid instanceof SuttaCentralId)) {
                throw new Error('expected a SuttaCentralId');
            }
            var parent = scid.parent;
            if (parent.scid == null) {
                throw new Error(`scidGroup() not implemented for sutta scid:${scid}`);
            }
            var wildcard = "*";
            var segments = Sutta.findSegments(segments, parent.scid + wildcard,  {
                prop: 'scid',
            });
            return {
                scid: parent.scid,
                segments,
            }
        }

        static findIndexes(segments, pat, opts={}) {
            var prop = opts.prop || FIND_PROP;
            if (prop === FIND_PROP) {
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
            var prop = opts.prop || FIND_PROP;
            if (prop === FIND_PROP) {
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
            var groupSep = opts.groupSep || Sutta.GROUP_SEP;
            var start = Sutta.indexOf(segments, opts.start || 0);
            var end = Sutta.indexOf(segments, opts.end || segments.length);
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
                var indexes = Sutta.findIndexes(segments, segid, findOpts);
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

        get segments() {
            return this.sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
        }

        findIndexes(pat, opts={}) {
            return Sutta.findIndexes(this.segments, pat, opts);
        }

        findSegments(pat, opts={}) {
            return Sutta.findSegments(this.segments, pat, opts);
        }

        indexOf(segid,opts={}) {
            return Sutta.indexOf(this.segments, segid, opts);
        }

        excerpt(opts={}) {
            return Sutta.excerpt(this.segments, opts);
        }

        scidGroup(scid) {
            return Sutta.scidGroup(this.segments, scid);
        }

        nextSegment(scid, offset=1) {
            scid = scid.toString();
            var indexes = this.findIndexes(scid);
            if (indexes == null || indexes.length === 0) {
                return null;
            }
            var nextIndex = offset + 
                (offset < 0 ? indexes[0] : indexes[indexes.length-1]);
            return this.segments[nextIndex] || null;
        }

        commonPrefix(s0, s1) {
            var len = Math.min(s0.length, s1.length);
            for (var i=0; i<len; i++) {
                if (s0.charAt(i) !== s1.charAt(i)) {
                    break;
                }
            }
            return s0.substring(0, i);
        }

    }

    module.exports = exports.Sutta = Sutta;
})(typeof exports === "object" ? exports : (exports = {}));

