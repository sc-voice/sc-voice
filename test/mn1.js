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

    it("parseSutta(sutta) parses mn1", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');
            var sutta2 = new SuttaFactory().parseSutta(sutta);
            should(sutta2).instanceOf(Sutta);
            var sections = sutta2.sections;
            should(sections.length).equal(10);
            should.deepEqual(sections.map(section => section.expandable), [
                false, false, true, true, true, true, true, true, true, true,
            ]);
            should.deepEqual(sections.map(section => section.segments.length), [
                2, 10, 98, 31, 31, 31, 31, 31, 31, 38,
            ]);
            var sectSegs = sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
            should.deepEqual(sectSegs, sutta.segments);

            done();
        } catch(e) { done(e); } })();
    });
    it("expandSutta(sutta) expands mn1", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');
            var sutta2 = new SuttaFactory().expandSutta(sutta);
            should(sutta2).instanceOf(Sutta);
            var sections = sutta2.sections;
            should(sections.length).equal(10);
            should.deepEqual(sections.map(section => section.expandable), [
                false, false, false, false, false, false, false, false, false, false,
            ]);
            should.deepEqual(sections.map(section => section.segments.length), [
                2, 10, 98, 97, 97, 97, 97, 97, 97, 148,
            ]);
            var sectSegs = sections.reduce((acc,section) => {
                section.segments.forEach(seg => acc.push(seg));
                return acc;
            }, []);
            should.deepEqual(sectSegs, sutta2.segments);

            var jsonPath = path.join(__dirname, '../local/mn1-expanded.json');
            fs.writeFileSync(jsonPath, JSON.stringify(sutta2, null, 2));

            done();
        } catch(e) { done(e); } })();
    });
    it("expandSutta(sutta) expands mn1", function(done) {
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

