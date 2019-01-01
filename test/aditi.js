(typeof describe === 'function') && describe("aditi", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
        Voice,
    } = require("../index");


    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 
    const BREAK='<break time="0.001s"/>';

    function phoneme(ph, text) {
        return new RegExp(`<phoneme alphabet="ipa" ph="${ph}">${text}</phoneme>`);
    }

    function testPhoneme(recite, ph, text) {
        var ssml = recite.segmentSSML(text)[0];
        should(ssml).match((phoneme(ph,text) ));
    }

    it("segmentSSML(text) returns SSML", function() {
        var aditi = Voice.createVoice({
            name: 'Aditi',
            usage: 'recite',
            language: 'hi-IN',
            languageUnknown: 'pli',
            stripNumbers: true,
            stripQuotes: true,
        });
        should(aditi.name).equal('Aditi');
        should(aditi.language).equal('hi-IN');
        should(aditi.fullStopComma).equal(true);
        var recite = aditi.services['recite'];
        should(recite.fullStopComma).equal(true);

        // stops
        testPhoneme(recite, 'bʰɪk.kʰʊsəŋgʰo','bhikkhusaṅgho');
        testPhoneme(recite, 'səŋgʰe','saṃghe');
        testPhoneme(recite, 'pəɲɲə','Pañña');
        testPhoneme(recite, 'səŋkʰɑːɾə','saṅkhāra');
        testPhoneme(recite, 'bɾɑːhməɳəŋ','brāhmaṇaṃ');
        testPhoneme(recite, 'gɪʝʄhɑku:ʈe','gijjhakūṭe');
        testPhoneme(recite, 'cɪt̪t̪əssə','cittassa');
        testPhoneme(recite, 'chənnoʋɑːd̪ə','Channovāda');
        testPhoneme(recite, 'phəggʊɳə','Phagguṇa');
        testPhoneme(recite, 'sət̪ɪ','sati'); // memory;mindfulness
        testPhoneme(recite, 'səʈ.ʈʰɪ','saṭṭhi'); // sixty
        testPhoneme(recite, 'sət̪.t̪ʰɪ','satthi'); // the thigh
        testPhoneme(recite, 'd̪əɳɖəkə','daṇḍaka');
        testPhoneme(recite, 'd̪ʱəmmə','Dhamma');
        testPhoneme(recite, 'd̪ʱəmə', 'Dhama'); // blowing
        testPhoneme(recite, 'siɾɪʋəɖɖhə', 'sirivaḍḍha'); // blowing
        testPhoneme(recite, 'bɑːləkə', 'bālaka'); 
        testPhoneme(recite, 'bʰəl.lɪkə', 'bhallika'); 
        testPhoneme(recite, 'd̪eʋəd̪əhə', 'devadaha'); 
        testPhoneme(recite, 'jəsə', 'yasa'); 
        testPhoneme(recite, 'ʊpəkɑːʟ̈ə', 'upakāḷa'); 
        testPhoneme(recite, 'nɑːʟ̈ənd̪ɑː', 'nāḷandā'); 
        testPhoneme(recite, 'nɑːlənd̪ɑː', 'nālandā'); 
        testPhoneme(recite, 'nəʟ̈həŋ', 'naḷhaṃ'); 
        testPhoneme(recite, 'əcchəɾɪjə\'abbʰʊt̪əsʊt̪t̪ə', 'acchariyaabbhutasutta'); 

        // vowels
        testPhoneme(recite, 'eɪso','eso');

        // punctuation
        var ssml = recite.segmentSSML('dve, dve');
        should(ssml.length).equal(2);
        var ssml = recite.segmentSSML('2. Dve');
        should(ssml.length).equal(1);
    });
})
