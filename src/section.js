(function(exports) {
    const DEFAULT_PROP = 'en';

    class Section {
        constructor(parms={}) {
            var segments = parms.segments;
            if (!(segments instanceof Array)) {
                throw new Error('expected Array of segments');
            }
            this.segments = segments;

            this.prefix = parms.prefix;
            this.values = parms.values;
            this.template = parms.template;
            this.prop = parms.prop || DEFAULT_PROP;
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

    module.exports = exports.Section = Section;
})(typeof exports === "object" ? exports : (exports = {}));

