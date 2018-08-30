
(function(exports) {

    class SuttaCentralId { 
        constructor(scid=null) {
            this.scid = scid;
        }

        static scidRegExp(pat) {
            var pat = pat.replace(/\./g, "\\.");
            var pat = pat.replace(/\*/g, ".*");
            var pat = pat.replace(/\?/g, ".");
            var pat = pat.replace(/[$^]/g, "\\$&");
            return new RegExp(pat);
        }

        get groups() {
            var tokens = this.scid && this.scid.split(':');
            return tokens && tokens[1] ? tokens[1].split('.') : null;
        }

        get sutta() {
            return this.scid && this.scid.split(':')[0] ;
        }

        get parent() {
            var groups = this.groups;
            if (groups == null) {
                return new SuttaCentralId();
            }
            groups.pop();
            if (groups.length === 0) {
                return new SuttaCentralId(this.sutta);
            }
            return new SuttaCentralId(`${this.sutta}:${groups.join('.')}`);
        }

        toString() {
            return this.scid;
        }

    }

    module.exports = exports.SuttaCentralId = SuttaCentralId;
})(typeof exports === "object" ? exports : (exports = {}));
