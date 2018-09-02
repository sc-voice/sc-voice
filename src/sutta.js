(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const SegDoc = require('./seg-doc');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');
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

        alternates(opts={}) {
            var prop = opts.prop || 'en';
            var findOpts = {
                prop,
            };
            var segEllipses = this.findSegments(RE_ELLIPSIS, findOpts);
            if (segEllipses.length <= 1) {
                throw new Error("not implemented");
            }

            var s0 = segEllipses[0][prop];
            var s1 = segEllipses[1][prop];
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
            var segAlts = this.findSegments(`^${prefix}`, findOpts);

            var alternates = segAlts.reduce((acc,seg) => {
                var s = seg[prop].substring(prefix.length);
                acc.push(s.replace(/\s*[,.;\u2026].*$/u,''));
                return acc;
            }, []);

            return {
                prefix,
                [prop]:alternates,
            };
        }

    }

    module.exports = exports.Sutta = Sutta;
})(typeof exports === "object" ? exports : (exports = {}));

