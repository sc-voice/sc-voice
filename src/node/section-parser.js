(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Sutta = require('./sutta');
    const { SuttaCentralId } = require('suttacentral-api');
    const Section = require('./section');
    const Words = require('./words');
    const RE_ELLIPSIS = new RegExp(` *${Words.U_ELLIPSIS} *$`, 'u');
    const DEFAULT_PROP = 'en';
    const MIN_PHRASE = 8;
    const MAX_LEVENSHTEIN = 2;
    const RE_TRIM_ELLIPSIS = /\s*[,.;\u2026].*$/u;
    const RE_PUNCT_END = /[.,;!?].*$/u;
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
            var iEll = Sutta.findIndexes(segments, RE_ELLIPSIS, {
                prop: this.prop,
            });

            if (iEll.length === 0) {
                return null; // segments are fully expanded
            }
            if (iEll.length <= 1) {
                throw new Error(`not implemented:`+
                    JSON.stringify(segments[iEll[0]]));
            }
            return iEll;
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

        parseContiguousAlternates(segments, phrase, prefix, iTemplate, iEll) {
            var prop = this.prop;
            var indexes = [iTemplate];
            let alt0 = segments[iTemplate][prop].split(phrase)[1].trim();
            alt0 = alt0.replace(RE_PUNCT_END,'');
            //console.debug(`parseContiguousAlternates alt0:"${alt0}" iEll:${JSON.stringify(iEll)}`);
            var values = [this.stripValue(alt0)];
            for (let i = 0; i<iEll.length; i++ ) {
                if (i && !this.areAdjacent(segments, iEll[i-1], iEll[i], prop)){
                    break; // non-consecutive
                }
                let seg_i = segments[iEll[i]];
                let alt_i = seg_i[prop];
                let phrased = alt_i.split(phrase);
                if (phrased.length > 1) {
                    alt_i = phrased[1].trim();
                    alt_i = alt_i.replace(RE_TRIM_ELLIPSIS, ''); 
                } else {
                    alt_i = alt_i.replace(RE_TRIM_ELLIPSIS, ''); 
                }
                if (i === 1) {
                    prefix = Words.commonPhrase(values[1], alt_i, MIN_PHRASE);
                    //console.debug(`parseContiguousAlternates phrase:"${phrase}" prefix:"${prefix}"`);
                    if (prefix === '') {
                        var words1 = values[1].split(' ');
                        var words2 = alt_i.split(' ');
                        values[1] = words1.slice(words1.length-words2.length)
                            .join(' ');
                        prefix = segments[iEll[0]][prop]
                            .replace(new RegExp(`${values[1]}.*`), '');
                    }
                    if (values[0].startsWith(prefix)) {
                        prefix = phrase + ' ';
                    }
                }
                values.push(alt_i);
                //console.debug(`values:${values}`);
                indexes.push(iEll[i]);
            }

            return {
                indexes,
                prefix, // replacement prefix
                values,
            }
        }

        sectionGroup(segments, start, length) {
            var patStart = new SuttaCentralId(segments[start].scid).parent.scid + '*';
            var startIndexes = Sutta.findIndexes(segments, patStart); 
            var iStart = startIndexes[0];
            //console.debug(`sectionGroup start:${start} patStart:"${patStart}" startIndexes:${startIndexes} length:${length}`);

            var patLast = new SuttaCentralId(segments[start+length-1].scid).parent.scid + '*';
            var lastIndexes = Sutta.findIndexes(segments, patLast); 
            var iEnd = lastIndexes[lastIndexes.length-1]+1;
            //console.debug(`sectionGroup patLast:"${patLast}" lastIndexes:${lastIndexes} iEnd:${iEnd}`);

            return segments.slice(iStart, iEnd);
        }

        areAdjacent(segments, iSeg1, iSeg2, prop=DEFAULT_PROP) {
            (iSeg1 > iSeg2) && ({iSeg1, iSeg2} = {iSeg2, iSeg1});
            for (var i = iSeg1+1; i < iSeg2; i++) {
                var text = segments[i][prop].trim();
                //console.debug(`text:"${text}"`);
                if (text.length) {
                    return false;
                }
            }
            return true;
        }

        parseExpandableSection(segments) {
            var prop = this.prop;
            var iEll = this.expandableSegments(segments);
            if (iEll == null) {
                return null;    
            }

            /* 
             * The first alternate is found by searching back for a phrase common
             * to the first and second alternate segments. 
             */
            var phrase = '';
            for (var it = iEll[0]; !phrase && 0 <= --it; ) {
                phrase = Words.commonPhrase(segments[iEll[0]][prop], segments[it][prop], MIN_PHRASE);
            }
            var text1 = segments[iEll[0]][prop].replace(RE_ELLIPSIS,'');
            if (iEll.length > 2) {
                var text2 = segments[iEll[1]][prop].replace(RE_ELLIPSIS,'');
                var text3 = segments[iEll[2]][prop].replace(RE_ELLIPSIS,'');
                //console.debug(`parseExpandableSection text1:"${text1}"`);
                //console.debug(`parseExpandableSection text2:"${text2}"`);
                //console.debug(`parseExpandableSection text3:"${text3}" iEll:${iEll.length}`);
                var p12 = Words.commonPhrase(text1, text2, MIN_PHRASE);
                var p23 = Words.commonPhrase(text2, text3, MIN_PHRASE);
                //console.debug(`p12:"${p12}" p23:"${p23}"`);
                if (p12 && p12 !== p23) {
                    // mn41 special case
                    phrase = phrase.replace(p12, '').trim();
                    //console.debug(`parseExpandableSection phrase:"${phrase}"`); 
                }
            }
            if (!phrase) {
                console.error(`no expansion template for alternate:`+ 
                    JSON.stringify(segments[iEll[0]],null,2));
                return null;
            }

            /*
             * The substitution prefix is found on the second alternate 
             * (i.e., the segment with the first ellipsis).
             */
            var prefix = text1.substring(0, text1.indexOf(phrase) + phrase.length + 1);
            //console.debug(`parseExpandableSection prefix:"${prefix}"`);

            var values = [];
            if (this.areAdjacent(segments, iEll[0], iEll[1], prop)) {
                var {
                    indexes,
                    prefix,
                    values,
                } = this.parseContiguousAlternates(segments, phrase, prefix, it, iEll);
            } else { 
                var {
                    indexes,
                    prefix,
                    values,
                } = this.parseAlternatesByPhrase(segments, phrase, prefix);
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

            var alternateStep = (indexes[2] - indexes[1]) || 1;
            var template = [];
            for (var i = indexes[0]; i + alternateStep <= indexes[1]; i++) {
                if (segments[i][prop].indexOf(values[1]) >= 0) {
                    break;
                }
                template.push(segments[i]);
            }
            
            var start = indexes[0];
            while (start>0 && segments[start-1][prop].indexOf(values[0]) >= 0) {
                start--;
            }
            //console.debug(`parseExpandableSection start:${start} indexes:${indexes}`);
            var lastIndex  = indexes[indexes.length-1]; 
            var textLast = segments[lastIndex][prop];
            if (!RE_ELLIPSIS.test(textLast)) { // last value was expanded
                lastIndex += template.length - 1;
            }
            //console.debug(`textLast:"${textLast}"`);
            var length = lastIndex-start+1;
            //console.debug(`parseExpandableSection lastIndex:${lastIndex} template:${template.length} length:${length}`);

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

