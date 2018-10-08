
(function(exports) {

    class SuttaCentralId { 
        constructor(scid=null) {
            this.scid = scid;
        }

        static scidRegExp(pat) {
            if (!pat) {
                return /.*/;
            }

            var pat = pat.replace(/\./g, "\\.");
            var pat = pat.replace(/\*/g, ".*");
            var pat = pat.replace(/\?/g, ".");
            var pat = pat.replace(/[$^]/g, "\\$&");
            return new RegExp(pat);
        }

        static compare(id1,id2) {
            var c1 = id1.replace(/[0-9.-]/ug,'');
            var c2 = id2.replace(/[0-9.-]/ug,'');
            var cmp = c1.localeCompare(c2);
            if (cmp !== 0) {
                return cmp;
            }
            var t1 = id1.replace(/[^0-9.-]*/ug,'').split('.');
            var t2 = id2.replace(/[^0-9.-]*/ug,'').split('.');
            for (var i=0; i<t1.length; i++) {
                var k1 = t1[i];
                var k2 = t2[i];
                if (k1 === k2) {
                    if (k1 == null) {
                        return 0;
                    }
                } else {
                    if (k1 == null) {
                        return 1;
                    }
                    if (k2 == null) {
                        return -1;
                    }
                    var n1 = Number(k1);
                    var n2 = Number(k2);
                    if (isNaN(n2)) {
                        if (isNaN(n1)) {
                            n1 = Number(k1.split('-')[0]);
                        } 
                        var range = k2.split('-');
                        var low = Number(range[0]);
                        var high = Number(range[1]);
                        if (n1 < low) {
                            return -1;
                        } else if (high < n1) {
                            return 1;
                        }
                        return 0;
                    } 
                    if (isNaN(n1)) {
                        return -SuttaCentralId.compare(id2,id1);
                    }
                    return Number(k1) - Number(k2);
                }
            }
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
            !groups.pop() && groups.pop();
            if (groups.length === 0) {
                return new SuttaCentralId(`${this.sutta}:`);
            }
            return new SuttaCentralId(`${this.sutta}:${groups.join('.')}.`);
        }

        toString() {
            return this.scid;
        }

    }

    module.exports = exports.SuttaCentralId = SuttaCentralId;
})(typeof exports === "object" ? exports : (exports = {}));
