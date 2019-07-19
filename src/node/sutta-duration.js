(function(exports) {
    const fs = require('fs');
    const path = require('path');
    const {
        logger,
    } = require('rest-bundle');
    const {
        Network,
    } = require('oya-ann');

    class SuttaDuration {
        constructor(opts={}) {
            this.name = opts.name || 'amy';
            var fname = `sutta-duration.${this.name}.json`;
            var netPath  = path.join(__dirname, fname);
            var json = JSON.parse(fs.readFileSync(netPath));
            this.network = Network.fromJSON(json);
        }

        measure(sutta, lang='en') {
            var nSections = sutta.sections.length;
            var segments = sutta.segments;
            var nSegments = segments.length;
            var text = 0;
            for (var i = 0; i < nSegments; i++) {
                var segment = segments[i];
                var segText = segment[lang];
                segText && (text += segText.length);
            }
            var resAct = this.network.activate([
                text,
                //Math.log(text || 1),
                //nSegments,
                Math.log(nSegments),
                nSections,
            ]);
            return {
                text,
                lang,
                nSegments,
                nSections,
                seconds: resAct[0],
            };
        }
    }

    module.exports = exports.SuttaDuration = SuttaDuration;
})(typeof exports === "object" ? exports : (exports = {}));

