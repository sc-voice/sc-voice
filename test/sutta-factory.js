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
            should(sutta.sections[0].segments[1].en).equal(`1. Nakula${Words.U_RSQUOTE}s Father`);
            done();
        } catch(e) { done(e); } })();
    });
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

});

