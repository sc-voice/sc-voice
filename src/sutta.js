(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const SegDoc = require('./seg-doc');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
    const Template = require('./template');
    const RE_ELLIPSIS = new RegExp(`${Words.U_ELLIPSIS}$`);

    class Sutta extends SegDoc { 
        constructor(json={}, opts={}) {
            super(json, opts);
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

        expansionTemplate(opts={}) {
            opts = Object.assign({
                prop: 'en',
            }, opts);
            var iEllipses = this.findIndexes(RE_ELLIPSIS, opts);
            if (iEllipses.length === 0) {
                return null;
            }
            if (iEllipses.length <= 1) {
                throw new Error("not implemented");
            }

            var prop = opts.prop;
            var prefix = this.commonPrefix(
                this.segments[iEllipses[0]][prop],
                this.segments[iEllipses[1]][prop]);
            if (!prefix) {
                throw new Error("could not generate alternates");
            }
            var iAlts = this.findIndexes(`^${prefix}`, opts);

            var alts = iAlts.reduce((acc,iseg) => {
                var seg = this.segments[iseg];
                var s = seg[prop].substring(prefix.length);
                acc.push(s.replace(/\s*[,.;\u2026].*$/u,''));
                return acc;
            }, []);
            var iTemplate = iAlts[0];
            var iEnd = iAlts[1]; 
            while (this.segments[iEnd-1][prop].indexOf(alts[1])>=0) {
                iEnd--; // Ignore segments that are part of first variation 
            }
            return new Template( this.segments.slice(iTemplate, iEnd), alts, opts);
        }

    }

    module.exports = exports.Sutta = Sutta;
})(typeof exports === "object" ? exports : (exports = {}));

