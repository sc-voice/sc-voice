(typeof describe === 'function') && describe("aditi", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Polly,
    } = require("../index");


    // Service results are normally cached. To bypass the cache, change
    // the following value to false. You can clear the cache by
    // deleting local/sounds
    var cache = true; 
    const BREAK='<break time="0.001s"/>';

    function phoneme(ph, text) {
        return `<phoneme alphabet="ipa" ph="${ph}">${text}</phoneme>`+
            `${BREAK}`;
    }

    it("segmentSSML(text) returns SSML", function() {
        var aditi = new Polly({
            name: 'Aditi',
            languageUnknown: 'pli',
            stripQuotes: true,
        });

        var ssml = aditi.segmentSSML('saṁghe');
        console.log(ssml);
        should.deepEqual(ssml, [ phoneme('sɐṁgʰe','saṁghe') ]);
    });
})
