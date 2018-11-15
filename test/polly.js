(typeof describe === 'function') && describe("polly", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
    } = require("../index");


    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 

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
            languageUnknown: 'pli',
        });
        var ssml = polly.segmentSSML('mūlaṃ');
        should.deepEqual(ssml, [
            '<phoneme alphabet="ipa" ph="mʊːlɐṃ">mūlaṃ</phoneme><break time="0.001s"/>',
        ]);
    });
    it("synthesizeSSML(ssml) returns sound file", function(done) {
        this.timeout(3*1000);
        var polly = new Polly();
        var segments = [
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>`,
            `full enlightenment, I say.`,
        ];
        var ssml = segments.join(' ');
        (async function() {
            var result = await polly.synthesizeSSML(ssml, { cache });
            should(result).properties(['file','signature','hits', 'misses']);
            should(fs.statSync(result.file).size).greaterThan(1000);
            var suffix = result.file.substring(result.file.length-4);
            should(suffix).equal('.mp3');
            done();
        })();
    });
    it("synthesizeText([text]) returns sound file for array of text", function(done) {
        this.timeout(3*1000);
        (async function() {
            var polly = new Polly();
            var text = [
                "Tomatoes are",
                "red.",
                "Tomatoes are red. Broccoli is green"
            ];
            var result = await polly.synthesizeText(text, {cache});
            should(result).properties(['file','hits','misses','signature','cached']);
            should(result.signature.files.length).equal(4);
            should(fs.statSync(result.signature.files[0]).size).greaterThan(1000); // Tomatoes are
            should(fs.statSync(result.signature.files[1]).size).greaterThan(1000); // red.
            should(fs.statSync(result.signature.files[2]).size).greaterThan(1000); // Tomatoes are red.
            should(fs.statSync(result.signature.files[3]).size).greaterThan(1000); // Broccoli is green.
            should(fs.statSync(result.file).size).greaterThan(5000);
            done();
        })();
    });

})
