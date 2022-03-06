(typeof describe === 'function') && describe("aditi", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { TtsPolly, SayAgain } = require('say-again');
    const { logger, LogInstance } = require('log-instance');
    const {
        Polly,
        Voice,
    } = require("../index");
    const syllabifyLength = 5;
    const ADITI_OPTS = {
        name: 'Aditi',
        usage: 'recite',
        locale: 'hi-IN',
        localeIPA: 'pli',
        stripNumbers: true,
        stripQuotes: true,
        //syllabifyLength,
    };
    this.timeout(10*1000);

    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 
    const BREAK='<break time="0.001s"/>';

    function phoneme(ph, text) {
        return new RegExp(
            `<phoneme alphabet="ipa" ph="${ph}">${text}</phoneme>`);
    }

    function testPhoneme(recite, ph, text) {
        var ssml = recite.segmentSSML(text)[0];
        should(ssml.indexOf(ph)).above(-1, 
            `Phoneme not found.\nexpected:\t\t\t  "${ph}"\nactual:${ssml}`);
    }

    it("createVoice() creates Aditi", function() {
        var aditi = Voice.createVoice('aditi');
        should(aditi.name).equal('Aditi');
        should(aditi.locale).equal('hi-IN');
        should(aditi.localeIPA).equal('pli');
        should(aditi.maxSegment).equal(400);
        should(aditi.fullStopComma).equal(true);
        should(aditi.syllableVowels).equal('aeiouāīū');
        should(aditi.syllabifyLength).equal(syllabifyLength);
        should(aditi.sayAgain).instanceOf(SayAgain);

        var recite = aditi.services['recite'];
        should(recite.fullStopComma).equal(true);
        should(recite.maxSegment).equal(400);
        should(recite.syllableVowels).equal('aeiouāīū');
        should(recite.syllabifyLength).equal(syllabifyLength);
        
        var aditi = Voice.createVoice(Object.assign({}, ADITI_OPTS, {
            syllableVowels: 'aeiou',
        }));
        should(aditi.syllableVowels).equal('aeiou');
        var recite = aditi.services['recite'];
        should(recite.syllableVowels).equal('aeiou');
    });
    it("segmentSSML(text) returns SSML", function() {
        var aditi = Voice.createVoice(ADITI_OPTS);
        var recite = aditi.services['recite'];

        testPhoneme(recite, 'seʈ.ʈʰo', 'seṭṭho');

        // apostrophe
        testPhoneme(recite, 'm’ɪɖʱe kəc ce', 'm’idhekacce');

        testPhoneme(recite, 'ə sesəŋ"', 'asesaṃ;');

        var ssml = recite.segmentSSML('disā, disā');
        should(ssml.length).equal(2);
        should(ssml[0].split('phoneme').length).equal(3);

        testPhoneme(recite, 'pɑ’ɽe', 'pare');

        // syllabify spaces
        testPhoneme(recite, 'd̪ək kʰɪn ej jəŋ', 'dakkhiṇeyyaṃ');
        testPhoneme(recite, 'əc chə ɾɪ jə əb bʰʊ t̪ə sʊt̪ t̪ə', 
            'acchariyaabbhutasutta'); 
        testPhoneme(recite, "bʰə gə v\\ən 't̪əŋ je v\\ə", 'bhagavantaṃyeva'); 
        testPhoneme(recite, `səb bə 'səŋ je v\\ə`, 'sabbasaṃyeva'); 
        testPhoneme(recite, `ve j jɑː kə ɾə ɳəŋ`, 'veyyākaraṇaṃ'); 
        testPhoneme(recite, `pəc cə v\\ek kʰe j jə`, 'paccavekkheyya'); 
        testPhoneme(recite, `v\\e sɑː lɪ jəŋ`, 'vesāliyaṃ'); 
        testPhoneme(recite, `pə ʈɪ 'səŋ ʋẽ d̪e t̪ɪi`, 'paṭisaṃvedetī'); 
        testPhoneme(recite, `pə ɾɪ sʊɖ ɖʱəŋ`, `parisuddhaṃ`);

        // stops
        testPhoneme(recite, 'bʰɪk kʰʊ səŋ gʰo','bhikkhusaṅgho');
        testPhoneme(recite, 'səŋ gʰe','saṃghe');
        testPhoneme(recite, 'pəɲ ɲə','Pañña');
        testPhoneme(recite, 'səŋ kʰɑː ɾə','saṅkhāra');
        testPhoneme(recite, 'bɾɑːh mə ɳəŋ','brāhmaṇaṃ');
        testPhoneme(recite, 'gɪdʒ.dʒʱə ku: ʈe','gijjhakūṭe');
        testPhoneme(recite, 'cɪt̪ t̪əs sə','cittassa');
        testPhoneme(recite, 'chən no v\\ɑː d̪ə','Channovāda');
        testPhoneme(recite, 'phəg gʊ ɳə','Phagguṇa');
        testPhoneme(recite, 'sət̪ɪ','sati'); // memory;mindfulness
        testPhoneme(recite, 'səʈ ʈhɪ','saṭṭhi'); // sixty
        testPhoneme(recite, 'sət̪ t̪ʰɪ','satthi'); // the thigh
        testPhoneme(recite, 'd̪əɳ ɖə kə','daṇḍaka');
        testPhoneme(recite, 'ɖhəm mə','Dhamma');
        testPhoneme(recite, 'ɖhə mə', 'Dhama'); // blowing
        testPhoneme(recite, 'si ɾɪ v\\əɖ ɖhə', 'sirivaḍḍha'); // blowing
        testPhoneme(recite, 'bɑː lə kə', 'bālaka'); 
        testPhoneme(recite, 'bʰəl lɪ kə', 'bhallika'); 
        testPhoneme(recite, 'd̪e v\\ə d̪ə hə', 'devadaha'); 
        testPhoneme(recite, 'jəsə', 'yasa'); 
        testPhoneme(recite, 'ʊ pə kɑː ʟ̈ə', 'upakāḷa'); 
        testPhoneme(recite, 'nɑː ʟ̈ən d̪ɑː', 'nāḷandā'); 
        testPhoneme(recite, 'nɑː lən d̪ɑː', 'nālandā'); 
        testPhoneme(recite, 'nəʟ̈ həŋ', 'naḷhaṃ'); 

        // vowels
        testPhoneme(recite, 'ẽso','eso');
        testPhoneme(recite, "bʰɪk kʰʊ nɪŋ", 'bhikkhuniṃ');
        testPhoneme(recite, "ẽ ʟ̈ə kəŋ", 'eḷakaṃ');
        testPhoneme(recite, "ẽsə", 'esa');
        testPhoneme(recite, "pə sẽ nə d̪ɪs sə", 'pasenadissa');
        testPhoneme(recite, "v\\e sɑː ɾəʝ.ʝəp pət̪ t̪o", 'vesārajjappatto');

        // punctuation
        var ssml = recite.segmentSSML('dve, dve');
        should(ssml.length).equal(2);
        var ssml = recite.segmentSSML('2. Dve');
        should(ssml.length).equal(1);
    });
    it("segmentSSML(text) doesn't orphan punctuation", function() {
        var aditi = Voice.createVoice(ADITI_OPTS);
        var recite = aditi.services['recite'];
        var text = [
            "Sace,",
            "bhikkhave,",
            "adhicittamanuyutto",
            "bhikkhu",
            "ekantaṃ",
            "samādhinimittaṃyeva",
            "manasi",
            "kareyya,",
            "ṭhānaṃ",
            "taṃ",
            "cittaṃ",
            "kosajjāya",
            "saṃvatteyya.",
        ].join(' ');
        var ssml = recite.segmentSSML(text);
        should.deepEqual(ssml.filter(s=>s==='.'), []);
    });
    it("tokensSSML(text) handles UTF8 punctuation", function() {
        var aditi = Voice.createVoice(ADITI_OPTS);
        var recite = aditi.services['recite'];
        var tokens = recite.tokenize("bbhantarā; kammantā—uṇṇāti: vā");
        should(tokens[1]).equal(';');
        should(tokens[3]).equal('\u2014');
        should(tokens[5]).equal(':');
    });
    it("tokensSSML(text) handles jj", function() {
        var aditi = Voice.createVoice(ADITI_OPTS);
        var recite = aditi.services['recite'];
        var ph = (a,b)=>`<phoneme alphabet="ipa" ph="${a}">${b}</phoneme>`;
        var brk = `<break time="0.001s"/>`;

        var tokens = recite.tokensSSML("satisambojjhaṅgaṃ");
        should.deepEqual(tokens, [
         `${ph("sə t̪ɪ səm 'bodʒ.dʒʱəŋ gəŋ", "satisambojjhaṅgaṃ")}${brk}`,
        ]);

        var tokens = recite.tokensSSML("saṃvijjamānā");
        should.deepEqual(tokens, [
         `${ph("səŋ v\\ɪʝ.ʝə mɑː nɑː", "saṃvijjamānā")}${brk}`,
        ]);
    });
    it("tokensSSML(text) handles custom words", function() {
        var aditi = Voice.createVoice(ADITI_OPTS);
        var recite = aditi.services['recite'];
        var ph = (a,b)=>`<phoneme alphabet="ipa" ph="${a}">${b}</phoneme>`;
        var brk = `<break time="0.001s"/>`;

        var tokens = recite.tokensSSML("nivesetabbā");
        should.deepEqual(tokens, [
         `${ph("'nɪ v\\e sẽ t̪əb bɑː", "nivesetabbā")}${brk}`,
        ]);
    });
    it("tokensSSML(text) handles ellipsis", done=>{
        (async function(){try{
            var aditi = Voice.createVoice(ADITI_OPTS);
            var res = await aditi.speak("… ");
            done();
        } catch(e) {done(e)}})();
    });
    it("tokensSSML(text) handles kaya-", done=>{
        (async function(){try{
            var aditi = Voice.createVoice(ADITI_OPTS);
            var res = await aditi.speak("kayavikkayā");
            should(res.signature.text).match(/"kə \'jə v\\ɪk kə jɑː"/);
            done();
        } catch(e) {done(e)}})();
    });
    it("tokensSSML(text) handles #", async()=>{
        var aditi = Voice.createVoice(ADITI_OPTS);
        var res = await aditi.speak("Ayaṁ eko dhammo bahukāro. #1 ");
        should(res.signature.text)
            .match(/<phoneme alphabet="ipa" ph="əjəŋ">Ayaṁ/);
    });
    it("Katame pañca?#", async()=>{
        var aditi = Voice.createVoice(ADITI_OPTS);
        var res = await aditi.speak('Katame pañca?');
        should(res.signature.text).match(/kə t̪ə me"/);
    });
})
