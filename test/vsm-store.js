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
        Voice,
        VsmStore,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    const TEST_TEXT = [
        "That’s how you should train.",
        "So you should train like this:",
    ].join("\n");
    const VOICE_OPTS = {
        volume: "test-volume",
        usage: "recite",
    };
    var mj = new MerkleJson();
    logger.level = 'warn';
    var storePath = tmp.tmpNameSync();

    it("TESTTESTVsmStore() creates VSM", function() {
        var vsm = new VsmStore();
        should(vsm).instanceof(VsmStore);
        should(vsm).instanceof(SoundStore);
        should(vsm).instanceof(GuidStore);
        should(vsm.voice).instanceof(Voice);
        should(vsm.soundStore).instanceof(SoundStore);
        should(fs.existsSync(vsm.storePath)).equal(true);
        should(vsm.type).equal('VsmStore');
        should(vsm.storeName).equal('vsm-raveena');
        should(vsm.storePath).equal(path.join(LOCAL, 'vsm', 'vsm-raveena'));
        should(vsm.volume).equal('common');
        should(vsm.audioSuffix).equal('.mp3');
        should(vsm.audioFormat).equal('mp3');
        should(vsm.audioMIME).equal('audio/mp3');
    });
    it("TESTTESTVsmStore() creates custom VSM", function() {
        var aditi = Voice.createVoice({
            name: "aditi",
            usage: 'recite',
            languageUnknown: "pli",
            language: 'hi-IN',
            stripNumbers: true,
            stripQuotes: true,
        });
        var vsm = new VsmStore({
            voice: aditi,
        });
        should(vsm.storeName).equal('vsm-aditi');
        should(vsm.storePath).equal(path.join(LOCAL, 'vsm', 'vsm-aditi'));
        should(vsm.voice).equal(aditi);
    });
    it("TESTTESTimport(speakResult) copies resource files into VSM", function(done) {
        (async function() { try {
            var vsm = new VsmStore();
            var voice = vsm.voice;

            // Vsm.speak() returns similar result as voice.speak()
            var speakResult = await voice.speak(TEST_TEXT, VOICE_OPTS);
            var guid = speakResult.signature.guid;
            var importResult = await vsm.import(speakResult);
            should(importResult).properties({
                segments: speakResult.segments,
                signature: speakResult.signature,
            });
            var reFile = new RegExp(`${vsm.storePath}`,'u');
            should(importResult.file).match(reFile);
            should(fs.existsSync(importResult.file)).equal(true);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTspeak(text,opts) decorates voice.speak()", function(done) {
        (async function() { try {
            var vsm = new VsmStore();
            var voice = vsm.voice;

            // Vsm.speak() returns similar result as voice.speak()
            var resultVoice = await voice.speak(TEST_TEXT, VOICE_OPTS);
            var resultVsm = await vsm.speak(TEST_TEXT, VOICE_OPTS);
            should(resultVsm).properties({
                segments: resultVoice.segments,
                signature: resultVoice.signature,
            });
            should.deepEqual(Object.keys(resultVsm).sort(),
                Object.keys(resultVoice).sort());

            var guid = resultVoice.signature.guid;
            should(vsm.guidMap[guid]).equal(resultVsm);
            done();
        } catch(e) {done(e);} })();
    });
})
