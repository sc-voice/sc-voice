
(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const Words = require('./words');
    const PoParser = require('./po-parser');
    const SuttaCentralId = require('./sutta-central-id');

    class Cursor {
        constructor(sutta, opts={}) {
            if (sutta == null) {
                throw new Error("expected a Sutta");
            }
            this.sutta = sutta;
            this.height = opts.height || 1;
            if (this.height !== 1) {
                throw new Error("height can only be 1 at this time");
            }
            if (sutta.segments[0]) {
                this.moveToScid(sutta.segments[0].scid);
            } else {
                this.scid = new SuttaCentralId();
                this.segments = [];
            }
        }

        moveToScid(scid) {
            var segs = this.sutta.findIndexes(scid);
            if (segs == null || segs.length === 0) {
                return false;
            }
            var group = this.sutta.scidGroup(scid);
            this.scid = new SuttaCentralId(group.scid);
            this.segments = group.segments;
            return true;
        }

        moveToIndex(index) {
            var segs = this.sutta.segments;
            if (index > 0) {
                this.moveToScid(segs[0].scid);
                while (--index) {
                    if (!this.next()) {
                        return false;
                    }
                }
            } else if (index < 0) {
                this.moveToScid(segs[segs.length-1].scid);
                while(++index) {
                    if (!this.back()) {
                        return false;
                    }
                }
            }
            return true;
        }

        back() {
            var prevSeg = this.sutta.nextSegment(this.scid, -1);
            if (prevSeg == null) {
                return false;
            }
            return this.moveToScid(prevSeg.scid);
        }

        next() {
            var nextSeg = this.sutta.nextSegment(this.scid);
            if (nextSeg == null) {
                return false;
            }

            return this.moveToScid(nextSeg.scid);
        }


    }

    module.exports = exports.Cursor = Cursor;
})(typeof exports === "object" ? exports : (exports = {}));

