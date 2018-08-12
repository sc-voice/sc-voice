(typeof describe === 'function') && describe("watson", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Watson = require("../src/watson");
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
    it("TESTTESTwordInfo(word) returns information about a word", function() {
        var watson = new Watson();
        var bhikkhu = {
            ipa: "b\u026aku\u02D0(.)",
        };
        var bhikkhus = {
            ipa: "b\u026aku\u02D0z(.)",
        };

        // no information
        should.deepEqual(watson.wordInfo('asdf'), null);

        // singular variations
        should.deepEqual(watson.wordInfo('Bhikkhu'), bhikkhu);
        should.deepEqual(watson.wordInfo('Bikkhu'), bhikkhu);
        should.deepEqual(watson.wordInfo('Bhikku'), bhikkhu);
        should.deepEqual(watson.wordInfo('bhikkhu'), bhikkhu);
        should.deepEqual(watson.wordInfo('bikkhu'), bhikkhu);
        should.deepEqual(watson.wordInfo('bhikku'), bhikkhu);

        // plural variations
        should.deepEqual(watson.wordInfo('Bhikkhus'), bhikkhus);
        should.deepEqual(watson.wordInfo('Bikkhus'), bhikkhus);
        should.deepEqual(watson.wordInfo('Bhikkus'), bhikkhus);
        should.deepEqual(watson.wordInfo('bhikkhus'), bhikkhus);
        should.deepEqual(watson.wordInfo('bikkhus'), bhikkhus);
        should.deepEqual(watson.wordInfo('bhikkus'), bhikkhus);
    });
    it("TESTTESTwordSSML(word) returns SSML text for word", function() {
        var watson = new Watson();

        // words without information
        should(watson.wordSSML('meditation')).equal('meditation');

        // words with information
        should(watson.wordSSML('bhikkhu'))
        .equal('<phoneme alphabet="ipa" ph="b\u026aku\u02D0">bhikkhu</phoneme>'+
            watson.break(1));
    });
    it("TESTTESTtokensSSML(text) returns array of SSML tokens", function() {
        var watson = new Watson();
        var text = "Bhikkhus, the Tathagata, too, accomplished and fully enlightened";
        var tokens = watson.tokensSSML(text);
        should.deepEqual(tokens, [
            `<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme>` + watson.break(1),
            ',', 'the',
            `<phoneme alphabet="ipa" ph="təˈtɑːɡətə">Tathagata</phoneme>` + watson.break(1),
            ',', 'too', ',', 'accomplished', 'and', 'fully', 'enlightened',
        ]);
    });
    it("TESTTESTsegment(tokens) returns array of segments", function() {
        var watson = new Watson();
        var tokens = [
            'a', '<b/>', ',', '(', 'c', 'd', ')', 'e', '.', 
            'f', 'g', '?', 
            'h', 'i', '!', 
            'j', '\u2018', 'k', ',', '\u2019', 'l',
        ];
        var segments = watson.segment(tokens);
        should.deepEqual(segments, [
            'a <b/>, (c d) e.',
            'f g?',
            'h i!',
            'j \u2018k,\u2019 l',
        ]);
    });
    it("TESTTESTsegmentSSML(text) returns array of SSML text segments", function() {
        var watson = new Watson();
        var segments = [
            'Bhikkhus, he does not conceive earth to be \u2018mine,\u2019 he does not delight in earth.',
            'Why is that?',
            'Because delight is the root of suffering.',
        ];
        var ssml = watson.segmentSSML(segments.join(' '));
        should.deepEqual(ssml, [
            '<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme>' + watson.break(1) +
                ', he does not conceive earth to be \u2018mine,\u2019 he does not delight in earth.',
            'Why is that?',
            'Because delight is the root of suffering.',
        ]);
    });
    it("TESTTESTtokenize(text) returns array of tokens", function() {
        var watson = new Watson();
        var segments = [
            'he does not conceive earth',
            'to be \u2018mine,\u2019.',
            'Why is that?',
        ];
        var text = segments.join(' ');
        var tokens = watson.tokenize(text);
        should.deepEqual(tokens, [
            'he', 'does', 'not', 'conceive', 'earth', 
            'to', 'be', '\u2018', 'mine', ',', '\u2019', '.', 
            'Why', 'is', 'that', '?',
        ]);
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
            /*
            should(result.length).equal(3);
            should(result[0].stats.size).greaterThan(10000);
            should(result[1].stats.size).greaterThan(10000);
            should(result[0].signature.text).match(/Tomatoes are red/);
            should(result[1].signature.text).match(/Broccoli is green/);
            */
            done();
        })();
    });

})
