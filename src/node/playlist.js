(function(exports) {
    const Sutta = require('./sutta');
    const Voice = require('./voice');
    const DN33_EN_SECONDS_PER_SEGMENT = (2*3600 + 0*60 + 27)/(1158);

    class Playlist { 
        constructor(opts={}) {
            this.tracks = opts.tracks || [];
            this.languages = opts.languages || ['en','pli'];
            this.maxSeconds = opts.maxSeconds || 0;
            this.voices = opts.voices || [];
        }

        stats() {
            var result = {
                segments: {},
                tracks: this.tracks.length,
                duration: 0,
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
                    result.duration += result.segments[lang] *
                        1.8 * DN33_EN_SECONDS_PER_SEGMENT;
                } else { 
                    result.duration += result.segments[lang] *
                        DN33_EN_SECONDS_PER_SEGMENT;
                }
            });
            result.duration = Math.ceil(result.duration);
            return result;
        }

        speak(opts) {
            var that = this;
            var voices = opts.voices || that.voices;
            
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var opts = opts || {
                        usage: "recite",
                    };
                    var tts = that.languages.reduce((acc,lang) => {
                        return acc || voices[lang];
                    }, null).services.recite;
                    var trackAudioFiles = [];
                    var sectionBreak = await tts.synthesizeSSML(tts.sectionBreak());
                    for (var iTrack = 0; iTrack < that.tracks.length; iTrack++) {
                        var track = that.tracks[iTrack];
                        var segmentAudioFiles = [];
                        for (var iSeg = 0; iSeg < track.segments.length; iSeg++) {
                            var segment = track.segments[iSeg];
                            for (var iLang = 0; iLang < that.languages.length; iLang++) {
                                var lang = that.languages[iLang];
                                var voice = voices[lang];
                                var text = segment[lang];
                                if (voice && text) {
                                    var vdata = await voice.speak(text, opts);
                                    segmentAudioFiles.push(vdata.file);
                                    segment.audio = segment.audio || {};
                                    segment.audio[lang] = vdata.signature.guid;
                                }
                            }
                        }
                        segmentAudioFiles.push(sectionBreak.file);
                        var audio = await tts.ffmpegConcat(segmentAudioFiles);
                        track.audio = audio;
                        trackAudioFiles.push(audio.file);
                    }
                    that.audio = await tts.ffmpegConcat(trackAudioFiles);
                    resolve(that.audio);
                } catch(e) {reject(e);} })();
            });
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

