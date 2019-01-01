(function(exports) {
    const Sutta = require('./sutta');
    const DN33_EN_SECONDS_PER_SEGMENT = (2*3600 + 0*60 + 27)/(1158);

    class Playlist { 
        constructor(opts={}) {
            this.tracks = [];
            this.languages = opts.languages || ['en','pli'];
            this.maxSeconds = opts.maxSeconds || 0;
        }

        stats() {
            var result = {
                segments: {},
                tracks: this.tracks.length,
                seconds: 0,
            };
            var languages = this.languages;
            languages.forEach(lang => {
                result.segments[lang] = 0;
            });

            this.tracks.forEach(track => {
                track.segments.forEach(segment => {
                    languages.forEach(lang => {
                        if (segment[lang] != null) {
                            result.segments[lang]++;
                        }
                    });
                });
            });
            languages.forEach(lang => {
                if (lang === 'pli') {
                    result.seconds += result.segments[lang] *
                        1.8 * DN33_EN_SECONDS_PER_SEGMENT;
                } else { 
                    result.seconds += result.segments[lang] *
                        DN33_EN_SECONDS_PER_SEGMENT;
                }
            });
            result.seconds = Math.ceil(result.seconds);
            return result;
        }

        addSutta(sutta) {
            sutta.sections.forEach(section => {
                var segments = [];
                section.segments.forEach(segment => {
                    var seg = {
                        scid: segment.scid,
                    };
                    this.languages.forEach(lang => {
                        segment[lang] && (seg[lang] = segment[lang]);
                    });
                    segments.push(seg);
                });

                this.tracks.push({
                    sutta_uid: sutta.sutta_uid,
                    segments,
                });
            });
        }

    }

    module.exports = exports.Playlist = Playlist;
})(typeof exports === "object" ? exports : (exports = {}));

