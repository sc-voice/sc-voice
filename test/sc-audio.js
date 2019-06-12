(typeof describe === 'function') && describe("sc-audio", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const tmp = require('tmp');
    const { logger } = require('rest-bundle');
    const {
        Playlist,
        Section,
        SoundStore,
        Sutta,
        SuttaStore,
        SCAudio,
        SuttaFactory,
        SuttaCentralId,
        SuttaCentralApi,
        Voice,
        Words,
    } = require("../index");
    const LOCAL = path.join(__dirname, '../local');
    var suttaStore = new SuttaStore();
    var soundStore = new SoundStore();

    it("constructor", function() {
        // Default
        var sca = new SCAudio();
        should(sca).properties({
            reader: 'sujato',
            author: 'sujato',
            language: 'en',
            urlRaw: 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac',
            urlMap: 'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com',
            urlSegments: 'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com',
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
        var sca = new SCAudio();
        should(sca.rawUrl('SN1.43')).equal(
            'https://raw.githubusercontent.com/sujato/sc-audio/master/flac'+
            '/en/sn/sn1/sn1.43-en-sujato-sujato.flac');
    });
    it("mapUrl(suid...)", function() {
        var sca = new SCAudio();
        should(sca.mapUrl('sn1.09')).equal(
            'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com'+
            '/en/sn/sn1/sn1.09-en-sujato-sujato.json');
    });
    it("segmentUrl(suidseg...)", function() {
        var sca = new SCAudio();
        should(sca.segmentUrl('SN1.09:2.1','pli')).equal(
            'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com'+
            '/pli/sn/sn1/sn1.9/sn1.9_2.1.webm');
        should(sca.segmentUrl('SN1.58:2.1','pli')).equal(
            'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com'+
            '/pli/sn/sn1/sn1.58/sn1.58_2.1.webm');

        var sca = new SCAudio({
            language: 'pli',
        });
        should(sca.segmentUrl('SN1.58:2.1')).equal(
            'https://sc-opus-store.sgp1.cdn.digitaloceanspaces.com'+
            '/pli/sn/sn1/sn1.58/sn1.58_2.1.webm');
    });
    it("mapJson(suid...) returns aeneas map JSON", function(done) {
        (async function() { try {
            var sca = new SCAudio();
            var resMap = await sca.mapJson('sn1.09');
            should.deepEqual(Object.keys(resMap).sort(), [
                'fragments',
            ].sort());
            var fragments = resMap.fragments;
            should.deepEqual(fragments[7], {
                begin: '27.140',
                children: [],
                end: '32.020',
                id: 'sn1.9:3.1',
                language: 'en',
                lines: [
                    'Having given up conceit, serene within oneself,',
                ],
            });
            done();
        } catch(e) { done(e); } })();
    });
    it("catalog(suid...) returns sutta catalog", function(done) {
        (async function() { try {
            var sca = new SCAudio();
            var response = await sca.catalog();
            should.deepEqual(Object.keys(response).sort(), [
                'suttas',
            ].sort());
            var suttas = response.suttas;
            should(suttas.length).above(20);
            should(suttas.length).below(5000);

            // are the suttas really there?
            var suttaSN1_2 = suttas.filter(suid => suid === 'sn1.02')[0];
            var resMap = await sca.mapJson(suttaSN1_2, 'en', 'sujato', 'sujato');
            should(resMap.fragments.length).equal(11);
            should(resMap.fragments[0].lines[0]).equal('Liberation');
            var resMap = await sca.mapJson(suttaSN1_2, 'pli', 'mahasangiti', 'sujato');
            should(resMap.fragments.length).equal(11);
            should(resMap.fragments[0].lines[0]).equal('Nimokkhasutta');

            done();
        } catch(e) { done(e); } })();
    });
    it("TESTTESTdownloadSegmentAudio(suttaSegId,...) downloads audio file", function(done) {
        this.timeout(5*1000);
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
            var audioPath = path.join(downloadDir, 'sn1.9_1.1.webm');

            // english
            var res = await sca.downloadSegmentAudio({
                suttaSegId,
            });
            should.deepEqual(res,{
                language: 'en',
                reader,
                suttaSegId,
                audioPath,
                author,
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).equal(37922);

            // Pali
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
            });
            should(fs.existsSync(audioPath)).equal(true);
            var stats = fs.statSync(audioPath);
            should(stats.size).above(80000);
            should(stats.size).below(90000);

            done();
        } catch(e) { done(e); } })();
    });
    it("cacheSuttaAudio(opts) populates cache with segment audio", function(done) {
        (async function() { try {
            var sca = new SCAudio();
            var suid = 'sn1.09';
            var opts = {
                suid,
                suttaStore,
                soundStore,
            };
            await suttaStore.initialize();
            var res = await sca.cacheSuttaAudio(opts);
            should(res).properties({
                suid,
            });
            done();
        } catch(e) {done(e);} })();
    });
});

