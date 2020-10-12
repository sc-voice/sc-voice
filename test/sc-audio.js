(typeof describe === 'function') && describe("sc-audio", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const tmp = require('tmp');
    const { logger } = require('log-instance');
    const {
        Playlist,
        SCAudio,
        Section,
        SoundStore,
        Sutta,
        SuttaFactory,
        SuttaStore,
        Voice,
        Words,

    } = require("../index");
    const LOCAL = path.join(__dirname, '../local');
    var soundStore = new SoundStore();
    const SCA = new SCAudio();
    this.timeout(30*1000);

    it("constructor", function() {
        // Default
        var sca = SCA;
        should(sca).properties({
            reader: 'sujato',
            author: 'sujato',
            language: 'en',
            urlRaw: 
                `https://raw.githubusercontent.com/sujato/sc-audio/master/flac`,
            urlMap: `https://${SCAudio.SC_OPUS_STORE}.sgp1.digitaloceanspaces.com`,
            urlSegments: 
                `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`,
            extSeg: '.webm',
            extRaw: '.flac',
            downloadDir: path.join(LOCAL, 'sc-audio'),
        });

        // Custom
        var reader = 'test-reader';
        var author = 'test-author';
        var language = 'pli';
        var urlRaw = 'test-raw';
        var props = {
            reader,
            author,
            language,
            urlRaw,
        };
        var sca = new SCAudio(props);
        should(sca).properties(props);
    });
    it("rawUrl(suid...)", function() {
        var sca = SCA;
        should(sca.rawUrl('SN1.43')).equal(
            'https://raw.githubusercontent.com/sujato/sc-audio/master/flac'+
            '/en/sn/sn1/sn1.43-en-sujato-sujato.flac');
    });
    it("aeneasMapUrl(suid...)", function() {
        var sca = SCA;
        should(sca.aeneasMapUrl('sn1.09')).equal(
            `https://${SCAudio.SC_OPUS_STORE}.sgp1.digitaloceanspaces.com`+
            '/en/sn/sn1/sn1.9-en-sujato-sujato.json');
    });
    it("segmentUrl(suidseg...)", function() {
        var sca = SCA;
        should(sca.segmentUrl('SN1.09:2.1','pli')).equal(
            `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`+
            '/pli/sn/sn1/sn1.9/sn1.9_2.1.webm');
        should(sca.segmentUrl('SN1.58:2.1','pli')).equal(
            `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`+
            '/pli/sn/sn1/sn1.58/sn1.58_2.1.webm');

        var sca = new SCAudio({
            language: 'pli',
        });
        should(sca.segmentUrl('SN1.58:2.1')).equal(
            `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`+
            '/pli/sn/sn1/sn1.58/sn1.58_2.1.webm');
    });
    it("aeneasMap(suid...) returns aeneas map JSON", function(done) {
        (async function() { try {
            var sca = SCA;
            var resMap = await sca.aeneasMap('sn1.09');
            should.deepEqual(Object.keys(resMap).sort(), [
                'fragments',
            ].sort());
            var fragments = resMap.fragments;
            should.deepEqual(fragments[7], {
                //begin: '26.34',
                //end: '31.26',
                begin: '42.832',
                end: '47.932',
                children: [],
                id: 'sn1.9:3.1',
                language: 'en',
                lines: [
                    'Having given up conceit, serene within oneself, ',
                ],
            });
            done();
        } catch(e) { done(e); } })();
    });
    it("catalog(opts) returns sutta catalog", function(done) {
        (async function() { try {
            var sca = SCA;
            var response = await sca.catalog();
            fs.writeFileSync('/tmp/sca_catalog', JSON.stringify(response, null, 2));
            var aeneasMaps = response.aeneasMaps;
            var suids = Object.keys(aeneasMaps);
            should(suids.length).above(20);
            should(suids.length).below(5000);
            should(aeneasMaps['sn1.1']).properties(['pli', 'en']);
            should(aeneasMaps['sn1.55']).properties(['pli', 'en']);
            should(aeneasMaps['sn2.20']).properties(['pli', 'en']);

            // are the suttas really there?
            var suid = 'sn1.2';
            var entry = aeneasMaps[suid];
            should.deepEqual(entry, {
                //pli: 'pli/sn/sn1/sn1.02-pli-mahasangiti-sujato.json',
                //en: 'en/sn/sn1/sn1.02-en-sujato-sujato.json',
                pli: 'json/sn1.02-pli-mahasangiti-sujato.json',
                en: 'json/sn1.02-en-sujato-sujato.json',
            });
            var resMap = await sca.aeneasMap(suid, 'pli', 'mahasangiti', 'sujato');
            should(resMap.fragments.length).equal(11);
            should(resMap.fragments[0].lines[0]).match(/Nimokkhasutta/);

            done();
        } catch(e) { done(e); } })();
    });
    it("downloadSegmentAudio(suttaSegId,...) downloads audio file", function(done) {
        (async function() { try {
            var language = 'en';
            var reader = 'sujato';
            var suttaSegId = 'sn1.9:1.1';
            var author = 'sujato';
            var downloadDir = tmp.tmpNameSync();
            should(fs.existsSync(downloadDir)).equal(false);
            var sca = new SCAudio({
                downloadDir,
            });
            should(sca.downloadDir).equal(downloadDir);
            should(fs.existsSync(downloadDir)).equal(true);
            var audioPath = path.join(downloadDir, 'sn1.9_1.1.mp3');

            // english
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
            });
            var url = [
                `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`,
                "en",
                "sn/sn1/sn1.9/sn1.9_1.1.webm",
            ].join('/');
            should.deepEqual(res,{
                language: 'en',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });

            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(28000).below(29000);

            // Pali
            var url = [
                `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`,
                "pli",
                "sn/sn1/sn1.9/sn1.9_1.1.webm",
            ].join('/');
            var sca = new SCAudio();
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
                language: 'pli',
                audioPath, // overrides downloadDir
            });
            should.deepEqual(res,{
                language: 'pli',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(16000).below(29000);

            done();
        } catch(e) { done(e); } })();
    });
    it("downloadSegmentAudio(suttaSegId,...) creates sn1.9:1.1 audio file", function(done) {
        (async function() { try {
            var language = 'en';
            var reader = 'sujato';
            var suttaSegId = 'sn1.9:1.1';
            var author = 'sujato';
            var downloadDir = tmp.tmpNameSync();
            should(fs.existsSync(downloadDir)).equal(false);
            var sca = new SCAudio({
                downloadDir,
            });
            should(sca.downloadDir).equal(downloadDir);
            should(fs.existsSync(downloadDir)).equal(true);
            var audioPath = path.join(downloadDir, `sn1.9_1.1.mp3`);
            var opus = SCAudio.SC_OPUS_STORE;

            // english
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
                //audioPath,
            });
            var url = [
                `https://${opus}.sgp1.cdn.digitaloceanspaces.com`,
                "en",
                "sn/sn1/sn1.9/sn1.9_1.1.webm",
            ].join('/');
            should.deepEqual(res,{
                language: 'en',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(28000).below(29000);

            // Pali
            var url = [
                `https://${opus}.sgp1.cdn.digitaloceanspaces.com`,
                "pli",
                "sn/sn1/sn1.9/sn1.9_1.1.webm",
            ].join('/');
            var sca = new SCAudio();
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
                language: 'pli',
                audioPath, // overrides downloadDir
            });
            should.deepEqual(res,{
                language: 'pli',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(16000).below(29000);

            done();
        } catch(e) { done(e); } })();
    });
    it("downloadSegmentAudio(suttaSegId,...) creates sn2.3:1.1 audio file", function(done) {
        (async function() { try {
            var language = 'en';
            var reader = 'sujato';
            var suttaSegId = 'sn2.3:1.1';
            var author = 'sujato';
            var downloadDir = tmp.tmpNameSync();
            should(fs.existsSync(downloadDir)).equal(false);
            var sca = new SCAudio({
                downloadDir,
            });
            should(sca.downloadDir).equal(downloadDir);
            should(fs.existsSync(downloadDir)).equal(true);
            var audioPath = path.join(downloadDir, `sn2.3_1.1.mp3`);

            // english
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
                //audioPath,
            });
            var url = [
                `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`,
                "en",
                "sn/sn2/sn2.3/sn2.3_1.1.webm",
            ].join('/');
            should.deepEqual(res,{
                language: 'en',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(28000).below(29000);

            // Pali
            var url = [
                `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`,
                "pli",
                "sn/sn2/sn2.3/sn2.3_1.1.webm",
            ].join('/');
            var sca = new SCAudio();
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
                language: 'pli',
                audioPath, // overrides downloadDir
            });
            should.deepEqual(res,{
                language: 'pli',
                reader,
                suttaSegId,
                audioPath,
                author,
                contentType: 'video/webm',
                url,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(32000).below(34000);

            done();
        } catch(e) { done(e); } })();
    });
    it("cacheSuttaAudio(opts) populates cache with segment audio", async()=>{
        var sca = SCA;
        var suid = 'sn1.09';
        var opts = {
            suid,
            suttaStore: SuttaStore.suttaStore,
            soundStore,
        };
        await new Promise(r=>setTimeout(()=>r(),500)); // test initialize
        await SuttaStore.suttaStore.initialize();
        var res = await sca.cacheSuttaAudio(opts);
        should(res).properties({
            suid,
        });
    });
});

