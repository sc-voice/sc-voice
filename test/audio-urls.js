(typeof describe === 'function') && describe("sutta-store", function() {
    const should = require("should");
    const {
        AudioUrls,
    } = require("../index");

    const FLAC_ROOT = 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac';

    it("TESTTESTAudioUrls(...) creates an audio url map", function() {
        var audio = new AudioUrls();
        should(audio.rootMime).equal('flac');
        should(audio.rootUrl)
            .equal('https://raw.githubusercontent.com/sujato/sc-audio/master/flac');
        should(audio.speaker).equal('sujato');
        should(audio.lang).equal('pli');
        should(audio.author).equal('mahasangiti');

        // custom
        var audio = new AudioUrls({
            rootUrl: 'testRoot',
            rootMime: 'testMime',
            author: 'testAuthor',
            speaker: 'testSpeaker',
            lang: 'testLang',
        });
        should(audio.rootMime).equal('testMime');
        should(audio.rootUrl).equal('testRoot');
        should(audio.speaker).equal('testSpeaker');
        should(audio.lang).equal('testLang');
        should(audio.author).equal('testAuthor');
    });
    it("TESTTESTbuildUrl(opts) returns audio url ", function() {
        var audio = new AudioUrls();
        should(audio.buildUrl('sn1.23')).equal(
            `${FLAC_ROOT}/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.flac`);

        var audio = new AudioUrls({
            rootUrl: 'testRoot',
            rootMime: 'testMime',
            author: 'testAuthor',
            speaker: 'testSpeaker',
            lang: 'testLang',
        });
        var opts = {
            suttaId: 'sn1.1',
        };
        should(audio.buildUrl(opts)).equal(
            `testRoot/testLang/sn/sn1/sn1.1-testLang-testAuthor-testSpeaker.testMime`);

        var opts = {
            suttaId: 'sn1.1',
            rootUrl: 'xRoot',
            author: 'xAuthor',
            speaker: 'xSpeaker',
            mime: 'xMime',
            lang: 'xLang',
        };
        should(audio.buildUrl(opts)).equal(
            `xRoot/xLang/sn/sn1/sn1.1-xLang-xAuthor-xSpeaker.xMime`);
    });
    it("TESTTESTaudioUrl(...) returns audio url or null", function(done) {
        (async function() { try {
            var audio = new AudioUrls();

            // good url 
            var result = await audio.audioUrl('sn1.23');
            should.deepEqual(result, {
                url: `${FLAC_ROOT}/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.flac`,
                statusCode: 200,
            });

            // http url
            var rootUrl = FLAC_ROOT.replace(/https/,'http');
            var result = await audio.audioUrl({
                rootUrl,
                suttaId: 'sn1.23',
            });
            should.deepEqual(result, {
                url: `${FLAC_ROOT}/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.flac`,
                statusCode: 301,
            });

            // bad url
            var result = await audio.audioUrl('badsutta');
            should.deepEqual(result, {
                url: null,
                urlUnavailable: 'https://raw.githubusercontent.com/sujato/sc-audio/master/flac/pli/badsutta/badsutta/badsutta-pli-mahasangiti-sujato.flac',
                statusCode: 404,
            });

            // bad root
            var audio = new AudioUrls({
                rootUrl: 'https://nosuchdomain.error',
            });
            var result = await audio.audioUrl('sn1.23');
            should.deepEqual(result, {
                url: null,
                urlUnavailable: 'https://nosuchdomain.error/pli/sn/sn1/sn1.23-pli-mahasangiti-sujato.flac',
                // no statusCode
            });

            done(); 
        } catch(e) {done(e);} })();
    });
//https://raw.githubusercontent.com/sujato/sc-audio/master/flac/pli/sn/sn1/sn1.11-pli-mahasangiti-sujato.flac

})
