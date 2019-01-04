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
        should(store.type).equal('SoundStore');
        should(store.storeName).equal('sounds');
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
        should(store.type).equal('SoundStore');
        should(store.storeName).equal('sounds');
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.audioSuffix).equal('.ogg');
        should(store.audioFormat).equal('ogg_vorbis');
        should(store.audioMIME).equal('audio/ogg');
    });
    it("TESTTESTguidPath(guid, suffix) returns file path of guid", function() {
        var store = new SoundStore();
        var guid = mj.hash("hello world");
        var dirPath = path.join(LOCAL, 'sounds', guid.substring(0,2), guid);
        should(store.guidPath(guid)).equal(`${dirPath}.mp3`);
        should(store.guidPath(guid, '.abc')).equal(`${dirPath}.abc`);
    });
    it("TESTTESTaddEphemeral(guid) saves an ephemeral guid", function() {
        var store = new SoundStore();
        should.deepEqual(store.ephemerals, []);
        var data = [1,2,3].map(i => {
            var name = `ephemeral-${i}`;
            var guid = mj.hash(name);
            return {
                name,
                guid,
            }
        });

        store.addEphemeral(data[0].guid);
        should.deepEqual(store.ephemerals, [
            data[0].guid,
        ]);
        store.addEphemeral(data[1].guid);
        store.addEphemeral(data[2].guid);
        should.deepEqual(store.ephemerals, [
            data[0].guid,
            data[1].guid,
            data[2].guid,
        ]);
    });
    it("TESTTESTclearEphemeral(opts) clears old ephemeral files", function() {
        var store = new SoundStore({
            suffixes: ['.txt'],
        });
        should.deepEqual(store.ephemerals, []);
        var data = [1,2,3].map(i => {
            var name = `ephemeral-${i}`;
            var guid = mj.hash(name);
            store.addEphemeral(guid);
            var fpath = store.guidPath(guid, '.txt');
            try {
                var msNow = Date.now().toString();
                while (msNow === Date.now().toString()); // busy wait
                fs.writeFileSync(fpath, name);
            } catch(e) {
                console.log(e.stack);
            }
            return {
                name,
                guid,
                fpath,
                fstat: fs.statSync(fpath),
            }
        });
        should(fs.existsSync(data[0].fpath)).equal(true);
        should(fs.existsSync(data[1].fpath)).equal(true);
        should(fs.existsSync(data[2].fpath)).equal(true);

        should.deepEqual(store.ephemerals, [
            data[0].guid,
            data[1].guid,
            data[2].guid,
        ]);

        // clear older than given ctime
        store.clearEphemerals({ctime: data[0].fstat.ctime});
        should(fs.existsSync(data[0].fpath)).equal(false);
        should(fs.existsSync(data[1].fpath)).equal(true);
        should(fs.existsSync(data[2].fpath)).equal(true);
        should.deepEqual(store.ephemerals, [
            data[1].guid,
            data[2].guid,
        ]);

        // clear all
        store.clearEphemerals();
        should(fs.existsSync(data[0].fpath)).equal(false);
        should(fs.existsSync(data[1].fpath)).equal(false);
        should(fs.existsSync(data[2].fpath)).equal(false);
        should.deepEqual(store.ephemerals, []);
    });
})
