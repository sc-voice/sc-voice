(typeof describe === 'function') && describe("sound-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { MerkleJson } = require("merkle-json");
    const {
        GuidStore,
        SoundStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    var mj = new MerkleJson();

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
    it("TESTTESTguidPath(guid) returns file path of guid", function() {
        var store = new SoundStore();
        var guid = mj.hash("hello world");
        var dirPath = path.join(LOCAL, 'sounds', guid.substring(0,2), guid);
        should(store.guidPath(guid)).equal(`${dirPath}.mp3`);
    });
})
