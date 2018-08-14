(typeof describe === 'function') && describe("watson", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Watson = require("../src/watson");
    const AbstractTTS = require("../src/abstract-tts");
    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

    it("TESTTESTconstructor reads credentials", function() {
        var watson = new Watson();
        var cred = fs.readFileSync(path.join(__dirname,'../local/watson/credentials.json'));
        should(watson).properties({
            credentials: JSON.parse(cred),
            language: 'en',
            voice: 'en-GB_KateVoice', // clarity of enunciation
            prosody: {
                rate: "-10%", // deliberate
                pitch: "-30%", // mature resonance
            },
        });
    });
    it("TESTTESTsignature(text) returns signature that identifies synthesized speech", function() {
        var watson = new Watson();
        var sig = watson.signature('hello world');
        var guid = watson.mj.hash(sig);
        should.deepEqual(sig, {
            api: 'watson/text-to-speech/v1',
            audioMIME: 'audio/ogg',
            voice: 'en-GB_KateVoice',
            prosody: {
                pitch: '-30%',
                rate: '-10%',
            },
            text: 'hello world',
            guid,
        });
    });
    it("TESTTESTtextToSpeech returns textToSpeech API instance", function(done) {
        var watson = new Watson();
        var tts = watson.textToSpeech;
        should(tts).instanceOf(TextToSpeechV1);
        done();
    });
    it("TESTTESTsynthesizeSSML(ssml) returns sound file", function(done) {
        var cache = true; 
        this.timeout(3*1000);
        var watson = new Watson();
        var segments = [
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>`,
            `full enlightenment, I say.`,
        ];
        var ssml = segments.join(' ');
        (async function() {
            var result = await watson.synthesizeSSML(ssml, { cache });
            should(result).properties(['file','signature','stats','hits', 'misses']);
            should(result.stats.size).greaterThan(5000); 
            var suffix = result.file.substring(result.file.length-4);
            should(suffix).equal('.ogg');
            done();
        })();
    });
    it("TESTTESTsynthesizeSSML(ssml) returns sound file", function(done) {
        this.timeout(3*1000);
        (async function() {
            var cache = true; 
            var watson = new Watson();
            var text = [
                "Tomatoes are",
                "red.",
                "Tomatoes are red. Broccoli is green"
            ];
            var result = await watson.synthesizeText(text, {cache});
            should(result.length).equal(4);
            should(result[0].stats.size).greaterThan(1000);
            should(result[1].stats.size).greaterThan(1000);
            should(result[2].stats.size).greaterThan(1000);
            should(result[3].stats.size).greaterThan(1000);
            should(result[0].signature.text).match(/Tomatoes are/);
            should(result[1].signature.text).match(/red/);
            should(result[2].signature.text).match(/Tomatoes are red/);
            should(result[3].signature.text).match(/Broccoli is green/);
            done();
        })();
    });

})
