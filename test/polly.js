(typeof describe === 'function') && describe("polly", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger, LogInstance } = require('log-instance');
    const { SayAgain, AwsConfig } = require('say-again');
    const {
        S3Creds,
        Polly,
    } = require("../index");
    const LOCAL = path.join(__dirname, "../local");
    const VSMPATH = path.join(LOCAL, 'vsm-s3.json');
    const awsConfig = new AwsConfig(VSMPATH);
    this.timeout(10*1000);


    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 
    const BREAK='<break time="0.001s"/>';

    function phoneme(ph, text) {
        return `<phoneme alphabet="ipa" ph="${ph}">${text}</phoneme>`+
            `${BREAK}`;
    }

    it("constructor", function() {
        var polly = new Polly();
        should(polly).properties({
            language: 'en-GB',
            voice: 'Amy',
            audioFormat: 'mp3',
            audioSuffix: '.mp3',
            prosody: {
                rate: "-20%", // Slow Amy
            },
        });
        should(polly.logger).instanceOf(LogInstance);
        should(polly.logger).equal(logger);
    });
    it("signature(text) returns TTS synthesis signature", function() {
        var polly = new Polly();
        should(polly.language).equal('en-GB');
        var sig = polly.signature('hello world');
        var guid = polly.mj.hash(sig);
        should.deepEqual(sig, {
            api: 'aws-polly',
            apiVersion: 'v4',
            audioFormat: 'mp3',
            voice: 'Amy',
            language: 'en-GB',
            prosody: {
                rate: '-20%',
            },
            text: 'hello world',
            guid,
        });
    });
    it("segmentSSML(text) returns SSML", function() {
        var polly = new Polly({
            localeIPA: 'pli',
            stripQuotes: true,
        });
        should.deepEqual(polly.segmentSSML('281'),
            ['281']),
        should(polly.isNumber('281–309')).equal(true);
        should.deepEqual(polly.segmentSSML('281–​309'),
            ['281–309']);
        should.deepEqual(polly.segmentSSML('ye'),
            [BREAK+phoneme('je', 'ye')]);
        should.deepEqual(polly.segmentSSML('“Bhadante”ti'), [
            phoneme('bʰɐdɐnte', 'Bhadante') + " " +
            phoneme('tɪ', 'ti')]);
        should.deepEqual(polly.segmentSSML('mūlaṃ'),
            [phoneme('mʊːlɐṃ', 'mūlaṃ')]);
    });
    it("synthesizeSSML(ssml) returns sound file", function(done) {
        var s3Creds = new S3Creds({
            configPath: VSMPATH,
        });
        var sayAgain = new SayAgain(s3Creds.awsConfig);
        var polly = new Polly({sayAgain});
        var segments = [
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>`,
            `full enlightenment, I say.`,
        ];
        var ssml = segments.join(' ');
        var cache = false; // force SayAgain
        (async function() {
            var result = await polly.synthesizeSSML(ssml, { cache });
            should(result).properties(['file','signature','hits', 'misses']);
            should(fs.statSync(result.file).size).greaterThan(1000);
            var suffix = result.file.substring(result.file.length-4);
            should(suffix).equal('.mp3');
            done();
        })();
    });
    it("synthesizeBreak(...) returns sound file", function(done) {
        var polly = new Polly({
            voice: 'Matthew',
            prosody: {},
            language: 'en-US', // locale
            breaks: [0.001,0.1,1.5,0.2,0.3],
        });
        (async function() { try {
            // specific
            var result = await polly.synthesizeBreak(polly.SECTION_BREAK);
            should(result.signature.guid)
                .match(/2571cb7f29a3c98d1899c49d2dd3b4e6/);

            // default
            var result = await polly.synthesizeBreak();
            should(result.signature.guid)
                .match(/2571cb7f29a3c98d1899c49d2dd3b4e6/);

            done();
        } catch (e) {done(e);} })();
    });
    it("synthesizeText([text]) returns sound file for array of text", async()=>{
        var polly = new Polly();
        var text = [
            "Tomatoes are",
            "red.",
            "Tomatoes are red. Broccoli is green"
        ];
        var result = await polly.synthesizeText(text, {cache});
        should(result).properties(['file','hits','misses','signature','cached']);
        should(result.signature.files.length).equal(4);
        var storePath = polly.soundStore.storePath;
        var files = result.signature.files.map(f => path.join(storePath, f));
        should(fs.statSync(files[0]).size).greaterThan(1000); // Tomatoes are
        should(fs.statSync(files[1]).size).greaterThan(1000); // red.
        should(fs.statSync(files[2]).size).greaterThan(1000); // Tomatoes are red.
        should(fs.statSync(files[3]).size).greaterThan(1000); // Broccoli is green.
        should(fs.statSync(result.file).size).greaterThan(5000);
    });

})
