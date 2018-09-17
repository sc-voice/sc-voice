(typeof describe === 'function') && describe("mn1", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        Voice,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("TESTTESTexpandSutta(sutta) expands mn1", function(done) {
        this.timeout(10*1000); // takes 2 seconds if cache is empty
        /*
         * This is real-world system test that exercises and requires:
         * 1) AWS Polly
         * 2) Internet connection
         * 3) An actual section of MN1
         * 4) The local sound cache
         * 5) >5MB of local disk for sound storage
         */
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');
            var expandedSutta = new SuttaFactory().expandSutta(sutta);
            var voice = Voice.createVoice({
                name: "amy",
                languageUnknown: "pli",
            });
            var lines = Sutta.textOfSegments(expandedSutta.sections[2].segments);
            var text = `${lines.join('\n')}\n`;
            var result = await voice.speak(text, {
                cache: true, // false: use TTS web service for every request
                usage: "recite",
            });
            console.log("mn1 sound guid:", result.signature.guid);
            should(result.signature.files.length).equal(166);

            done();
        } catch(e) { done(e); } })();
    });
});

