

(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Sutta = require('./sutta');
    const SuttaCentralId = require('./sutta-central-id');
    const Section = require('./section');
    const Words = require('./words');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS} *$`);
    const DEFAULT_PROP = 'en';
    const MIN_PHRASE = 8;
    const MAX_LEVENSHTEIN = 2;
    const RE_TRIM_ELLIPSIS = /\s*[,.;\u2026].*$/u;
    const RE_PUNCT_END = /[.,;].*$/u;
    const RE_WORDS = new RegExp(`[ ${Words.U_EMDASH}]`, 'u');

    class SectionParser {
        constructor(opts={}) {
            this.type = this.constructor.name;
            this.prop = opts.prop || DEFAULT_PROP;
        }

        stripValue(value) {
            var words = value.split(' ');
            var len = words.length;
            if (len>=3 && words[len-1] === words[len-3]) {
                return words[len-1]; // earth as earth => earth
            }
            return value;
        }

        expandableSegments(segments) {
            var ie = Sutta.findIndexes(segments, RE_ELLIPSIS, {
                prop: this.prop,
            });

            if (ie.length === 0) {
                return null; // segments are fully expanded
            }
            if (ie.length <= 1) {
                throw new Error(`not implemented:`+
                    JSON.stringify(segments[ie[0]]));
            }
            return ie;
        }

        parseAlternatesByPhrase(segments, phrase, prefix) {
            var prop = this.prop;
            var indexes = Sutta.findIndexes(segments, `${phrase}`, {prop});
            var it = indexes[0];
            var prevIndex = -1;
            var values = indexes.reduce((acc,iseg,i) => {
                var text = segments[iseg][prop];
                var alt = text.split(phrase)[1].trim();
                if (i === prevIndex+1) {
                    acc.push(alt.replace(RE_TRIM_ELLIPSIS,''));
                }
                prevIndex = i;
                return acc;
            }, []);

            return {
                indexes,
                prefix,
                values,
            }
        }

        parseContiguousAlternates(segments, phrase, prefix, iTemplate, ie) {
            var prop = this.prop;
            var indexes = [iTemplate];
            let alt0 = segments[iTemplate][prop].split(phrase)[1].trim();
            alt0 = alt0.replace(RE_PUNCT_END,'');
            var values = [this.stripValue(alt0)];
            for (let i = 0; i<ie.length; i++ ) {
                if (i && ie[i-1]+1 !== ie[i]){
                    break; // non-consecutive
                }
                let seg = segments[ie[i]];
                let alt = seg[prop];
                let phrased = alt.split(phrase);
                if (phrased.length > 1) {
                    alt = phrased[1].trim();
                    alt = alt.replace(RE_TRIM_ELLIPSIS, ''); 
                } else {
                    alt = alt.replace(RE_TRIM_ELLIPSIS, ''); 
                }
                if (i === 1) {
                    var prefix = Words.commonPhrase(values[1], alt, MIN_PHRASE);
                    if (prefix === '') {
                        var words1 = values[1].split(' ');
                        var words2 = alt.split(' ');
                        values[1] = words1.slice(words1.length-words2.length)
                            .join(' ');
                        prefix = segments[ie[0]][prop]
                            .replace(new RegExp(`${values[1]}.*`), '');
                    }
                }
                values.push(alt);
                indexes.push(ie[i]);
            }

            return {
                indexes,
                prefix,
                values,
            }
        }

        sectionGroup(segments, start, length) {
            var patStart = new SuttaCentralId(segments[start].scid).parent.scid + '*';
            var startIndexes = Sutta.findIndexes(segments, patStart); 
            var iStart = startIndexes[0];

            var patLast = new SuttaCentralId(segments[start+length-1].scid).parent.scid + '*';
            var lastIndexes = Sutta.findIndexes(segments, patLast); 
            var iEnd = lastIndexes[lastIndexes.length-1]+1;

            return segments.slice(iStart, iEnd);
       }

        parseExpandableSection(segments) {
            var prop = this.prop;
            var ie = this.expandableSegments(segments);
            if (ie == null) {
                return null;    
            }

            /* 
             * The first alternate is found by searching back for a phrase common
             * to the first and second alternate segments. 
             */
            var phrase = '';
            for (var it = ie[0]; !phrase && 0 <= --it; ) {
                phrase = Words.commonPhrase(segments[ie[0]][prop], segments[it][prop], MIN_PHRASE);
            }
            if (!phrase) {
                console.error(`no expansion template for alternate:`+ 
                    JSON.stringify(segments[ie[0]],null,2));
                return null;
            }

            /*
             * The substitution prefix is found on the second alternate 
             * (i.e., the segment with the first ellipsis).
             */
            var text1 = segments[ie[0]][prop];
            var prefix = text1.substring(0, text1.indexOf(phrase) + phrase.length + 1);

            var values = [];
            if (ie[0]+1 !== ie[1]) { // discontinguous alternates
                var {
                    indexes,
                    prefix,
                    values,
                } = this.parseAlternatesByPhrase(segments, phrase, prefix);
            } else { // phrase cannot be used, so assume continguous alternates
                var {
                    indexes,
                    prefix,
                    values,
                } = this.parseContiguousAlternates(segments, phrase, prefix, it, ie);
            }

            if (indexes.length > 1 && 1 < indexes[1] - indexes[0]) { 
                // possible closing alt
                var template2 = segments[indexes[0]+1][prop];
                var iEnd = indexes[indexes.length - 1] + 1;
                var end2 = segments[iEnd+1][prop];
                var endPhrase = Words.commonPhrase(template2, end2, MIN_PHRASE);
                if (endPhrase) {
                    var altEnd = segments[iEnd][prop].replace(RE_PUNCT_END, '');
                    if (altEnd) {
                        indexes.push(iEnd);
                        altEnd = altEnd.replace(prefix, '');
                        values.push(this.stripValue(altEnd));
                    }
                }
            }

            var templateLength = indexes[1] - indexes[0];
            var template = [];
            for (var i = indexes[0]; i < indexes[1]; i++) {
                if (segments[i][prop].indexOf(values[1]) >= 0) {
                    break;
                }
                template.push(segments[i]);
            }
            
            var start = indexes[0];
            while (start>0 && segments[start-1][prop].indexOf(values[0]) >= 0) {
                start--;
            }
            var length = indexes[indexes.length-1] - start + template.length;

            return new Section({
                prefix,
                values,
                template,
                segments: this.sectionGroup(segments, start, length),
            });
        }

    }

    module.exports = exports.SectionParser = SectionParser;
})(typeof exports === "object" ? exports : (exports = {}));

