(typeof describe === 'function') && describe("SoundStore", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { MerkleJson } = require("merkle-json");
    const {
        SoundStore,
    } = require("../index");
    const local = path.join(__dirname, '..', 'local');
    var mj = new MerkleJson();

    it("TESTTESTSoundStore(opts) creates an asset SoundStore", function() {
        var store = new SoundStore();
        should(store.storePath).equal(path.join(local, 'sounds'));
        should(fs.existsSync(store.storePath)).equal(true);
    });
    it("TESTTESTsignaturePath(signature) returns file path of sound signature", function() {
        var store = new SoundStore();
        var guid = mj.hash("hello world");
        var dirPath = path.join(local, 'sounds', guid.substring(0,2), guid);
        var expectedPath = `${dirPath}.ogg`;
        var signature = {
            guid,
        };
        should(store.signaturePath(signature)).equal(expectedPath);
    });


})
