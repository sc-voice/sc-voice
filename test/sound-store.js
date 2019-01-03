(typeof describe === 'function') && describe("sound-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        GuidStore,
        SoundStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');

    it("TESTTESTSoundStore() creates default GuidStore for sounds", function() {
        var store = new SoundStore();
        should(store).instanceof(SoundStore);
        should(store).instanceof(GuidStore);
        should(store.storePath).equal(path.join(LOCAL, 'sounds'));
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.audioSuffix).equal('.mp3');
        should(store.audioFormat).equal('mp3');
        should(store.audioMIME).equal('audio/mp3');
    });
    it("TESTTESTSoundStore(opts) creates custom SoundStore", function() {
        var store = new SoundStore({
            audioFormat: 'ogg',
        });
        should(store).instanceof(SoundStore);
        should(store).instanceof(GuidStore);
        should(store.storePath).equal(path.join(LOCAL, 'sounds'));
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.audioSuffix).equal('.ogg');
        should(store.audioFormat).equal('ogg_vorbis');
        should(store.audioMIME).equal('audio/ogg');
    });
})
