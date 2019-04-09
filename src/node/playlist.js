(function(exports) {
    const Sutta = require('./sutta');
    const Voice = require('./voice');
    const DN33_EN_SECONDS = 2*3600 + 0*60 + 27;
    const DN33_EN_SECONDS_PER_SEGMENT = DN33_EN_SECONDS/(1158);
    const DN33_EN_SECONDS_PER_CHAR = DN33_EN_SECONDS/(83588);
    const DN33_PLI_SECONDS_PER_CHAR = DN33_EN_SECONDS/(79412);

    class Playlist { 
        constructor(opts={}) {
            this.tracks = opts.tracks || [];
            this.languages = opts.languages || ['pli', 'en'];
            this.maxSeconds = opts.maxSeconds || 0;
            this.voices = opts.voices || {};
        }

        stats() {
            var result = {
                segments: {},
                chars: {},
                tracks: this.tracks.length,
                duration: 0,
            };
            var languages = this.languages;
            languages.forEach(lang => {
                result.segments[lang] = 0;
                result.chars[lang] = 0;
            });

            this.tracks.forEach(track => {
                track.segments.forEach(segment => {
                    languages.forEach(lang => {
                        if (segment[lang] != null) {
                            result.segments[lang]++;
                            result.chars[lang] += segment[lang].length;
                        }
                    });
                });
            });
            languages.forEach(lang => {
                result.duration += lang === 'pli'
                    ? result.chars[lang] * DN33_PLI_SECONDS_PER_CHAR
                    : result.chars[lang] * DN33_EN_SECONDS_PER_CHAR;
            });
            result.duration = Math.ceil(result.duration);
            return result;
        }

        static volumeName(sutta_uid, lang, auid, vname) {
            var collection = sutta_uid.replace(/([a-z]+).*/, '$1');
            if (collection === "thig" || collection === "thag") {
                collection = "kn";
            }
            var source = lang === 'pli' ? 'mahasangiti' : auid;
            var vname =  vname.toLowerCase();
            return `${collection}_${lang}_${source}_${vname}`;
        }

        speak(opts) {
            var that = this;
            var oipts = Object.assign({
                usage: "recite",
            }, opts);
            var voices = opts.voices || that.voices;
            
            return new Promise((resolve, reject) => {
                (async function() { try {
                    var tts = that.languages.reduce((acc,lang) => {
                        return acc || voices[lang];
                    }, null).services.recite;
                    var trackAudioFiles = [];
                    var sectionBreak = await tts.synthesizeSSML(tts.sectionBreak());
                    for (var iTrack = 0; iTrack < that.tracks.length; iTrack++) {
                        var track = that.tracks[iTrack];
                        var sutta_uid = track.sutta_uid.toLowerCase();
                        var auid = track.author_uid || 'no-author';
                        var lang = track.lang || 'en';
                        var segmentAudioFiles = [];
                        for (var iSeg = 0; iSeg < track.segments.length; iSeg++) {
                            var segment = track.segments[iSeg];
                            for (var iLang = 0; iLang < that.languages.length; iLang++) {
                                var lang = that.languages[iLang];
                                var voice = voices[lang];
                                var vname = voice.name.toLowerCase();
                                var volume = opts.volume || 
                                    Playlist.volumeName(sutta_uid, lang, auid, voice.name);
                                var text = segment[lang];
                                if (voice && text) {
                                    var segOpts = {
                                        volume,
                                        chapter: opts.chapter,
                                    };
                                    if (0) { 
                                        // Surprisingly, using scid instead of guid 
                                        // consumes 3x space for MN1
                                        var filename = segment.scid.replace(/:/g,"_");
                                        segOpts.guid = filename; 
                                    }
                                    segOpts = Object.assign(segOpts, opts);

                                    var vdata = await voice.speak(text, segOpts);
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

        addTrack(metadata, segmentsOrMessage) {
            if (metadata === Object(metadata)) {
                var track = Object.assign({}, metadata);
            } else if (typeof metadata === 'string') {
                var track = {
                    sutta_uid: metadata,
                }
            } else {
                throw new Error(`expected metadata string or Object`);
            }
            var sutta_uid = track.sutta_uid;
            track.lang = this.languages[this.languages.length-1];
            track.segments = segmentsOrMessage instanceof Array
                ? segmentsOrMessage
                : [{
                    scid: `${sutta_uid}:0.1`,
                    [track.lang]: `${segmentsOrMessage}`,
                }];
            this.tracks.push(track);
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

                this.addTrack({
                    sutta_uid: sutta.sutta_uid,
                    author_uid: sutta.author_uid,
                }, segments);
            });
        }

    }

    module.exports = exports.Playlist = Playlist;
})(typeof exports === "object" ? exports : (exports = {}));

