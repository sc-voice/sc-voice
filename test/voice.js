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

    function phoneme(ph,word) {
        var ph = `<phoneme alphabet="ipa" ph="${ph}">${word}</phoneme>${BREAK}`;
        return ph;
    }

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
                recite: "-30%",
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
            syllableVowels: undefined,
            syllabifyLength: undefined,
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
    it("createVoice(opts) creates a recite Voice instance", function() {
        var reciteVoice = Voice.createVoice({
            language: 'en',
            usage: 'recite',
        });
        should(reciteVoice.name).equal('Amy');
        should(reciteVoice.services.navigate).instanceOf(Polly);
        should(reciteVoice.services.recite).instanceOf(Polly);
        should(reciteVoice.usage).equal('recite');
        should(reciteVoice.usages).properties(["navigate", "recite", "review"]);
        should(reciteVoice.usages.review).properties(['rate', 'breaks']);
        should.deepEqual(reciteVoice.services.navigate.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reciteVoice.services.recite.prosody, {
            pitch: "-0%",
            rate: "-30%",
        });

        var navVoice = Voice.createVoice({
            language: 'en',
            usage: "navigate",
        });
        should(navVoice.name).equal('Raveena');
        should(navVoice.services.navigate).instanceOf(Polly);
        should(navVoice.services.recite).instanceOf(Polly);
        should(navVoice.usage).equal('navigate');
        should.deepEqual(navVoice.services.navigate.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
    });
    it("createVoice(opts) creates a review Voice instance", function() {
        var reviewVoice = Voice.createVoice({
            language: "en", 
            usage: 'review',
        });
        should(reviewVoice.name).equal('Raveena');
        should(reviewVoice.usage).equal('review');
        should(reviewVoice.usages).properties(["navigate", "recite", "review"]);
        should(reviewVoice.usages.review).properties(['rate', 'breaks']);
        should(reviewVoice.services.navigate).instanceOf(Polly);
        should(reviewVoice.services.recite).instanceOf(Polly);
        should(reviewVoice.services.review).instanceOf(Polly);
        should.deepEqual(reviewVoice.services.navigate.prosody, {
            pitch: "-0%",
            rate: "+5%",
        });
        should.deepEqual(reviewVoice.services.recite.prosody, {
            pitch: "-0%",
            rate: "-20%",
        });
        should.deepEqual(reviewVoice.services.review.prosody, {
            pitch: "-0%",
            rate: "-5%",
        });
        should.deepEqual(reviewVoice.services.navigate.breaks, 
            [0.001, 0.1, 0.2, 0.3, 0.4]);
        should.deepEqual(reviewVoice.services.recite.breaks, 
            [0.001, 0.1, 0.2, 0.6, 1]);
        should.deepEqual(reviewVoice.services.review.breaks, 
            [0.001, 0.1, 0.2, 0.4, 0.5]);

        var navVoice = Voice.createVoice({
            name: "Raveena",
            usage: "navigate",
        });
    });
    it("speak([text],opts) returns sound file for array of text", function(done) {
        this.timeout(5*1000);
        (async function() { try {
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
                volume: 'test',
                chapter: 'voice',
            };
            var result = await raveena.speak(text, opts);
            should(result).properties(['file','hits','misses','signature','cached']);
            var storePath = raveena.soundStore.storePath;
            var files = result.signature.files.map(f => path.join(storePath, f));
            should(files.length).equal(4);
            should(fs.statSync(files[0]).size).greaterThan(1000); // Tomatoes are
            should(fs.statSync(files[1]).size).greaterThan(1000); // red.
            should(fs.statSync(files[2]).size).greaterThan(1000); // Tomatoes are red.
            should(fs.statSync(files[3]).size).greaterThan(1000); // Broccoli is green.
            should(fs.statSync(result.file).size).greaterThan(5000);
            done();
        } catch(e) {done(e);} })();
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
        var raveena = Voice.createVoice({
            language: "en-IN",
            languageUnknown: "pli",
        });
        var amy = Voice.createVoice({
            language: "en-GB",
            languageUnknown: "pli",
        });
        should(raveena.services.navigate.languageUnknown).equal('pli');
        should(amy.services.navigate.languageUnknown).equal('pli');

        should(raveena.services.recite.wordSSML(`Ubbhaṭaka`))
        .equal(`<break time="0.001s"/><phoneme alphabet="ipa" ph="ubbʰɐtɐka">`+
            `Ubbhaṭaka</phoneme><break time="0.001s"/>`);
        should(amy.services.recite.wordSSML(`Ubbhaṭaka`))
        .equal(`<break time="0.001s"/><phoneme alphabet="ipa" ph="ubbʰɐtɐka">`+
            `Ubbhaṭaka</phoneme><break time="0.001s"/>`);

        should(raveena.services.recite.wordSSML(`don't`))
        .equal(`don't`);
        should(amy.services.recite.wordSSML(`don't`))
        .equal(`don't`);
        should(raveena.services.recite.wordSSML(`don${Words.U_APOSTROPHE}t`))
        .equal(`don${Words.U_APOSTROPHE}t`);
        should(amy.services.recite.wordSSML(`don${Words.U_APOSTROPHE}t`))
        .equal(`don${Words.U_APOSTROPHE}t`);

        should(raveena.services.recite.wordSSML(`ariyasaccan’ti`))
        .equal(`<phoneme alphabet="ipa" ph="ɐˈɺɪjɐsɐccɐn’θɪ">`+
            `ariyasaccan’ti</phoneme><break time="0.001s"/>`);
        should(amy.services.recite.wordSSML(`ariyasaccan’ti`))
        .equal(`<phoneme alphabet="ipa" ph="ɐɺɪjɐsɐccɐn’tɪ">`+
            `ariyasaccan’ti</phoneme><break time="0.001s"/>`);

        should(raveena.services.navigate.wordSSML('sati'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250\u03b8\u026a">sati</phoneme>${BREAK}`);
        should(raveena.services.navigate.wordSSML('Saṅgha'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250\u014bgʰa">Saṅgha</phoneme>${BREAK}`);

        should(amy.services.navigate.wordSSML('sati'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250t\u026a">sati</phoneme>${BREAK}`);
        should(amy.services.navigate.wordSSML('Saṅgha'))
        .equal(`<phoneme alphabet="ipa" ph="s\u0250\u014bgʰa">Saṅgha</phoneme>${BREAK}`);

    });
    it("placeholder words are expanded with voice ipa", function() {
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
            phoneme(`s\u0250\u03b8\u026a`,`sati`),
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
            `<phoneme alphabet="ipa" ph="\u03b8\u0250\u014b">Taṃ</phoneme>${BREAK} ` +
            `<phoneme alphabet="ipa" ph="k\u026assa">kissa</phoneme>${BREAK} ` +
            `<phoneme alphabet="ipa" ph="he\u03b8u">hetu</phoneme>${BREAK}?`,
        ]);
    });
    it("speak(text) speaks Pali", function(done) {
        (async function() { try {
            var raveena = Voice.createVoice({
                name: "raveena",
                languageUnknown: "pli",
            });
            var text = `Idha panudāyi, ekacco puggalo ‘upadhi dukkhassa mūlan’ti—`;
            var result = await raveena.speak(text, {usage:'recite'});
            should(result).properties(['file','hits','misses','signature','cached']);
            should(result.signature.text).match(/ph="ekɐcco"/);
            should(result.signature.text).match(/ph="dʊk.kʰɐssa"/);

            done();
        } catch(e) {done(e);} })();
    });
    it("speak(text) can handle lengthy Pali", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var aditi = Voice.createVoice({
                name: "aditi",
                usage: 'recite',
                languageUnknown: "pli",
                language: 'hi-IN',
                stripNumbers: true,
                stripQuotes: true,
            });
            should(aditi.maxSegment).equal(400);
            var text = `Cuddasa kho panimāni yonipamukhasatasahassāni saṭṭhi ca satāni cha ca satāni pañca ca kammuno satāni pañca ca kammāni, tīṇi ca kammāni, kamme ca aḍḍhakamme ca dvaṭṭhipaṭipadā, dvaṭṭhantarakappā, chaḷābhijātiyo, aṭṭha purisabhūmiyo, ekūnapaññāsa ājīvakasate, ekūnapaññāsa paribbājakasate, ekūnapaññāsa nāgavāsasate, vīse indriyasate, tiṃse nirayasate, chattiṃsarajodhātuyo, satta saññīgabbhā, satta asaññīgabbhā, satta nigaṇṭhigabbhā, satta devā, satta mānusā, satta pesācā, satta sarā, satta pavuṭā, satta papātā, satta ca papātasatāni, satta supinā, satta supinasatāni, cullāsīti mahākappino satasahassāni, yāni bāle ca paṇḍite ca sandhāvitvā saṃsaritvā dukkhassantaṃ karissanti."`;
            var result = await aditi.speak(text, {usage:'recite'});
            should(result.signature.api).equal('ffmegConcat');
            should(result.signature.files.length).equal(26);

            done();
        } catch(e) {done(e);} })();
    });
    it("Amy phonemes", function() {
        var amy = Voice.createVoice({
            language: "en-GB",
            languageUnknown: "pli",
        });
        should(amy.name).equal("Amy");
        var recite = amy.services.recite;
        should(recite.wordSSML(`bow`)).equal(phoneme("baʊ","bow"));
    });
    it("Raveena phonemes", function() {
    return;  // TODO
        var raveena = Voice.createVoice({
            language: "en-IN",
            languageUnknown: "pli",
        });
        should(raveena.name).equal("Raveena");
        var recite = raveena.services.recite;
        should(recite.wordSSML(`bow`)).equal(phoneme("baʊ","bow"));
        should(recite.wordSSML(`Nāmañca`)).equal(phoneme("nɑməɲcə","Nāmañca"));
        should(recite.wordSSML(`anottappañca`)).match(/"anoθθəppəɲcə"/);
        should(recite.wordSSML(`Atthi`)).match(/"aθθhɪ"/);
        should(recite.wordSSML(`hoti`)).match(/"hoθɪ"/);
    });
    it("Aditi phonemes", function() {
        var aditi = Voice.createVoice({
            name: "aditi",
            languageUnknown: "pli",
        });
        should(aditi.name).equal("Aditi");
        var recite = aditi.services.recite;
        should(recite.wordSSML(`vasala`)).equal(phoneme("v\\ə sə la","vasala"));
        should(recite.wordSSML(`bow`)).equal(phoneme("baʊ","bow"));
        should(recite.wordSSML(`Nāmañca`)).equal(phoneme("nɑː məɲ cə","Nāmañca"));
        should(recite.wordSSML(`anottappañca`)).match(/"ə not̪ t̪əp pəɲ cə"/);
        should(recite.wordSSML(`Atthi`)).match(/"ət̪.t̪ʰɪ"/);
        should(recite.wordSSML(`hoti`)).match(/"hot̪ɪ"/);
    });
    it("speak(text) can ignore numbers", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var raveena = Voice.createVoice({
                name: "raveena",
                stripNumbers: true,
                languageUnknown: "pli",
            });
            var text = `Bhikkhu 123`;
            var result = await raveena.speak(text, {usage:'recite'});
            should(result.signature.api).equal('aws-polly');
            should(result.signature.text).not.match(/123/);

            var text = `Bhikkhu (123)`;
            var result = await raveena.speak(text, {usage:'recite'});
            should(result.signature.api).equal('aws-polly');
            should(result.signature.text).not.match(/\(.*\)/);

            done();
        } catch(e) {done(e);} })();
    });
    it("speak(text) can ignore quotes", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var raveena = Voice.createVoice({
                name: "raveena",
                stripQuotes: true,
                languageUnknown: "pli",
            });
            var text = `“'‘Bhikkhu’'”`;
            var result = await raveena.speak(text, {usage:'recite'});
            should(result.signature.api).equal('aws-polly');
            should(result.signature.text).not.match(/[“'‘’'”]/);

            done();
        } catch(e) {done(e);} })();
    });

})
