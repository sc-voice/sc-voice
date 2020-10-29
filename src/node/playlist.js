(function(exports) {
    const Sutta = require('./sutta');
    const SoundStore = require('./sound-store');
    const { logger } = require('log-instance');
    const Voice = require('./voice');
    const DN33_EN_SECONDS = 2*3600 + 0*60 + 27;
    const DN33_EN_SECONDS_PER_SEGMENT = DN33_EN_SECONDS/(1158);
    const DN33_EN_SECONDS_PER_CHAR = DN33_EN_SECONDS/(83588);
    const DN33_PLI_SECONDS_PER_CHAR = DN33_EN_SECONDS/(79412);

    class Playlist { 
        constructor(opts={}) {
            (opts.logger || logger).logInstance(this);
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

        async speak(opts) { try {
            var voices = opts.voices || this.voices;
            let audioSuffix = opts.audioSuffix || '.mp3';
            var nLang = this.languages.length;
            this.languages.forEach(lang => {
                if (voices[lang] == null) {
                    throw new Error( `no voice for lang:${lang}`);
                }
            });
            var tts = this.languages.reduce((acc,lang) => {
                return acc || voices[lang];
            }, null).services.recite;
            var trackAudioFiles = [];
            var sectionBreak = await tts
                .synthesizeBreak(tts.SECTION_BREAK);
            var prevSuid;
            for (var iTrk = 0; iTrk < this.tracks.length; iTrk++) {
                var track = this.tracks[iTrk];
                var sutta_uid = track.sutta_uid.toLowerCase();
                var auid = track.author_uid || 'no-author';
                var lang = track.lang || 'en';
                var segmentAudioFiles = [];
                var trkSegs = track.segments;
                for (var iSeg = 0; iSeg < trkSegs.length; iSeg++) {
                    var segment = trkSegs[iSeg];
                    for (var iLang = 0; iLang < nLang; iLang++) {
                        var lang = this.languages[iLang];
                        var voice = voices[lang];
                        var vname = voice.name.toLowerCase();
                        var volume = opts.volume || 
                            SoundStore.suttaVolumeName(sutta_uid, 
                                lang, auid, voice.name);
                        var text = segment[lang];
                        if (voice && text) {
                            var segOpts = {
                                volume,
                                chapter: opts.chapter,
                            };
                            segOpts = Object.assign(segOpts, opts);
                            delete segOpts.voices; // not used 

                            var sutta_uid = segment.scid.split(':')[0];
                            if (prevSuid !== sutta_uid) {
                                if (prevSuid) {
                                    segmentAudioFiles.push(
                                        sectionBreak.file);
                                }
                                prevSuid = sutta_uid;
                            }
                            var speakOpts = {
                                sutta_uid,
                                segment,
                                language: lang,
                                usage: voice.usage, 
                                translator: auid,
                            };

                            var vdata = await voice
                                .speakSegment(speakOpts);
                            segmentAudioFiles.push(vdata.file);
                            segment.audio = segment.audio || {};
                            segment.audio[lang] = vdata.signature.guid;
                        }
                    }
                }
                segmentAudioFiles.push(sectionBreak.file);
                var audio = await tts.concatAudio(segmentAudioFiles);
                track.audio = audio;
                trackAudioFiles.push(audio.file);
            }
            this.audio = await tts.concatAudio(trackAudioFiles, {
                album: opts.album,
                artist: opts.artist,
                album_artist: opts.album_artist || opts.artist,
                audioSuffix,
                copyright: opts.copyright,
                publisher: opts.publisher,
                languages: this.languages.join(', '),
                title: opts.title,
                comment: opts.comment,
            });
            return this.audio;
        } catch(e) {
            this.warn(`speak()`, e.message);
            throw e;
        }}

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

        author_uids() {
            return Object.keys(this.tracks.reduce((a,t) => {
                a[t.author_uid] = true;
                return a;
            },{}));
        }

    }

    module.exports = exports.Playlist = Playlist;
})(typeof exports === "object" ? exports : (exports = {}));

