(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const SegDoc = require('./seg-doc');
    const Words = require('./words');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS} *$`);
    const DEFAULT_PROP = 'en';
    const MIN_PHRASE = 10;
    const RE_TRIM_ELLIPSIS = /\s*[,.;\u2026].*$/u;
    const RE_PUNCT_END = /[.,;].*$/u;

    class Template {
        constructor(parms={}) {
            var segments = parms.segments;
            if (!(segments instanceof Array)) {
                throw new Error('expected Array of segments');
            }
            this.segments = segments;

            var alternates = parms.alternates;
            if (typeof alternates === 'string') {
                alternates = [alternates];
            }
            if (!(alternates instanceof Array)) {
                throw new Error('expected array of alternates');
            }
            this.alternates = alternates;

            this.prop = parms.prop || DEFAULT_PROP;
            this.candidates = parms.candidates;

            var seg0text = segments[0][this.prop];
            var alt0 = alternates[0];
            var seg0parts = seg0text.split(alt0);
            this.prefix = parms.prefix || seg0parts[0];

            this.reAlternates = new RegExp(`${alternates.join('|')}`,'u');
            this.prefixLen = this.prefix.length;
        }

        
        static commonPhrase(a,b, minLength=MIN_PHRASE) {
            var x = a.split(' ');
            var y = b.split(' ');
            var c = new Array(x.length+1).fill(null).map(() => new Array(y.length+1).fill(null));
            for (var i = 0; i <= x.length; i++) {
                c[i][0] = 0;
            }
            for (var j = 0; j <= y.length; j++) {
                c[0][j] = 0;
            }
            var lcs = []
            for (var i = 1; i <= x.length; i++) {
                for (var j = 1; j <= y.length; j++) {
                    if (x[i-1] === y[j-1]) {
                        c[i][j] = c[i-1][j-1] + 1;
                        lcs[c[i][j]] = x[i-1];
                    } else if (c[i][j-1] > c[i-1][j]) {
                        c[i][j] = c[i][j-1];
                    } else {
                        c[i][j] = c[i-1][j];
                    }
                }
            }
            while (1 < lcs.length) {
                if (a.indexOf(`${lcs[0]} ${lcs[1]}`) < 0) {
                    lcs.shift();
                } else if (a.indexOf`${lcs[lcs.length-2]} ${lcs[lcs.length-1]}` < 0) {
                    lcs.pop();
                }
                var pat = lcs.join(' ');
                if (a.indexOf(pat) >= 0 && b.indexOf(pat) >= 0) {
                    return pat.length < minLength ? '' : pat;
                }
            }
            return '';
        }
                            
        static findAlternates(segments, prop=DEFAULT_PROP) {
            var ie = SegDoc.findIndexes(segments, RE_ELLIPSIS, {prop});

            if (ie.length === 0) {
                return null; // segments are fully expanded
            }
            if (ie.length <= 1) {
                throw new Error(`not implemented:`+
                    JSON.stringify(segments[ie[0]]));
            }

            /* 
             * The first alternate is found by searching back for a phrase common
             * to the first and second alternate segments. 
             */
            var phrase = '';
            for (var it = ie[0]; !phrase && 0 <= --it; ) {
                phrase = Template.commonPhrase(segments[ie[0]][prop], segments[it][prop]);
            }
            if (!phrase) {
                console.error(`no expansion template for alternate:`+ JSON.stringify(segments[ie[0]],null,2));
                return null;
            }

            /*
             * The substitution prefix is found on the second alternate 
             * (i.e., the segment with the first ellipsis).
             */
            var text1 = segments[ie[0]][prop];
            var prefix = text1.substring(0, text1.indexOf(phrase) + phrase.length + 1);

            var indexes = SegDoc.findIndexes(segments, `${phrase}`, {prop});
            var values = [];
            if (2 < indexes.length) { // phrase distinguishes discontinguous alternates
                it = indexes[0];
                var prevIndex = -1;
                values = indexes.reduce((acc,iseg,i) => {
                    var seg = segments[iseg];
                    var alt = seg[prop].split(phrase)[1].trim();
                    if (i === prevIndex+1) {
                        acc.push(alt.replace(RE_TRIM_ELLIPSIS,''));
                    }
                    prevIndex = i;
                    return acc;
                }, []);
            } else { // phrase cannot be used, so assume continguous alternates
                var indexes = [it];
                var alt = segments[it][prop];
                alt = alt.split(phrase)[1].trim();
                alt = alt.replace(RE_PUNCT_END,'');
                values = [alt];
                for (var i = 0; i<ie.length; i++ ) {
                    var seg = segments[ie[i]];
                    var alt = seg[prop];
                    if (alt.match(phrase)) {
                        alt = alt.split(phrase)[1].trim();
                        alt = alt.replace(RE_TRIM_ELLIPSIS, '');
                    } else if (i && ie[i-1]+1 === ie[i]){
                        alt = alt.replace(RE_TRIM_ELLIPSIS, '');
                    } else {
                        break;
                    }
                    values.push(alt); 
                    indexes.push(ie[i]);
                }
            }

            if (indexes.length > 1 && 1 < indexes[1] - indexes[0]) { // possible closing alt
                var template2 = segments[indexes[0]+1][prop];
                var iEnd = indexes[indexes.length - 1] + 1;
                var end2 = segments[iEnd+1][prop];
                var endPhrase = Template.commonPhrase(template2, end2);
                if (endPhrase) {
                    var altEnd = segments[iEnd][prop].replace(RE_PUNCT_END, '');
                    if (altEnd) {
                        indexes.push(iEnd);
                        values.push(altEnd);
                    }
                }
            }

            return {
                phrase,
                prefix,
                values,
                indexes,
            }
        }

        expand(segment) {
            var src = this.segments[0][this.prop];
            var dst = segment[this.prop];
            var dstTokens = dst.split(this.reAlternates);
            if (dstTokens.length < 1) {
                throw new Error(`could not find anything to expand:${dst}`);
            }
            var repLen = (dst.length - dstTokens.join('').length)/(dstTokens.length-1);
            var repStart = dstTokens[0].length;
            var replacement = dst.substring(repStart,repStart+repLen);
            var scid = segment.scid;
            return this.segments.map((seg,i) => {
                var re = new RegExp(this.alternates[0], 'ug'); // WARNING: RegExp g is stateful
                var propCopy = seg[this.prop].replace(re, replacement);
                if (i === 0) {
                    var prefix = dstTokens[0] || this.prefix;
                    propCopy = prefix + propCopy.substring(this.prefixLen);
                }
                return {
                    scid: `${scid}.${i+1}`,
                    [this.prop]: propCopy,
                };
            });
        }

    }

    module.exports = exports.Template = Template;
})(typeof exports === "object" ? exports : (exports = {}));

