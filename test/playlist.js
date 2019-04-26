(typeof describe === 'function') && describe("playlist", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Playlist,
        Sutta,
        SuttaCentralApi,
        SuttaFactory,
        Voice,
    } = require('../index');

    var suttas = [
        new Sutta({
            sutta_uid: 'test1',
            author_uid: 'test',
            sections: [{
                segments: [{
                    scid: 'test1:1.1',
                    pli: 'test1:pli1.1',
                    en: 'test1:en1.1',
                    de: 'test1:de1.1',
                },{
                    scid: 'test1:1.2',
                    pli: 'test1:pli1.2',
                    de: 'test1:de1.2',
                }],
            }],
        }),
        new Sutta({
            sutta_uid: 'test2',
            author_uid: 'test',
            sections: [{
                segments: [{
                    scid: 'test2:1.1',
                    pli: 'test2:pli1.1',
                    en: 'test2:en1.1',
                    de: 'test2:de1.2',
                },{
                    scid: 'test2:1.2',
                    pli: 'test2:pli1.2',
                }],
            }],
        }),
        new Sutta({
            sutta_uid: 'test3',
            author_uid: 'test-author',
            sections: [{
                segments: [{
                    scid: 'test3:1.1',
                    pli: 'Taṃ kissa hetu?',
                    en: 'Why is that?',
                }],
            },{
                segments: [{
                    scid: 'test3:2.1',
                    pli: 'abhikkantaṃ, bhante',
                    en: 'Excellent, sir!',
                },{
                    scid: 'test3:2.2',
                    pli: 'Nandī dukkhassa mūlan’ti',
                    en: 'Delight is the root of suffering',
                }],
            }],
        }),
    ];
    it("playlist() constructs a playlist", function() {
        var pl = new Playlist();
        should(pl).instanceOf(Playlist);
        should.deepEqual(pl.languages, ['pli', 'en']);
        should.deepEqual(pl.tracks, []);
        should(pl.maxSeconds).equal(0); // unlimited
    });
    it("playlist(opts) constructs custom playlist", function() {
        var pl = new Playlist({
            languages: ['de','fr'],
        });
        should(pl).instanceOf(Playlist);
        should.deepEqual(pl.languages, ['de','fr']);
        should.deepEqual(pl.tracks, []);
        should(pl.maxSeconds).equal(0); // unlimited
    });
    it("addSutta(sutta) adds a sutta", function() {
        var pl = new Playlist();

        pl.addSutta(suttas[0]);
        should(pl.tracks.length).equal(1);
        should.deepEqual(pl.tracks.map(s=>(s.sutta_uid)), [
             'test1',
        ]);

        pl.addSutta(suttas[1]);
        should(pl.tracks.length).equal(2);
        should.deepEqual(pl.tracks.map(s=>(s.sutta_uid)), [
             'test1',
             'test2',
        ]);
    });
    it("stats() adds a sutta", function() {
        var pl = new Playlist({
            languages:['de','pli'],
        });

        should.deepEqual(pl.stats(),{
            tracks: 0,
            duration: 0,
            chars: {
                de: 0,
                pli: 0,
            },
            segments: {
                de: 0,
                pli: 0,
            },
        });

        pl.addSutta(suttas[0]);
        should.deepEqual(pl.stats(),{
            tracks: 1,
            chars: {
                de: 22,
                pli: 24,
            },
            duration: 5,
            segments: {
                de: 2,
                pli: 2,
            },
        });

        pl.addSutta(suttas[1]);
        should.deepEqual(pl.stats(),{
            tracks: 2,
            chars: {
                de: 33,
                pli: 48,
            },
            duration: 8,
            segments: {
                de: 3,
                pli: 4,
            },
        });
    });
    it("addSutta(sutta) adds dn33", function(done) {
        this.timeout(10*1000);
        (async function() { try {
            var suttaCentralApi = await new SuttaCentralApi().initialize();
            var factory = new SuttaFactory({
                suttaCentralApi,
            });
            var sutta = await factory.loadSutta('dn33');
            var pl = new Playlist();
            pl.addSutta(sutta);
            should.deepEqual(pl.stats(), {
                tracks: 2,
                chars: {
                    en: 83585,
                    pli: 79412,
                }, 
                segments: {
                    en: 1120,
                    pli: 1158,
                },
                duration: 14454,
            });
            done();
        } catch(e) { done(e); } })();
    });
    it("addTrack(sutta_uid, segmentsOrMessage) adds a track", function(done) {
        this.timeout(10*1000);
        (async function() { try {
            var pl = new Playlist();
            pl.addTrack("error123", "this is a test");
            should.deepEqual(pl.stats(), {
                tracks: 1,
                chars: {
                    en: 14,
                    pli: 0,
                },
                segments: {
                    en: 1,
                    pli: 0,
                },
                duration: 2,
            });
            done();
        } catch(e) { done(e); } })();
    });
    it("speak(opts) adds voice audio", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var voices = {
                pli: Voice.createVoice({
                    name:'aditi',
                    usage: 'recite',
                    language: 'hi-IN',
                    languageUnknown: 'pli',
                    stripNumbers: true,
                    stripQuotes: true,
                }),
                en: Voice.createVoice({name:'amy'}),
            };
            var pl = new Playlist({
                languages: ['pli', 'en'], // speaking order 
            });
            pl.addSutta(suttas[2]);
            var result = await pl.speak({
                voices,
                volume: 'test-playlist',
            });
            should(result.signature.guid).match(/86043/);
            done();
        } catch(e) { done(e); } })();
    });
    it("volumeName(...) returns SoundStore volume", function() {
        should(Playlist.volumeName('a','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('a1','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('a1.1','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('a1.2-5','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('a1.2-5:3','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('a1.2-5:3.1','b','c','d')).equal('a_b_c_d');
        should(Playlist.volumeName('thig1.2','b','c','d')).equal('kn_b_c_d');
        should(Playlist.volumeName('thag1.2','b','c','d')).equal('kn_b_c_d');
        should(Playlist.volumeName('thag1.2','pli','c','d')).equal('kn_pli_mahasangiti_d');
        should(Playlist.volumeName('mn1','pli','c','d')).equal('mn_pli_mahasangiti_d');
    });

})
