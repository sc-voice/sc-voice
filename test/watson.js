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
            '<break strength="x-weak"></break>');
    });
    it("TESTTESTtokensSSML(text) returns array of SSML tokens", function() {
        var watson = new Watson();
        var text = "Bhikkhus, the Tathagata, too, accomplished and fully enlightened";
        var tokens = watson.tokensSSML(text);
        should.deepEqual(tokens, [
            `<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme><break strength="x-weak"></break>`,
            ',', 'the',
            `<phoneme alphabet="ipa" ph="təˈtɑːɡətə">Tathagata</phoneme><break strength="x-weak"></break>`,
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
            '<phoneme alphabet="ipa" ph="bɪkuːz">Bhikkhus</phoneme><break strength="x-weak"></break>, '+
                'he does not conceive earth to be \u2018mine,\u2019 he does not delight in earth.',
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
    it("TESTTESTsythesize(text) creates wav file", function() {
        return;
        var watson = new Watson();
        //watson.voice = "en-US_MichaelVoice";
        var segments = [
            `<prosody rate="-10%" pitch="-30%">`,
            `<phoneme alphabet="ipa" ph="ˈbɪkuːz">Bhikkhus</phoneme><break strength="x-weak"></break>,`,
            `the <phoneme alphabet="ipa" ph="təˈtɑːɡətə">Tathagata</phoneme><break strength="x-weak"></break>,`,
            `too, accomplished and fully enlightened, directly knows earth as earth.`,
            `Having directly known earth as earth, he does not conceive himself as earth,`,
            `he does not conceive himself in earth,`,
            `he does not conceive himself apart from earth,`,
            `he does not conceive earth to be ‘mine,’ he does not delight in earth.`,
            `Why is that?`,
            `Because he has understood that delight is the root of suffering,`,
            `and that with being as condition there is birth,`,
            `and that for whatever has come to be there is ageing and death.`,
            `Therefore,`,
            `<phoneme alphabet="ipa" ph="ˈbɪkuːz">Bhikkhus</phoneme><break strength="x-weak"></break>,`,
            `through the complete destruction, fading away, cessation,`,
            `giving up, and relinquishing of cravings,`,
            `the <phoneme alphabet="ipa" ph="təˈtɑːɡətə">Tathagata</phoneme><break strength="x-weak"></break>`,
            `has awakened to`,
            //`<phoneme alphabet="ipa" ph="so͞oˈprēm"></phoneme>"`,
            //`<phoneme alphabet="ipa" ph="suˈpriːm"></phoneme>"`,
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>"`,
            `full enlightenment, I say.`,
            `</prosody>`,
        ];
        var xsegments = [
            `<prosody rate="-10%" pitch="-30%">`,
            `has awakened to`,
            //`<phoneme alphabet="ipa" ph="so͞oˈprēm"></phoneme>"`,
            //`<phoneme alphabet="ipa" ph="suˈpriːm"></phoneme>"`,
            //`<phoneme alphabet="ipa" ph="suhpreem"></phoneme>"`,
            //`<phoneme alphabet="ipa" ph="sjuˈpriːm"></phoneme>"`,
            `<phoneme alphabet="ipa" ph="səˈpriːm"></phoneme>"`,
            `full enlightenment, I say.`,
            `</prosody>`,
        ];
        var text = segments.join(' ');
        watson.synthesize(text);
    });

})
