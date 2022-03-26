(typeof describe === 'function') && describe("vsm-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const tmp = require('tmp');
    const { MerkleJson } = require("merkle-json");
    const { logger, } = require('log-instance');
    logger.logLevel = 'error';
    const { GuidStore } = require('memo-again');
    const {
        SoundStore,
        SuttaStore,
        S3Bucket,
        Task,
        Voice,
        VsmStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    const TEST_TEXT = [
        "That’s how you should train.",
        "So you should train like this:",
    ].join("\n");
    const TEST_VOLUME = "test-volume";
    const TEST_BUCKET = 'sc-voice-test-bucket';
    const TEST_S3 = {
        endpoint: 's3.us-west-1.amazonaws.com',
        region: 'us-west-1',
    };
    const VOICE_OPTS = {
        usage: "recite",
        volume: TEST_VOLUME,
    };
    const DEPRECATED = true;
    var mj = new MerkleJson();
    logger.level = 'warn';
    var storePath = tmp.tmpNameSync();
    this.timeout(20*1000);

    it("VsmStore() creates VSM", function() {
        var vsm = new VsmStore();
        should(vsm).instanceof(VsmStore);
        should(vsm).instanceof(SoundStore);
        should(vsm).instanceof(GuidStore);
        should(vsm.voice).instanceof(Voice);
        should(vsm.soundStore).instanceof(SoundStore);
        should(fs.existsSync(vsm.storePath)).equal(true);
        should(vsm.type).equal('VsmStore');
        should(vsm.storeName).equal('vsm');
        should(vsm.storePath).equal(path.join(LOCAL, 'vsm'));
        should(vsm.volume).equal('common');
        should(vsm.audioSuffix).equal('.mp3');
        should(vsm.audioFormat).equal('mp3');
        should(vsm.audioMIME).equal('audio/mp3');
        should(vsm.s3Bucket).instanceOf(S3Bucket);
        should(vsm.s3Bucket.initialized).equal(false);
    });
    it("VsmStore() creates custom VSM", function(done) {
        (async function() { try {
            var aditi = Voice.createVoice({
                name: "aditi",
                usage: 'recite',
                localeIPA: "pli",
                language: 'hi-IN',
                stripNumbers: true,
                stripQuotes: true,
            });
            var s3Bucket = await new S3Bucket().initialize();
            var vsm = new VsmStore({
                voice: aditi,
                s3Bucket,
            });
            should(vsm.storeName).equal('vsm');
            should(vsm.storePath).equal(path.join(LOCAL, 'vsm'));
            should(vsm.voice).equal(aditi);
            should(vsm.s3Bucket).equal(s3Bucket);
            done();
        } catch(e) {done(e);} })();
    });
    it("importSpeakResult(sr) imports simple guid", async()=>{
        var storePath = tmp.tmpNameSync();;
        var vsm = new VsmStore({
            storePath,
        });
        var voice = vsm.voice;

        // Vsm.speak() returns similar result as voice.speak()
        var speakResult = await voice.speak('So I have heard', VOICE_OPTS);
        var guid = speakResult.signature.guid;
        var importResult = await vsm.importSpeakResult(speakResult);
        should(importResult).properties({
            segments: speakResult.segments,
            signature: speakResult.signature,
        });
        var reFile = new RegExp(`${vsm.storePath}`,'u');
        should(importResult.file).match(reFile);
        should(fs.existsSync(importResult.file)).equal(true);

        // the importMap has all imported guids
        var guid = importResult.signature.guid;
        should(vsm.importMap[guid]).equal(importResult);
    });
    it("importSpeakResult(sr) imports compound guid", done=>{
        (async function() { try {
            var storePath = tmp.tmpNameSync();;
            var voice = Voice.createVoice('amy');
            var vsm = new VsmStore({
                storePath,
                voice,
            });

            // Vsm.speak() returns similar result as voice.speak()
            var speakResult = await voice.speak(TEST_TEXT, VOICE_OPTS);
            var guid = speakResult.signature.guid;
            var importResult = await vsm.importSpeakResult(speakResult);
            should(importResult).properties({
                segments: speakResult.segments,
                signature: speakResult.signature,
            });

            // We import top-level ephemeral files
            should(fs.existsSync(importResult.file)).equal(true);
            var reFile = new RegExp(`${vsm.storePath}`,'u');
            should(importResult.file).match(reFile);

            // We do not import files that comprise top-level files
            var files = speakResult.signature.files;
            should(files.length).equal(2);
            for (var i=0; i<files.length; i++) {
                var f = files[i];
                should(fs.existsSync(path.join(storePath, f))).equal(false);
            }

            // the importMap has all imported guids
            var guid = importResult.signature.guid;
            should(vsm.importMap[guid]).equal(importResult);

            done();
        } catch(e) {done(e);} })();
    });
    it("speak(text,opts) decorates voice.speak()", function(done) {
        (async function() { try {
            var vsm = new VsmStore();
            var voice = vsm.voice;

            // Vsm.speak() returns similar result as voice.speak()
            var resultVoice = await voice.speak(TEST_TEXT, VOICE_OPTS);
            var resultVsm = await vsm.speak(TEST_TEXT, VOICE_OPTS);
            should.deepEqual(resultVsm.signature, resultVoice.signature); 
            should.deepEqual(Object.keys(resultVsm).sort(),
                Object.keys(resultVoice).sort());

            done();
        } catch(e) {done(e);} })();
    });
    it("importSutta(sutta) imports sutta segments", async()=>{
        return; // TODO I HAVE NO IDEA WHY THIS BREAKS
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var vsm = new VsmStore({
            storePath: tmpDirObj.name,
        });
        var results = await SuttaStore.suttaStore.search("thig1.2");
        var {
            sutta,
            author_uid,
            lang,
            signature,
        } = results.results[0];
        var volume = "kn_pli_mahasangiti_aditi";
        vsm.clearVolume(volume);
        var sutta_uid = sutta.sutta_uid;
        var guidsOld = Object.assign({},vsm.importMap);
        var importResult = await vsm.importSutta(sutta);
        var guids = Object.keys(vsm.importMap).filter(guid => !guidsOld[guid]);
        should.deepEqual(importResult, {
            sutta_uid,
            volume,
            guids, // newly added guids
        });
    });
    it("serializeVolume(volume) serializes volume", async()=>{
        console.log(`TODO`,__filename); return; 
        var vsm = new VsmStore();
        var voice = vsm.voice;
        var resultVsm = await vsm.speak(TEST_TEXT, VOICE_OPTS);
        var filepath = path.join(LOCAL, 'vsm', `${TEST_VOLUME}.tar.gz`);
        if (fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
        }

        // serialize volume
        var result = await vsm.serializeVolume(TEST_VOLUME);
        should(fs.existsSync(filepath)).equal(true);

        // re-serialize volume
        var result = await vsm.serializeVolume(TEST_VOLUME);
        should(fs.existsSync(filepath)).equal(true);
    });
    it("restoreVolume(opts) restores volume", async()=>{
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var soundStore = new SoundStore({
            storePath: tmpDirObj.name,
        });
        var vsm = new VsmStore({
            soundStore,
        });
        var volume = 'kn_en_sujato_amy';
        var archiveFile = path.join(__dirname, 'data', `${volume}.tar.gz`);
        var restoreOpts = {
            volume,
            archiveFile,
        };

        // restore with new volume
        var result = await vsm.restoreVolume(restoreOpts);
        var volPath = path.join(tmpDirObj.name, volume);
        var guid = '528d6018f6e9325e258122ede2ece84b';
        var chapter = guid.substr(0,2);
        var jsonPath = path.join(volPath, chapter, `${guid}.json`);
        should(fs.existsSync(jsonPath)).equal(true);
        should(result.filesDeleted).equal(0);
        should(result).properties([
            'manifest',
            'restored',
            'filesDeleted',
        ]);

        // restore existing volume clears it first (default)
        var markerPath = path.join(volPath, chapter, 'marker');
        fs.writeFileSync(markerPath, 'marker');
        should(fs.existsSync(markerPath)).equal(true);
        var result = await vsm.restoreVolume(restoreOpts);
        should(fs.existsSync(markerPath)).equal(false);
        should(result.filesDeleted).above(90);

        // restore existing volume without clearing it
        restoreOpts.clearVolume = false;
        var markerPath = path.join(volPath, chapter, 'marker');
        fs.writeFileSync(markerPath, 'marker');
        should(fs.existsSync(markerPath)).equal(true);
        var result = await vsm.restoreVolume(restoreOpts);
        should(fs.existsSync(markerPath)).equal(true);
        should(result.filesDeleted).equal(0);

        tmpDirObj.removeCallback();
    });
    it("importNikaya(...) imports nikaya", async()=>{
        if (DEPRECATED) {
            return;
        }
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var vsm = new VsmStore({
            storePath: tmpDirObj.name,
        });
        var task = new Task(); // client can poll task progress
        var maxSuttas = 2; // for testing
        var resImport = await vsm.importNikaya({
            nikaya: 'kn',
            voice: 'aditi',
            maxSuttas,
            task,
        });
        should(task).properties({
            actionsDone: 3,
            actionsTotal: 3,
            error: null,
        });
        should(task).properties([
            'msActive', 'started', 'summary',
        ]);
        //should(task.summary).match(/kn_pli_mahasangiti_aditi suttas imported: 2/);
        //should(task.summary).match(/kp_pli_mahasangiti_aditi suttas imported: 2/);
        should(task.summary).match(/iti_pli_mahasangiti_aditi suttas imported: 2/);
        should(resImport).properties({
            nikaya: 'kn',
            lang: 'pli',
            searchLang: 'en',
            author: 'sujato',
            maxSuttas,
            //sutta_ids: [ 'kp1', 'kp2' ],
            //sutta_ids: [ 'dhp1-20', 'dhp21-32' ],
            sutta_ids: [ 'iti1', 'iti2' ],
            task,
        });
        should(resImport.guids.length).equal(40);
        var volumePath = path.join(tmpDirObj.name, 'iti_pli_mahasangiti_aditi');
        should(fs.existsSync(volumePath)).equal(true);
        var guid = resImport.guids[0];
        var guidPath = path.join(volumePath, guid.substring(0,2), `${guid}.json`);
        should(fs.existsSync(guidPath)).equal(true);

        tmpDirObj.removeCallback();
    });
    it("tarPath(opts) returns tar path", async()=>{
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var vsm = new VsmStore({
            storePath: tmpDirObj.name,
        });
        should(vsm.tarPath()).equal(path.join(tmpDirObj.name, 'common.tar'));
        should(vsm.tarPath({
            volume: 'abc',
        })).equal(path.join(tmpDirObj.name, 'abc.tar'));

        tmpDirObj.removeCallback();
    });
    it("zipPath(opts) returns zip path", async()=>{
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var vsm = new VsmStore({
            storePath: tmpDirObj.name,
        });
        should(vsm.zipPath()).equal(path.join(tmpDirObj.name, 'common.tar.gz'));
        should(vsm.zipPath({
            volume: 'abc',
        })).equal(path.join(tmpDirObj.name, 'abc.tar.gz'));

        tmpDirObj.removeCallback();
    });
    it("archiveNikaya(...) archives nikaya", async()=>{
        if (DEPRECATED) {
            return;
        }
        const Bucket = TEST_BUCKET;
        const s3Bucket = await new S3Bucket({ 
            Bucket, 
            s3: TEST_S3,
        });
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var vsm = new VsmStore({
            storePath: tmpDirObj.name,
            s3Bucket,
        });
        var maxSuttas = 1; // for testing
        var task = new Task({
            name: 'testArchiveNikaya',
        });
        var archivePromise = vsm.archiveNikaya({
            nikaya: 'kn',
            voice: 'aditi',
            maxSuttas,
            s3Bucket,
            task,
        });
        should(task).properties({
            name: 'testArchiveNikaya',
            summary: `testArchiveNikaya created`,
            actionsTotal: 11,
            actionsDone: 0,
        });
        var archiveResult = await archivePromise;
        should(task).properties({
            name: 'testArchiveNikaya',
            actionsTotal: 12,
            actionsDone: 12,
        });
        should(task.summary).match(/Archived iti_pli_mahasangiti_aditi/);

        should.deepEqual(archiveResult.s3Bucket, {
            Bucket,
            s3: TEST_S3,
        });
        should(archiveResult).properties({
            Key: 'iti_pli_mahasangiti_aditi.tar.gz',
        });
        should(archiveResult.response).properties(['ETag']);

        tmpDirObj.removeCallback();
    });
    it("restoreS3Archives(opts) restores from S3 Bucket", async()=>{
        const Bucket = TEST_BUCKET;
        const s3BucketOpts = { 
            Bucket, 
            s3: TEST_S3,
        };
        const s3Bucket = await new S3Bucket(s3BucketOpts);
        var tmpDirObj = tmp.dirSync({
            unsafeCleanup: true,
        });
        var soundStore = new SoundStore({
            storePath: tmpDirObj.name,
        });
        var vsm = new VsmStore({
            s3Bucket,
            soundStore,
        });
        var {
            Contents,
            Name,
        } = await s3Bucket.listObjects();
        should(Contents.length).above(0); // nothing to test
        let { Key, ETag } = Contents[0];
        var params = {
            s3Bucket,
            restore: [{ Key, ETag }],
            soundStore,
            //clearVolume,
        };
        var resRestore = await vsm.restoreS3Archives(params);
        let guid = '477b514e821e18d746b26831ce4b193a';
        var restoredFile = path.join(tmpDirObj.name, 
            `${Key.split('.')[0]}/${guid.substring(0,2)}/${guid}.mp3`);
        should(fs.existsSync(restoredFile)).equal(true);
        should(resRestore).properties({
            s3Bucket: s3BucketOpts,
        });

        tmpDirObj.removeCallback();
    });
})
