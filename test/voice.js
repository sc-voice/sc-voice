(typeof describe === 'function') && describe("voice", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
        Voice,
        Words,
    } = require('../index');
    const BREAK = `<break time="0.001s"/>`;

    it("loadVoices(voicePath) should return voices", function() {
        var voices = Voice.loadVoices();
        should(voices).instanceOf(Array);
        should(voices.length).greaterThan(0);
        var raveena = voices.filter(voice => voice.name === 'Raveena')[0];
        should(raveena).instanceOf(Voice);
        should(raveena).properties({
            language: 'en-IN',
            name: 'Raveena',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigate: "+5%", 
                recite: "-20%",
            },
        });
        should(!!raveena.ipa).equal(true);
        should(!!raveena.ipa.pli).equal(true);

        var amy = voices.filter(voice => voice.name === 'Amy')[0];
        should(amy).instanceOf(Voice);
        should(amy).properties({
            language: 'en-GB',
            name: 'Amy',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigate: "+5%", 
                recite: "-30%",
            },
        });
        should(!!amy.ipa).equal(true);
        should(!!amy.ipa.pli).equal(true);

        var salli = voices.filter(voice => voice.name === 'Salli')[0];
        should(salli).instanceOf(Voice);
        should(salli).properties({
            language: 'en-US',
            name: 'Salli',
            service: 'aws-polly',
            gender: 'female',
            rates: {
                navigate: "+5%", 
                recite: "-20%",
            },
        });
        should(!!salli.ipa).equal(true);
        should(!!salli.ipa.pli).equal(true);
    });
    it("createVoice(opts) returns voice for a language", function() {
        var voice = Voice.createVoice();
        should(voice).instanceOf(Voice);
        should(voice.language).equal("en-IN");
        should(voice.name).equal("Raveena");
        should(voice.usage).equal("recite");

        var amy = Voice.createVoice("en-GB");
        should(amy).instanceOf(Voice);
        should(amy.language).equal("en-GB");
        should(amy.name).equal("Amy");
        should(amy.usage).equal("recite");
    });
    it("createVoice(opts) creates a Voice instance", function() {
        var reciteVoice = Voice.createVoice("en-IN");
        should(reciteVoice.services.navigate).instanceOf(Polly);
        should(reciteVoice.services.recite).instanceOf(Polly);
        should(reciteVoice.usage).equal('recite');
        should.deepEqual(reciteVoice.services.navigate.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reciteVoice.services.recite.prosody, {
            pitch: "-0%",
            rate: "-20%",
        });

        var navVoice = Voice.createVoice({
            name: "Raveena",
            usage: "navigate",
        });
        should(navVoice.services.navigate).instanceOf(Polly);
        should(navVoice.services.recite).instanceOf(Polly);
        should(navVoice.usage).equal('navigate');
        should.deepEqual(reciteVoice.services.navigate.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reciteVoice.services.recite.prosody, {
            pitch: "-0%",
            rate: "-20%",
        });
    });
    it("speak([text],opts) returns sound file for array of text", function(done) {
        this.timeout(3*1000);
        (async function() {
            var raveena = Voice.createVoice("en-IN");
            var text = [
                "Tomatoes are",
                "red.",
                "Tomatoes are red. Broccoli is green"
            ];
            var cache = true;
            var opts = {
                cache,
                usage: "navigate",
            };
            var result = await raveena.speak(text, opts);
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
    it("placeholder words are expanded with voice ipa", function() {
        /*
         * TTS services such as AWS Polly tend to speak IPA phonemes
         * in a voice-dependent manner. For example, the lower greek
         * letter theta will be voiced differently by en-IN and en-GB voices.
         * Because of this, each voice has its own IPA lexicon ("ipa") 
         * for pronunciation. Because the voice IPA lexicon represents
         * a dialect, it overrides the default language IPA lexicon.
         *
         * This subtle change manifests via the wordSSML() function of
         * abstractTTS.
         */
        var raveena = Voice.createVoice("en-IN");
        should(raveena.services.navigate.wordSSML('sati'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250\u03b8\u026a">sati</phoneme>${BREAK}`);

        var amy = Voice.createVoice("en-GB");
        should(amy.services.navigate.wordSSML('sati'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250t\u026a">sati</phoneme>${BREAK}`);
    });
    it("TESTTESTplaceholder words are expanded with voice ipa", function() {
        var raveena = Voice.createVoice("raveena");
        should(raveena).properties({
            name: "Raveena",
        });
        var tts = raveena.services.navigate;
        should(tts).properties({
            voice: "Raveena",
            language: "en-IN",
            languageUnknown: "en-IN",
        });
        var segments = tts.segmentSSML('sati');
        should.deepEqual(segments, [
            `<phoneme alphabet="ipa" ph="s\u0250\u03b8\u026a">sati</phoneme>${BREAK}`,
        ]);

        // Interpret unknown words as English
        var segments = tts.segmentSSML('Koalas and gummibears?');
        should.deepEqual(segments, [
            'Koalas and gummibears?',
        ]);

        // Interpret unknown words as Pali
        tts.languageUnknown = "pli";
        var segments = tts.segmentSSML('Taṃ kissa hetu?');
        should.deepEqual(segments, [
            `<phoneme alphabet="ipa" ph="\u03b8\u0250\u1e43">Taṃ</phoneme>${BREAK} ` +
            `<phoneme alphabet="ipa" ph="k\u026assa">kissa</phoneme>${BREAK} ` +
            `<phoneme alphabet="ipa" ph="he\u03b8u">hetu</phoneme>${BREAK}?`,
        ]);
    });

})
