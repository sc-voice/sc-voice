(typeof describe === 'function') && describe("watson", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Watson = require("../src/watson");
    const AbstractTTS = require("../src/abstract-tts");
    const TextToSpeechV1 = require('watson-developer-cloud/text-to-speech/v1');

    it("constructor reads credentials", function() {
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
    it("signature(text) returns signature that identifies synthesized speech", function() {
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
    it("textToSpeech returns textToSpeech API instance", function(done) {
        var watson = new Watson();
        var tts = watson.textToSpeech;
        should(tts).instanceOf(TextToSpeechV1);
        done();
    });
    it("synthesizeSSML(ssml) returns sound file", function(done) {
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
            should(result).properties(['file','signature','hits', 'misses']);
            should(fs.statSync(result.file).size).greaterThan(1000);
            var suffix = result.file.substring(result.file.length-4);
            should(suffix).equal('.ogg');
            done();
        })();
    });
    it("synthesizeText(ssml) returns sound file", function(done) {
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
    it("segment references in HTML templates", function(done) {
        var snsutta = {
            "sn1.6:2.1": "How many sleep while others wake?",
        };
        var sn = (s,a,b) => {
            var key = `sn${s}:${a}.${b}`;
            return snsutta[key] || `(not found:${key}`;
        };
        var html = '<html>${sn(1.6,2,1)}</html>';
        should(`${html}`).equal('<html>${sn(1.6,2,1)}</html>');
        should(eval("`" + html + "`")).equal('<html>How many sleep while others wake?</html>');
        done();
    });

})
