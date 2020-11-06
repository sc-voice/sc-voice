(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const Section = require('./section');
    const { Definitions } = require('suttacentral-api');
    const { SuttaCentralId } = require('scv-bilara');
    const RE_HEADER = new RegExp(`^.*:0\\..*$`, 'u');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const RE_PHRASE_END = new RegExp('.*[.?;,]$', 'u');
    const FIND_PROP = 'scid';
    const OPTS_EN = {
        prop: 'en',
    };

    class Sutta { 
        constructor(opts={}) {
            if (!(this.sutta_uid = opts.sutta_uid)) {
                throw new Error('sutta_uid is required');
            }
            opts.author_uid && (this.author_uid = opts.author_uid);
            if (opts.segmented == null) {
                opts.support && (this.support = opts.support);
            } else {
                this.support = opts.segmented
                    ? Definitions.SUPPORT_LEVELS.Supported
                    : Definitions.SUPPORT_LEVELS.Legacy;
            }

            opts.suttaplex && (this.suttaplex = opts.suttaplex);
            this.translation = Object.assign({}, opts.translation);
            delete this.translation.text;
            delete this.translation.strings;
            opts.metaarea && (this.metaarea = opts.metaarea);

            var segments = opts.segments || [];
            var suid = new SuttaCentralId(this.sutta_uid).standardForm();
            this.titles = opts.titles || [`${suid}`];
            this.author = opts.author || this.translation.author 
                || '(no-author)';
            this.lang = opts.lang || 'en';
            this.sections = opts.sections || 
                Sutta.defaultSections(segments, this.lang);
            Object.defineProperty(this, 'suttaCode', {
                enumerable: true,
                get() {
                    return [
                        this.sutta_uid,
                        this.translation.lang,
                        this.translation.author_uid,
                    ].join('/');
                }
            });

        }

        static isHeader(segment) {
            return segment && segment.scid.match(RE_HEADER);
        } 

        static defaultSections(segments=[], lang='en') {
            segments = segments.slice();
            var sections = [];
            var header = [];
            while (Sutta.isHeader(segments[0])) {
                header.push(segments.shift());
            }
            header.length && sections.push(new Section({
                segments:header,
                prop: lang,
            }));
            segments.length && sections.push(new Section({
                segments,
                prop: lang,
            }));
            return sections;
        }

        static get GROUP_SEP() { return '\n'; }

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
                    var segtext = seg[opts.prop] || '';
                    if (segtext == null) {
                        throw new Error(`Expected property "${opts.prop}" `+
                            `in ${JSON.stringify(seg)}`);
                    }
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
                    throw new Error(
                        `Ambiguous match for segid:${segid} matches:${indexes.length}`);
                }
                return indexes[0];
            } else {
                throw new Error("invalid segid");
            }
        }

        static textOfSegments(segments, opts={}) {
            var prop = opts.prop || 'en';
            var rePhraseEnd = opts.rePhraseEnd || RE_PHRASE_END;
            if (!(rePhraseEnd instanceof RegExp)) {
                rePhraseEnd = new RegExp(rePhraseEnd, "u");
            }
            var groupSep = opts.groupSep || Sutta.GROUP_SEP;
            var prevgid = null;
            return segments.reduce((acc, seg, i) => {
                var segtext = seg[prop];
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

