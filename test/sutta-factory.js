(typeof describe === 'function') && describe("sutta-factory", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("loadSutta(id, opts) returns a Sutta", function(done) {
        (async function() { try {
            var factory = new SuttaFactory();
            var sutta = await factory.loadSutta('mn1');
            var end = 21;
            var header = sutta.excerpt({
                start: 0,
                end: 2,
                prop: 'pli',
            });
            var excerpt = sutta.excerpt({
                start: 0,
                end,
                prop: 'en',
            });
            var i = 0;
            should(excerpt[i++]).equal('Middle Discourses 1\n'); // autoterminate segment
            should(excerpt[i++]).equal('The Root of All Things\n'); // end group
            should(excerpt[i++]).equal('So I have heard.');
            should(excerpt[end-2]).equal('Why is that?');
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections[0]).instanceOf(Section);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(id, opts) returns a Sutta", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');
            var end = 21;
            var header = sutta.excerpt({
                start: 0,
                end: 2,
                prop: 'pli',
            });
            var excerpt = sutta.excerpt({
                start: 0,
                end,
                prop: 'en',
            });
            var i = 0;
            should(excerpt[i++]).equal('Middle Discourses 1\n'); // autoterminate segment
            should(excerpt[i++]).equal('The Root of All Things\n'); // end group
            should(excerpt[i++]).equal('So I have heard.');
            should(excerpt[end-2]).equal('Why is that?');
            should(sutta.sections).instanceOf(Array);
            should(sutta.sections[0]).instanceOf(Section);
            done();
        } catch(e) { done(e); } })();
    });

});

