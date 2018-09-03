(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const segDoc = require('./seg-doc');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const Template = require('./template');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);
    const OPTS_EN = {
        prop: 'en',
    };

    class Sutta extends segDoc { 
        constructor(json={}, opts={}) {
            super(json, opts);
            this.alternates = json.alternates || opts.alternates;
        }

        static loadSutta(opts={}) {
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var parser = new PoParser();
                    var id = opts.id || 'mn1';
                    var suttaPath = PoParser.suttaPath(id, opts.root);
                    var segDoc = await parser.parse(suttaPath, opts);
                    resolve(new Sutta(segDoc, opts));
                } catch(e) {reject(e);} })();
            });
        }

        scidGroup(scid) {
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
            var segments = this.findSegments(parent.scid + wildcard,  {
                prop: 'scid',
            });
            return {
                scid: parent.scid,
                segments,
            }
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

        findAlternates(segDoc, iEllipses, opts) {
            opts = Object.assign(OPTS_EN, opts);
            var prop = opts.prop;

            var prefix = this.commonPrefix(
                segDoc.segments[iEllipses[0]][prop],
                segDoc.segments[iEllipses[1]][prop]);
            if (!prefix) {
                throw new Error("could not generate alternates");
            }
            var indexes = segDoc.findIndexes(`^${prefix}`, opts);
            var values = indexes.reduce((acc,iseg,i) => {
                var seg = segDoc.segments[iseg];
                var s = seg[prop].substring(prefix.length);
                if (0==i || s.match(Words.U_ELLIPSIS)) {
                    acc.push(s.replace(/\s*[,.;\u2026].*$/u,''));
                }
                return acc;
            }, []);
            return {
                values,
                indexes,
            }
        };

        createPrimaryTemplate(segDoc, iEllipses, opts) {
            opts = Object.assign(OPTS_EN, opts);
            var prop = opts.prop;

            var alternates = this.findAlternates(segDoc, iEllipses, opts);
            var iAlts = alternates.indexes;
            var alts = alternates.values;

            var candidates = iAlts.reduce((acc, iAlt, i) => {
                0<i // the template alternate is not a candidate
                && iEllipses[i-1] === iAlt // the ellipsis is part of current group
                && RE_ELLIPSIS.test(segDoc.segments[iAlt][prop]) // there is an ellipsis
                && acc.push(segDoc.segments[iAlt]);
                return acc;
            }, []);

            var iTemplate = iAlts[0];
            var iEnd = iAlts[1]; 
            while (segDoc.segments[iEnd-1][prop].indexOf(alts[1])>=0) {
                iEnd--; // Ignore segments that are part of first variation 
            }
            var template = new Template({
                segments: segDoc.segments.slice(iTemplate, iEnd), 
                alternates: alts, 
                prop,
                candidates,
            });
            return template;
        }

        createSecondaryTemplate(segDoc, iEllipses, opts) {
            opts = Object.assign(OPTS_EN, opts);
            var prop = opts.prop;
            var iAlt = 0;
            var alts = this.alternates;
            var iEll0 = iEllipses[0];
            var candidates = [segDoc.segments[iEll0]];
            var candidateText = candidates[0][prop];
            if (!candidateText.match(alts[iAlt+1])) {
                iAlt++;
                if (!candidateText.match(alts[iAlt+1])) {
                    throw new Error(`could not find "${alts[iAlt+1]}" in: "${candidateText}"`);
                }
            }
            var iEnd = iEll0 + this.alternates.length - iAlt - 1;
            var endText = segDoc.segments[iEnd-1][prop];
            var altLast = alts[alts.length-1];
            if (!endText.match(altLast)) {
                throw new Error(`expected "${altLast}" in: "${segDoc.segments[iEnd-1].scid} ${endText}"`);
            }
            if (!endText.match(RE_ELLIPSIS)) {
                throw new Error(`expected "..." in: "${segDoc.segments[iEnd-1].scid} ${endText}"`);
            }
            var candidates = segDoc.segments.slice(iEll0, iEnd);
            
            var found = 0;
            var iTemplate = iEll0 - 1; // template starting segment index
            for (; 0 < iTemplate; iTemplate--, found++) { //
                if (segDoc.segments[iTemplate][prop].match(alts[iAlt])) {
                    break;
                }
            }
            for (; 0 < iTemplate; iTemplate--, found++) {
                if (!segDoc.segments[iTemplate-1][prop].match(alts[iAlt])) {
                    break;
                }
            }
            if (!found) {
                throw new Error(`could not find ${alts[iAlt]} template for: ${candidateText}`);
            }
            var segments = segDoc.segments.slice(iTemplate, iEll0);
            var prefix = 
                candidateText.substring(0, candidateText.indexOf(alts[iAlt+1])) ||
                segments[0][prop].substring(0, segments[0][prop].indexOf(alts[iAlt]));

            return new Template({
                segments,
                alternates: alts, 
                prop,
                prefix,
                candidates,
            });
        }

        expansionTemplate(opts={}) {
            opts = Object.assign(OPTS_EN, opts);
            var segDoc = this;

            var iEllipses = segDoc.findIndexes(RE_ELLIPSIS, opts);
            if (iEllipses.length === 0) {
                return null;
            }
            if (iEllipses.length <= 1) {
                throw new Error("not implemented");
            }


            if (this.alternates == null) {
                return this.createPrimaryTemplate(segDoc, iEllipses, opts);
            } else {
                return this.createSecondaryTemplate(segDoc, iEllipses, opts);
            }
        }

    }

    module.exports = exports.Sutta = Sutta;
})(typeof exports === "object" ? exports : (exports = {}));

