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

        expansionTemplate(opts={}) {
            opts = Object.assign({
                prop: 'en',
            }, opts);
            var prop = opts.prop;
            var indexEllipses = this.findIndexes(RE_ELLIPSIS, opts);
            if (indexEllipses.length <= 1) {
                throw new Error("not implemented");
            }

            var s0 = this.segments[indexEllipses[0]][prop];
            var s1 = this.segments[indexEllipses[1]][prop];
            var len = Math.min(s0.length, s1.length);
            for (var i=0; i<len; i++) {
                if (s0.charAt(i) !== s1.charAt(i)) {
                    break;
                }
            }
            if (i === 0) {
                throw new Error("could not generate alternates");
            }
            var prefix = s0.substring(0, i);
            var indexAlts = this.findIndexes(`^${prefix}`, opts);

            var alternates = indexAlts.reduce((acc,iseg) => {
                var seg = this.segments[iseg];
                var s = seg[prop].substring(prefix.length);
                acc.push(s.replace(/\s*[,.;\u2026].*$/u,''));
                return acc;
            }, []);
            var i0 = indexAlts[0];
            var i1 = indexAlts[1];
            while (this.segments[i1-1][prop].indexOf(alternates[1])>=0) {
                i1--;
            }
            return new Template(this.segments.slice(i0, i1), alternates, opts);
        }

    }

    module.exports = exports.Sutta = Sutta;
})(typeof exports === "object" ? exports : (exports = {}));

