(typeof describe === 'function') && describe("thag1.1", function() {
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

    it("TESTTESTparseSutta(sutta) parses thag1.1", function(done) {
    //done();return; //TODO
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('thag1.1');
            var sutta2 = new SuttaFactory().parseSutta(sutta);
            should(sutta2).instanceOf(Sutta);
            var sections = sutta2.sections;
            should(sections.length).equal(1);

            //sections[0].segments.map(seg => console.log(seg.scid, seg.pli));

            done();
        } catch(e) { done(e); } })();
    });
});

