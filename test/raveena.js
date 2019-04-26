(typeof describe === 'function') && describe("raveena", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
        Voice,
    } = require("../index");
    const RAVEENA_OPTS = {
        name: 'Raveena',
        usage: 'recite',
    };
    const syllableVowels = undefined;
    const syllabifyLength = undefined;

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

    it("createVoice() creates Raveena", function() {
        var raveena = Voice.createVoice('raveena');
        should(raveena.name).equal('Raveena');
        should(raveena.language).equal('en-IN');
        should(raveena.languageUnknown).equal('en-IN');
        should(raveena.maxSegment).equal(undefined);
        should(raveena.fullStopComma).equal(undefined);
        should(raveena.syllableVowels).equal(syllableVowels);
        should(raveena.syllabifyLength).equal(syllabifyLength);
        should(!!raveena.customWords).equal(true);

        var raveena = Voice.createVoice(RAVEENA_OPTS);
        should(raveena.name).equal('Raveena');
        should(raveena.language).equal('en-IN');
        should(raveena.languageUnknown).equal('en-IN');
        should(raveena.maxSegment).equal(undefined);
        should(raveena.fullStopComma).equal(undefined);
        should(raveena.syllableVowels).equal(syllableVowels);
        should(raveena.syllabifyLength).equal(syllabifyLength);

        var recite = raveena.services['recite'];
        should(recite.fullStopComma).equal(undefined);
        should(recite.maxSegment).equal(1000);
        should(raveena.syllableVowels).equal(syllableVowels);
        should(raveena.syllabifyLength).equal(syllabifyLength);
    });
    it("segmentSSML(text) returns SSML", function() {
        var raveena = Voice.createVoice(RAVEENA_OPTS);
        var recite = raveena.services['recite'];

        // syllabify spaces
        testPhoneme(recite, 'dɛtat͡ʃd', 'detached');
    });
})
