(typeof describe === 'function') && describe("audio-urls", function() {
    const should = require("should");
    const { logger } = require('log-instance');
    logger.logLevel = 'error';
    const {
        AudioUrls,
        SCAudio,
    } = require("../index");

    //const TEST_ROOT = 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac';
    const TEST_ROOT = `https://${SCAudio.SC_OPUS_STORE}.sgp1.cdn.digitaloceanspaces.com`;
    this.timeout(30*1000);

    it("AudioUrls(...) creates an audio url map", function() {
        var audio = new AudioUrls();
        var sources = audio.sources;
        should(sources[0].extension).equal('webm');
        should(sources[0].rootUrl).equal(TEST_ROOT);
        should(sources[0].speaker).equal('sujato');
        should(sources[0].lang).equal('pli');
        should(sources[0].author).equal('mahasangiti');
        should(sources.length).equal(3);

        // custom
        var sources = [{
            rootUrl: 'testRoot',
            extension: 'testExtension',
            author: 'testAuthor',
            speaker: 'testSpeaker',
            lang: 'testLang',
        }];
        var audio = new AudioUrls({
            sources,
        });
        var sources = audio.sources;
        should.deepEqual(audio.sources, sources);
    });
    it("buildUrl(opts) returns audio url ", function() {
        var audio = new AudioUrls();
        should(audio.buildUrl('sn1.23')).equal(
            `${TEST_ROOT}/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.webm`);

        var audio = new AudioUrls({
            sources: [{
                rootUrl: 'testRoot',
                extension: 'testExtension',
                author: 'testAuthor',
                speaker: 'testSpeaker',
                lang: 'testLang',
            }],
        });
        var opts = {
            suttaId: 'sn1.1',
        };
        should(audio.buildUrl(opts)).equal([
            'testRoot',
            'testLang',
            'sn',
            'sn1',
            'sn1.1-testLang-testAuthor-testSpeaker.testExtension',
        ].join('/'));

        var opts = {
            suttaId: 'sn1.1',
            rootUrl: 'xRoot',
            author: 'xAuthor',
            speaker: 'xSpeaker',
            extension: 'xExtension',
            lang: 'xLang',
        };
        should(audio.buildUrl(opts)).equal(
            `xRoot/xLang/sn/sn1/sn1.1-xLang-xAuthor-xSpeaker.xExtension`);
    });
    it("audioUrl(...) returns verified audio url", function(done) {
        (async function() { try {
            var audio = new AudioUrls();

            // good url 
            var result = await audio.audioUrl('sn1.23');
            should.deepEqual(result, {
                url: `${TEST_ROOT}/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.webm`,
                statusCode: 200,
            });

            // http url
            var rootUrl = TEST_ROOT.replace(/https/,'http');
            var result = await audio.audioUrl({
                rootUrl,
                suttaId: 'sn1.23',
            });
            should.deepEqual(result, {
                url: TEST_ROOT.replace('https','http')+
                    '/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.webm',
                statusCode: 200,
            });
            done(); 
        } catch(e) {done(e);} })();
    });
    it("audioUrl(...) handles bad url", function(done) {
        (async function() { try {
            var audio = new AudioUrls();

            // bad url
            var result = await audio.audioUrl('badsutta');
            should.deepEqual(result, {
                url: null,
                urlUnavailable: TEST_ROOT+
                    '/pli/badsutta/badsutta/badsutta-pli-mahasangiti-sujato.webm',
                statusCode: 404,
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("audioUrl(...) handle bad host null", function(done) {
        done(); return; // TBD  takes too long with some DNS servers
        (async function() { try {
            var audio = new AudioUrls();
            // bad root
            var audio = new AudioUrls({
                sources: [{
                    rootUrl: 'https://nosuchdomain.error',
                }],
            });
            var result = await audio.audioUrl('sn1.23');
            should.deepEqual(result, {
                url: null,
                urlUnavailable: [
                    'https://nosuchdomain.error',
                    'noLang',
                    'sn',
                    'sn1',
                    'sn1.23-noLang-noAuthor-noSpeaker.noExtension',
                ].join('/'),
                // no statusCode
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("sourceUrls(...) returns verified audio urls", async()=>{
        var audio = new AudioUrls();

        // Bhante has recorded SN1.23 but nobody else has
        var result = await audio.sourceUrls('sn1.23');
        should.deepEqual(result.map(r => r.source), [
            'Bhikkhu Sujato (Pali)',
            'Bhikkhu Sujato (English)',
        ]);
        should.deepEqual(result.map(r => r.supported), [
            true, true,
        ]);

        // Bhante has not recorded MN1, but other recordings exist
        var result = await audio.sourceUrls('MN1');
        should.deepEqual(result.map(r => r.source), [
            'Other audio sources',
        ]);
        should.deepEqual(result.map(r => r.supported), [
            false,
        ]);
    });

})
