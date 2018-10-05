(typeof describe === 'function') && describe("sutta-factory", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        SectionParser,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        SuttaCentralApi,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("loadSutta(id, opts) returns a Sutta from SuttaCentral api", function(done) {
        (async function() { try {
            var suttaCentralApi = new SuttaCentralApi();
            var factory = await new SuttaFactory({
                suttaCentralApi,
            }).initialize();
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
    it("loadSutta(id, opts) loads an3.163-182", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('an3.163-182');
            should(sutta.sections[0].segments[0].en).equal('Numbered Discourses 3');
            should(sutta.sections[0].segments[1].en).equal(`17. Courses of Deeds`);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(id, opts) loads dn7", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('dn7');
            should(sutta.sections[0].segments[0].en).equal('Long Discourses 7');
            should(sutta.sections[0].segments[1].en).equal(`With Jāliya`);
            done();
        } catch(e) { done(e); } })();
    });
    it("loadSutta(id, opts) loads sn22.1", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('sn22.1');
            should(sutta.sections[0].segments[0].en).equal('Linked Discourses 22');
            should(sutta.sections[0].segments[1].en)
                .equal(`1. Nakula${Words.U_RSQUOTE}s Father`);
            done();
        } catch(e) { done(e); } })();
    });
    it("supportedSuttas() returns hierarchy of supported suttas", function(done) { 
        (async function() { try {
            var factory = new SuttaFactory();
            var suttas = await factory.supportedSuttas();
            Object.keys(suttas).forEach(coll => {
                console.log(`supported Suttas ${coll}`, suttas[coll].length);
            });
            done();
        } catch(e) { done(e); } })();
    });

});

