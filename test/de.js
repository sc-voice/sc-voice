(typeof describe === 'function') && describe("de", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const {
        ScApi,
    } = require('suttacentral-api');
    const {
        AbstractTTS,
        Polly,
        SCAudio,
        SoundStore,
        SuttaFactory,
        Voice,
        VoiceFactory,
        Words,
    } = require('../index');
    const ELLIPSIS = "\u2026";
    const ELLIPSIS_BREAK = '<break time="1.000s"/>';
    const BREAK = `<break time="0.001s"/>`;
    const tmp = require('tmp');
    this.timeout(10*1000);

    function phoneme(ph,word) {
        var ph = `<phoneme alphabet="ipa" ph="${ph}">${word}</phoneme>${BREAK}`;
        return ph;
    }

    it("loadSutta() loads sn12.3/de/geiger", async()=>{
        var scApi = await new ScApi().initialize();
        var factory = await new SuttaFactory({
            scApi,
        }).initialize();
        var sutta = await factory.loadSutta({
            scid: 'sn12.3',
            language: 'de',
            translator: 'geiger',
        });
        var sections = sutta.sections;
        should.deepEqual(sections[0].segments[1], {
            scid: 'sn12.3:0.2',
            de: 'Der Weg',
            pli: 'Paṭipadāsutta',
        });
    });
    it("createVoice(voiceName) returns a default voice", function() {
        var voice = Voice.createVoice('vicki');
        should(voice).instanceOf(Voice);
        should(voice.locale).equal("de-DE");
        should(voice.name).equal("Vicki");
        should(voice.usage).equal("recite");
        should(voice.localeIPA).equal('pli');
        should(voice.stripNumbers).equal(false);
        should(voice.stripQuotes).equal(true);
        should(voice.trimSegmentSuffix).equal(' \u2013 *');
        should(voice.altTts).equal(undefined);
    });
    it("wordSSML(word) Vicki SSML text for word", function() {
        var matthew = Voice.createVoice('matthew').services.recite;
        var ssml = matthew.wordSSML('place');
        should(ssml).equal('place');

        var vicki = Voice.createVoice('vicki').services.recite;
        var ssml = vicki.wordSSML('Ort', 'de');
        should(ssml).equal('Ort');
        var ssml = vicki.wordSSML('Saṃyutta', 'de');
        should(ssml).match(/ph="saŋjut.ta"/);
    });
    it("wordInfo(word) returns SSML text for word", function() {
        var matthew = Voice.createVoice('matthew').services.recite;
        should.deepEqual(matthew.wordInfo('place'), {language: 'en'} );

        var vicki = Voice.createVoice('vicki').services.recite;
        should.deepEqual(vicki.wordInfo('Ort'), {language: 'de'} );
    });
    it("speak([text],opts) returns sound file for array of text", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var voice = Voice.createVoice("de-DE");
            var text = [
                "Ort der Begebenheit: Sāvatthī.",
            ];
            var cache = true;
            var opts = {
                cache,
                usage: "recite",
                volume: 'test',
                chapter: 'voice',
            };
            var result = await voice.speak(text, opts);
            should(result).properties([
                'file','hits','misses','signature','cached']);
            should(fs.statSync(result.file).size)
                .above(15000).below(21000);
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
         * a dialect, it overrides the default locale IPA lexicon.
         *
         * This subtle change manifests via the wordSSML() function of
         * abstractTTS.
         */
        var raveena = Voice.createVoice({
            locale: "en-IN",
            localeIPA: "pli",
        });
        var amy = Voice.createVoice({
            locale: "en-GB",
            localeIPA: "pli",
        });
        should(raveena.services.navigate.localeIPA).equal('pli');
        should(amy.services.navigate.localeIPA).equal('pli');

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
            localeIPA: "en-IN",
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
        tts.localeIPA = "pli";
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
                localeIPA: "pli",
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
        (async function() { try {
            var aditi = Voice.createVoice({
                name: "aditi",
                usage: 'recite',
                localeIPA: "pli",
                locale: 'hi-IN',
                stripNumbers: true,
                stripQuotes: true,
            });
            should(aditi.maxSegment).equal(400);
            var text = `Cuddasa kho panimāni yonipamukhasatasahassāni saṭṭhi ca satāni cha ca satāni pañca ca kammuno satāni pañca ca kammāni, tīṇi ca kammāni, kamme ca aḍḍhakamme ca dvaṭṭhipaṭipadā, dvaṭṭhantarakappā, chaḷābhijātiyo, aṭṭha purisabhūmiyo, ekūnapaññāsa ājīvakasate, ekūnapaññāsa paribbājakasate, ekūnapaññāsa nāgavāsasate, vīse indriyasate, tiṃse nirayasate, chattiṃsarajodhātuyo, satta saññīgabbhā, satta asaññīgabbhā, satta nigaṇṭhigabbhā, satta devā, satta mānusā, satta pesācā, satta sarā, satta pavuṭā, satta papātā, satta ca papātasatāni, satta supinā, satta supinasatāni, cullāsīti mahākappino satasahassāni, yāni bāle ca paṇḍite ca sandhāvitvā saṃsaritvā dukkhassantaṃ karissanti."`;
            var result = await aditi.speak(text, {usage:'recite'});
            should(result.signature.api).equal('ffmegConcat');
            should(result.signature.files.length).equal(30);

            done();
        } catch(e) {done(e);} })();
    });
    it("Amy phonemes", function() {
        var amy = Voice.createVoice({
            locale: "en-GB",
            localeIPA: "pli",
        });
        should(amy.name).equal("Amy");
        var recite = amy.services.recite;
        should(recite.wordSSML(`bow`)).equal(phoneme("baʊ","bow"));
    });
    it("Raveena phonemes", function() {
    return;  // TODO
        var raveena = Voice.createVoice({
            locale: "en-IN",
            localeIPA: "pli",
        });
        should(raveena.name).equal("Raveena");
        var recite = raveena.services.recite;
        should(recite.wordSSML(`bow`)).equal(phoneme("baʊ","bow"));
        should(recite.wordSSML(`Nāmañca`)).equal(phoneme("nɑməɲcə","Nāmañca"));
        should(recite.wordSSML(`anottappañca`)).match(/"anoθθəppəɲcə"/);
        should(recite.wordSSML(`Atthi`)).match(/"aθθhɪ"/);
        should(recite.wordSSML(`hoti`)).match(/"hoθɪ"/);
    });
    it("Marlene speaks", function() {
        var marlene = Voice.createVoice({
            name: "Marlene",
            localeIPA: "pli",
        });
        should(marlene.name).equal("Marlene");
        should(marlene.locale).equal('de-DE');
        var recite = marlene.services.recite;
        should(recite.wordSSML(`Kaccāna`)).equal(phoneme("kat͡ʃt͡ʃa:na","Kaccāna"));
    });
    it("speak(text) can ignore numbers", function(done) {
        (async function() { try {
            var raveena = Voice.createVoice({
                name: "raveena",
                stripNumbers: true,
                localeIPA: "pli",
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
        (async function() { try {
            var raveena = Voice.createVoice({
                name: "raveena",
                stripQuotes: true,
                localeIPA: "pli",
            });
            var text = `“'‘Bhikkhu’'”`;
            var result = await raveena.speak(text, {usage:'recite'});
            should(result.signature.api).equal('aws-polly');
            should(result.signature.text).not.match(/[“'‘'”]/);

            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment(opts) speaks aws-polly", function(done) {
        (async function() { try {
            var aditi = Voice.createVoice({
                name: 'aditi',
            });
            var sutta_uid = 'sn1.9';
            var language = 'pli';
            var translator = 'sujato';
            var usage = 'recite';
            var segment = {
                scid: 'sn1.9:1.1',
                pli: 'purple squirrels',
            }
            var resSpeak = await aditi.speakSegment({
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            });
            should(resSpeak.signature).properties({
                api: 'aws-polly',
                guid: '23aba87c0acf41410b14e1de1658a7ae',
            });
            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment(opts) human-tts requires SCAudio", function(done) {
        (async function() { try {
            var sutta_uid = 'sn1.9999'; // not a sutta
            var language = 'pli';
            var translator = 'sujato';
            var usage = 'recite';
            var segment = {
                scid: `${sutta_uid}:1.1`, 
                pli: 'purple squirrels',
            }
            var args = {
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            };

            // scAudio is required
            var voice = Voice.createVoice({
                name: 'sujato_pli',
            });
            var eCaught = null;
            var resSpeak = await voice.speakSegment(args).catch(e => (eCaught=e));
            should(eCaught).instanceOf(Error);
            should(eCaught.message).match(/scAudio is required/);
            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment(opts) human-tts uses altTts", function(done) {
        (async function() { try {
            var sutta_uid = 'sn1.9999'; // not a sutta
            var language = 'pli';
            var translator = 'sujato';
            var usage = 'recite';
            var segment = { // fake segment
                scid: `${sutta_uid}:1.1`, 
                pli: 'purple squirrels',
            }
            var args = {
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            };

            // sutta has no human audio
            var scAudio = new SCAudio();
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                scAudio,
            });
            should(voice.altTts.voice).equal('Aditi');
            logger.warn('EXPECTED WARNING BEGIN');
            var resSpeak = await voice.speakSegment(args);
            logger.warn('EXPECTED WARNING END');
            should(resSpeak).properties([
                'file', 'signature',
            ]);
            should(resSpeak.signature).properties({
                api: 'aws-polly',
                voice: 'Aditi',
                guid: '23aba87c0acf41410b14e1de1658a7ae',
            });
            should(resSpeak.file).match(/sn_pli_mahasangiti_aditi.*/);
            should(fs.existsSync(resSpeak.file)).equal(true);

            done();
        } catch(e) {done(e);} })();
    });
    it("speakSegment(opts) downloads human-tts", function(done) {
        (async function() { try {
            var sutta_uid = 'sn1.9';
            var storePath = tmp.tmpNameSync();
            var soundStore = new SoundStore({
                storePath,
            });
            var language = 'pli';
            var translator = 'sujato';
            var usage = 'recite';
            var segment = {
                scid: `${sutta_uid}:1.1`, 
                pli: 'purple squirrels',
            }
            var args = {
                sutta_uid,
                segment,
                language,
                translator,
                usage,
            };
            var scAudio = new SCAudio();
            var voice = Voice.createVoice({
                name: 'sujato_pli',
                scAudio,
                soundStore,
            });

            // Do not download if not present
            args.downloadAudio = false;
            var resSpeak = await voice.speakSegment(args);
            should(resSpeak).properties([ 'file', 'signature', ]);
            should(resSpeak.signature).properties({
                api: 'aws-polly',
                voice: 'Aditi',
            });
            should(resSpeak.file).match(new RegExp(resSpeak.signature.guid));
            should(fs.existsSync(resSpeak.file)).equal(true);

            // Force download audio
            args.downloadAudio = true;
            var resSpeak = await voice.speakSegment(args);
            should(resSpeak).properties([ 'file', 'signature', ]);
            should(resSpeak.signature).properties({
                api: 'human-tts',
                reader: 'sujato_pli',
            });
            should(resSpeak.file).match(new RegExp(resSpeak.signature.guid));
            should(fs.existsSync(resSpeak.file)).equal(true);

            // Audio has been downloaded, so return it
            delete args.downloadAudio; // default is download
            var resSpeak = await voice.speakSegment(args);
            should(resSpeak).properties([ 'file', 'signature', ]);
            should(resSpeak.signature).properties({
                api: 'human-tts',
                reader: 'sujato_pli',
            });
            should(resSpeak.file).match(new RegExp(resSpeak.signature.guid));
            should(fs.existsSync(resSpeak.file)).equal(true);

            done();
        } catch(e) {done(e);} })();
    });
    it("voiceOfName(name) returns voice of name", function() {
        should(Voice.voiceOfName("amy")).properties({name:"Amy"});
        should(Voice.voiceOfName("Amy")).properties({name:"Amy"});
        should(Voice.voiceOfName("0")).properties({name:"Amy"});
        should(Voice.voiceOfName(0)).properties({name:"Amy"});
        should(Voice.voiceOfName(1)).properties({name:"Brian"});
        should(Voice.voiceOfName("raveena")).properties({name:"Raveena"});
        should(Voice.voiceOfName(1)).properties({name:"Brian"});
        should(Voice.voiceOfName("vicki")).properties({name:"Vicki"});
        should(Voice.voiceOfName("sujato_pli")).properties({name:"sujato_pli"});
    })
})
