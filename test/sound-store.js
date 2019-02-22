(typeof describe === 'function') && describe("sound-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const tmp = require('tmp');
    const { MerkleJson } = require("merkle-json");
    const { logger } = require('rest-bundle');
    const {
        GuidStore,
        SoundStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    var mj = new MerkleJson();
    logger.level = 'warn';
    var storePath = tmp.tmpNameSync();

    it("SoundStore() creates default GuidStore for sounds", function() {
        var store = new SoundStore();
        should(store).instanceof(SoundStore);
        should(store).instanceof(GuidStore);
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.storePath).equal(path.join(LOCAL, 'sounds'));
        should(store.type).equal('SoundStore');
        should(store.storeName).equal('sounds');
        should(store.volume).equal('common');
        should(store.audioSuffix).equal('.mp3');
        should(store.audioFormat).equal('mp3');
        should(store.audioMIME).equal('audio/mp3');
    });
    it("SoundStore(opts) creates custom SoundStore", function() {
        var store = new SoundStore({
            audioFormat: 'ogg',
            storePath,
        });
        should(store).instanceof(SoundStore);
        should(store).instanceof(GuidStore);
        should(store.storePath).equal(storePath);
        should(store.type).equal('SoundStore');
        should(store.storeName).equal('sounds');
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.audioSuffix).equal('.ogg');
        should(store.audioFormat).equal('ogg_vorbis');
        should(store.audioMIME).equal('audio/ogg');
    });
    it("guidPath(guid, suffix) returns file path of guid", function() {
        var store = new SoundStore({
            storePath,
        });
        var guid = mj.hash("hello world");

        // guids are normally allocated in the "common" volume
        var commonPath = path.join(storePath, 'common');
        var guidDir = guid.substring(0,2);
        var guidPath = path.join(commonPath, guidDir, guid);
        should(store.guidPath(guid)).equal(`${guidPath}.mp3`);
        should(store.guidPath(guid, '.abc')).equal(`${guidPath}.abc`);
        should(fs.existsSync(commonPath)).equal(true);

        // return path to a guid in a custom volume 
        var testVolPath = path.join(storePath, 'test-volume', guidDir);
        var guid1Path = path.join(testVolPath, guid);
        should(store.guidPath(guid, {
            suffix: '.abc',
            volume: 'test-volume',
        })).equal(`${guid1Path}.abc`);
        should(fs.existsSync(testVolPath)).equal(true);
    });
    it("addEphemeral(guid) saves an ephemeral guid", function() {
        var store = new SoundStore({
            storePath,
        });
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
    it("clearEphemeral(opts) clears old ephemeral files", function() {
        var store = new SoundStore({
            suffixes: ['.txt'],
            storePath,
        });
        should.deepEqual(store.ephemerals, []);
        should(store.ephemeralInterval).equal(1*60*1000);
        should(store.ephemeralAge).equal(5*60*1000);
        var data = [1,2,3].map(i => {
            var name = `ephemeral-${i}`;
            var guid = mj.hash(name);
            store.addEphemeral(guid);
            var fpath = store.guidPath(guid, '.txt');
            var msNow = Date.now().toString();
            while (msNow === Date.now().toString()); // busy wait
            fs.writeFileSync(fpath, name);
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
    it("automatically clears old ephemerals", function(done) {
        (async function() { try {
            var ephemeralInterval = 100;
            var store = new SoundStore({
                suffixes: ['.txt'],
                storePath,
                ephemeralInterval,
                ephemeralAge: ephemeralInterval/2,
            });
            should.deepEqual(store.ephemerals, []);
            should(store.ephemeralInterval).equal(ephemeralInterval);
            should(store.ephemeralAge).equal(ephemeralInterval/2);
            var data = [1,2,3].map(i => {
                var name = `ephemeral-${i}`;
                var guid = mj.hash(name);
                store.addEphemeral(guid);
                var fpath = store.guidPath(guid, '.txt');
                var msNow = Date.now().toString();
                while (msNow === Date.now().toString()); // busy wait
                fs.writeFileSync(fpath, name);
                return {
                    name,
                    guid,
                    fpath,
                    fstat: fs.statSync(fpath),
                }
            });
            should.deepEqual(store.ephemerals, [
                data[0].guid,
                data[1].guid,
                data[2].guid,
            ]);
            should(fs.existsSync(data[0].fpath)).equal(true);
            should(fs.existsSync(data[1].fpath)).equal(true);
            should(fs.existsSync(data[2].fpath)).equal(true);

            // one of the ephemeral files gets refreshed
            await new Promise(r=>setTimeout(()=>r(1), ephemeralInterval/2));
            fs.writeFileSync(data[0].fpath, data[0].name); // refresh
            await new Promise(r=>setTimeout(()=>r(1), ephemeralInterval/2));
            should(fs.existsSync(data[0].fpath)).equal(true); // refreshed
            should(fs.existsSync(data[1].fpath)).equal(false);
            should(fs.existsSync(data[2].fpath)).equal(false);
            should.deepEqual(store.ephemerals, [
                data[0].guid,
            ]);

            // all of the ephemerals become stale
            await new Promise(r=>setTimeout(()=>r(1), ephemeralInterval));
            should(fs.existsSync(data[0].fpath)).equal(false);
            should(fs.existsSync(data[1].fpath)).equal(false);
            should(fs.existsSync(data[2].fpath)).equal(false);
            should.deepEqual(store.ephemerals, []);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTvolumeInfo() returns volume information", function(done) {
        (async function() { try {
            var store = new SoundStore({});
            var cmd = `du -sb *`;
            var du = execSync(cmd, {
                cwd: store.storePath,
            }).toString().trim().split('\n');
            du = du.reduce((acc, line) => {
                var lineParts = line.split('\t');
                acc[lineParts[1]] = Number(lineParts[0]);
                return acc;
            }, {});
            should.deepEqual(store.volumeInfo(), du);
            done();
        } catch(e) {done(e);} })();
    });
})
