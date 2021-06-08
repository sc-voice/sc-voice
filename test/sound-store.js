(typeof describe === 'function') && describe("sound-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const tmp = require('tmp');
    const { MerkleJson } = require("merkle-json");
    const { logger, LogInstance } = require('log-instance');
    const { AwsConfig, SayAgain, } = require('say-again');
    const { FilePruner, GuidStore, } = require('memo-again');
    const {
        SoundStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    var mj = new MerkleJson();
    logger.level = 'warn';
    var storePath = tmp.tmpNameSync();
    var TEST_SOUNDS = path.join(__dirname, 'data', 'sounds');
    this.timeout(10*1000);

    it("default ctor", function() {
        var store = new SoundStore();
        should(store).instanceof(SoundStore);
        should(store).instanceof(GuidStore);
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.storePath).equal(path.join(LOCAL, 'sounds'));
        should(store.type).equal('SoundStore');
        should(store.filePruner).instanceOf(FilePruner);
        should(store.storeName).equal('sounds');
        should(store.volume).equal('common');
        should(store.audioSuffix).equal('.mp3');
        should(store.audioFormat).equal('mp3');
        should(store.audioMIME).equal('audio/mp3');
        should(store.sayAgain).instanceOf(SayAgain);
        should(store.sayAgain.awsConfig.sayAgain.Bucket)
            .equal('say-again.sc-voice');
        should(store.logger).equal(logger);
    });
    it("custom ctor", async()=>{
        var filePruner = new FilePruner({root: TEST_SOUNDS});
        var logger = new LogInstance();
        var store = new SoundStore({
            audioFormat: 'ogg',
            storePath,
            filePruner,
            logger,
        });
        should(store).instanceof(SoundStore);
        should(store.filePruner).equal(filePruner);
        should(store).instanceof(GuidStore);
        should(store.storePath).equal(storePath);
        should(store.type).equal('SoundStore');
        should(store.storeName).equal('sounds');
        should(fs.existsSync(store.storePath)).equal(true);
        should(store.audioSuffix).equal('.ogg');
        should(store.audioFormat).equal('ogg_vorbis');
        should(store.audioMIME).equal('audio/ogg');

        // custom logger is propagated to children
        var sayAgain = await store.sayAgain.initialize();
        should(store.logger).equal(logger);
        should(store.sayAgain.logger).equal(store);
        store.info('store custom logger');
        should(logger.lastLog('info')).match(/store custom logger/);
        sayAgain.info('sayAgain custom logger');
        should(logger.lastLog('info')).match(/sayAgain custom logger/);
        sayAgain.tts.info('tts custom logger');
        should(logger.lastLog('info')).match(/tts custom logger/);
    });
    it("suttaVolumeName(...) returns SoundStore volume", function() {
        should(SoundStore.suttaVolumeName('a','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('a1','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('a1.1','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('a1.2-5','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('a1.2-5:3','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('a1.2-5:3.1','b','c','d'))
            .equal('a_b_c_d');
        should(SoundStore.suttaVolumeName('thig1.2','b','c','d'))
            .equal('kn_b_c_d');
        should(SoundStore.suttaVolumeName('thag1.2','b','c','d'))
            .equal('kn_b_c_d');
        should(SoundStore.suttaVolumeName('thag1.2','pli','c','d'))
            .equal('kn_pli_mahasangiti_d');
        should(SoundStore.suttaVolumeName('mn1','pli','c','d'))
            .equal('mn_pli_mahasangiti_d');
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
        should.deepEqual(store.ephemerals, {});
        var data = [1,2,3].map(i => {
            var name = `ephemeral-${i}`;
            var guid = mj.hash(name);
            return {
                name,
                guid,
            }
        });

        store.addEphemeral(data[0].guid);
        should.deepEqual(Object.keys(store.ephemerals), [
            data[0].guid,
        ]);
        store.addEphemeral(data[1].guid);
        store.addEphemeral(data[2].guid);
        should.deepEqual(Object.keys(store.ephemerals), [
            data[0].guid,
            data[1].guid,
            data[2].guid,
        ]);
    });
    it("clearEphemeral(opts) removes ephemeral files (MAY FAIL)", ()=>{
        var storePath = tmp.tmpNameSync();
        var store = new SoundStore({
            suffixes: ['.txt'],
            storePath,
        });
        should.deepEqual(Object.keys(store.ephemerals), []);
        should(store.ephemeralInterval).equal(5*60*1000);
        should(store.ephemeralAge).equal(15*60*1000);
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

        should.deepEqual(Object.keys(store.ephemerals), [
            data[0].guid,
            data[1].guid,
            data[2].guid,
        ]);

        // clear older than given ctime
        store.clearEphemerals({ctime: data[0].fstat.ctime});
        should(fs.existsSync(data[0].fpath)).equal(false);
        should(fs.existsSync(data[1].fpath)).equal(true);
        should(fs.existsSync(data[2].fpath)).equal(true);
        should.deepEqual(Object.keys(store.ephemerals), [
            data[1].guid,
            data[2].guid,
        ]);

        // clear all
        store.clearEphemerals();
        should(fs.existsSync(data[0].fpath)).equal(false);
        should(fs.existsSync(data[1].fpath)).equal(false);
        should(fs.existsSync(data[2].fpath)).equal(false);
        should.deepEqual(Object.keys(store.ephemerals), []);
    });
    it("automatically clears old ephemerals", async()=>{
        var storePath = tmp.tmpNameSync();
        var ephemeralInterval = 100;
        var store = new SoundStore({
            suffixes: ['.txt'],
            storePath,
            ephemeralInterval,
            ephemeralAge: ephemeralInterval/2,
        });
        should.deepEqual(Object.keys(store.ephemerals), []);
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
        should.deepEqual(Object.keys(store.ephemerals), [
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
        should(fs.existsSync(data[1].fpath)).equal(false);
        should(fs.existsSync(data[2].fpath)).equal(false);
        var ephKeys = Object.keys(store.ephemerals);
        ephKeys.length && should.deepEqual(ephKeys, [data[0].guid, ]);

        // all of the ephemerals become stale
        await new Promise(r=>setTimeout(()=>r(1), ephemeralInterval));
        should(fs.existsSync(data[0].fpath)).equal(false);
        should(fs.existsSync(data[1].fpath)).equal(false);
        should(fs.existsSync(data[2].fpath)).equal(false);
        should.deepEqual(Object.keys(store.ephemerals), []);
    });
    it("volumeInfo() returns volume information", function(done) {
        (async function() { try {
            var store = new SoundStore({});
            var cmd = `du -sb *`;
            var du = execSync(cmd, {
                cwd: store.storePath,
            }).toString().trim().split('\n');
            du = du.reduce((acc, line) => {
                var lineParts = line.split('\t');
                acc[lineParts[1]] = {
                    name: lineParts[1],
                    size: Number(lineParts[0]),
                };
                return acc;
            }, {});
            should.deepEqual(store.volumeInfo(), du);
            done();
        } catch(e) {done(e);} })();
    });
    it("clearVolume() clears volume", function(done) {
        (async function() { try {
            var store = new SoundStore({
                storePath,
            });
            var volume1 = 'test-v1';
            var guid1 = 'clear-v1';
            var filePath1 = store.guidPath({
                volume: volume1,
                chapter:'test-c1',
                guid: guid1,
            }, '.test');
            should(fs.existsSync(filePath1)).equal(false);
            fs.writeFileSync(filePath1, 'test-f1');
            should(fs.existsSync(filePath1)).equal(true);
            var filePath2 = store.guidPath({
                volume:'test-v2',
                chapter:'test-c2',
                guid:'clear-v2',
            }, '.test');
            should(fs.existsSync(filePath2)).equal(false);
            fs.writeFileSync(filePath2, 'test-f2');
            should(fs.existsSync(filePath2)).equal(true);

            // null volume
            var eCaught = null;
            try {
                var result = await store.clearVolume();
            } catch(e) { eCaught = e; }
            should(eCaught.message).match(/no volume/);
            should(fs.existsSync(filePath2)).equal(true);
            should(fs.existsSync(filePath1)).equal(true);

            // nonsense volume
            try {
                var result = await store.clearVolume('no-volume');
            } catch(e) { eCaught = e; }
            should(eCaught.message).match(/no volume/);
            should(fs.existsSync(filePath2)).equal(true);
            should(fs.existsSync(filePath1)).equal(true);

            // clear only selected volume
            var result = await store.clearVolume(volume1);
            should(fs.existsSync(filePath2)).equal(true);
            should(fs.existsSync(filePath1)).equal(false);
            should.deepEqual(result, {
                filesDeleted: 1,
            });

            // clearEphemerals should not be bothered by deleted files
            fs.writeFileSync(filePath1, 'test-f1');
            store.addEphemeral(guid1);
            should.deepEqual(Object.keys(store.ephemerals), [guid1]);
            var result = await store.clearVolume(volume1);
            should(fs.existsSync(filePath1)).equal(false);
            store.clearEphemerals();
            should.deepEqual(Object.keys(store.ephemerals), []);
            should(fs.existsSync(filePath2)).equal(true);

            done();
        } catch(e) {done(e);} })();
    });
    it("soundInfo(...) => [ info ]", ()=>{
        var store = new SoundStore({
            storePath: TEST_SOUNDS,
        });
        var guid = "0a7eda3b4b66e3e005a85ef78c69bb92";
        var volume = "an_en_sujato_matthew";
        var info = store.soundInfo({guid, volume});
        should.deepEqual(info.map(i=>i.api), ["aws-polly", "aws-polly"]);
        should.deepEqual(info.map(i=>i.voice), ["Matthew", "Matthew"]);
        should(info[0].guid).equal("a8215f97f8e0a0b3708eb643c6d2a6b6");
        should(info[0].text).match(/As they recollect/);
        should(info[1].guid).equal("f1769b95a0843179f14a90afdc5b0d07");
        should(info[1].text).match(/just like cleaning/);

        var guid = "a8215f97f8e0a0b3708eb643c6d2a6b6";
        var info = store.soundInfo({guid, volume});
        should(info[0].text).match(/As they recollect/);
        should(info.length).equal(1);
    });
    it("uploadCaches(...)", done=>{ 
        if (process.env.TEST_UPLOAD_CACHES !== 'true') {
            console.log("To test upload caches:");
            console.log("  export TEST_UPLOAD_CACHES=true");
            done();
            return;
        }
        (async function() { try {
            var store = new SoundStore({
                storePath: TEST_SOUNDS,
            });
            var stats = {};
            var voice = "Matthew";
            var maxUpload = 2;
            var res = await store.uploadCaches({stats, voice, maxUpload});
            should(stats).properties({
                json: 6,
                mp3: 4,
                guidFolders: 3,
                status: "done",
                volumes: 1,
                ffmegConcat: 2,
                'aws-polly': 4,
                base64: 129392,
            });
            should(stats.uploads).above(-1).below(5);
            should(res.finished - res.started).below(10*1000).above(0);
            should(res).equal(stats);
            done();
        } catch(e) { done(e); }})();
    });
})
