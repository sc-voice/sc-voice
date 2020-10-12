

(typeof describe === 'function') && describe("section-parser", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        SectionParser,
        Sutta,
        SuttaFactory,
        SuttaStore,
        Words,
    } = require('../index');
    const { logger } = require('log-instance');
    this.timeout(10*1000);

    var segments = [{ // 0
        scid: 's:0.1',
        en: 'a1 a2 a3',
    },{ // 1
        scid: 's:1.1',
        en: 'b1 x1 b2',
    },{ // 2
        scid: 's:1.2',
        en: 'c1 x1 c2 x1 c3',
    },{ // 3 (mn1:4.2)
        scid: 's:2.1',
        en: `b1 y1 ${Words.U_ELLIPSIS}`,
    },{ // 4 (mn1:28-49.6)
        scid: 's:3.1',
        en: `y2a y2b ${Words.U_ELLIPSIS}`,
    },{ // 5 (mn1:28-49.1)
        scid: 's:4.1',
        en: `q1 y3 ${Words.U_ELLIPSIS}`,
    },{ // 5 (mn1:28-49.2)
        scid: 's:5.1',
        en: `y4 ${Words.U_ELLIPSIS}`,
    }];

    const MN1_VALUES = [
        'earth', 'water', 'fire', 'air', 'creatures',
        'gods', 'the Creator', 'Brahmā', 
        'the gods of streaming radiance', 
        'the gods replete with glory',
        'the gods of abundant fruit',
        'the Overlord',
        'the dimension of infinite space',
        'the dimension of infinite consciousness',
        'the dimension of nothingness',
        'the dimension of neither perception nor non-perception',
        'the seen', 'the heard', 'the thought', 'the known',
        'oneness', 'diversity', 'all', 'extinguishment',
    ];
    const MN2_VALUES = [
        'the eye',
        'the ear',
        'the nose',
        'the tongue',
        'the body',
        'the mind',
    ];

    const MN3_VALUES = [
        'greed and hate',
        'anger and hostility',
        'offensiveness and contempt',
        'envy and stinginess',
        'deceit and deviousness',
        'obstinacy and aggression',
        'conceit and arrogance',
        'vanity and negligence',
    ];

    const logLevel = false;
    const suttaStore = new SuttaStore({
        logLevel,
    });

    it("SectionParser(opts) creates a section parser", function() {
        // default
        var parser = new SectionParser();
        should(parser).properties({
            prop: 'en',
            type: 'SectionParser',
        });

        // custom
        var parser = new SectionParser({
            prop: 'fr',
        });
        should(parser).properties({
            prop: 'fr',
        });
    });

    it("parseExpandableSection(segments) parses mn1 (1)", done=>{
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var prop = "xyz";
            var segments = sutta.segments.map(seg => ({
                scid: seg.scid,
                [prop]: seg.en,
            }));

            var parser = new SectionParser({
                prop,
            });
            var section = parser.parseExpandableSection(segments);
            should(section).instanceOf(Section);
            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(98);
            should(section.segments[0].scid).equal('mn1:3.1');
            should(section.segments[section.segments.length-1].scid)
                .equal('mn1:26.5');
            should(section.prefix).match(/But then they identify/);
            should.deepEqual(section.template.map(seg => seg.scid), [
                'mn1:3.3',
            ]);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (2)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(109));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:27.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:50.4');
            should(section.prefix).equal('They directly know ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                ['mn1:27.1', 'mn1:27.2', 'mn1:27.3', 'mn1:27.4' ]);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (3)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(139));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:51.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:52-74.27');
            should(section.prefix).equal('They directly know ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                ['mn1:51.1', 'mn1:51.2', 'mn1:51.3', 'mn1:51.4']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (4)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(169));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:75.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:76-98.27');
            should(section.prefix).equal('They directly know ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                ['mn1:75.1', 'mn1:75.2', 'mn1:75.3', 'mn1:75.4']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (5)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(199));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:99.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:100-122.27');
            should(section.prefix).equal('They directly know ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                ['mn1:99.1', 'mn1:99.2', 'mn1:99.3', 'mn1:99.4']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (6)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(229));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:123.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:124-146.27');
            should(section.prefix).equal('They directly know ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                [ 'mn1:123.1', 'mn1:123.2', 'mn1:123.3', 'mn1:123.4']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (7)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser.parseExpandableSection(sutta.segments.slice(260));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(31);
            should(section.segments[0].scid).equal('mn1:147.1');
            should(section.segments[section.segments.length-1].scid).equal('mn1:148-170.27');
            should(section.prefix).equal('He directly knows ');
            should.deepEqual(section.template.map(seg => seg.scid), 
                [ 'mn1:147.1', 'mn1:147.2', 'mn1:147.3', 'mn1:147.4']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn1 (8)", function(done) {
        (async function() { try {
            await suttaStore.initialize();
            var sutta = await suttaStore.loadSutta('mn1');
            var parser = new SectionParser();
            var section = parser
                .parseExpandableSection(sutta.segments.slice(292));

            should.deepEqual(section.values, MN1_VALUES);
            should(section.segments.length).equal(38);
            should(section.segments[0].scid).equal('mn1:171.1');
            should(section.segments[section.segments.length-1].scid)
                .equal('mn1:172-194.32');
            should(section.prefix).equal('He directly knows ');
            should.deepEqual(section.template.map(seg => seg.scid), [
                'mn1:171.1', 'mn1:171.2', 'mn1:171.3', 'mn1:171.4', 
                'mn1:171.5', 'mn1:171.6']);

            done();
        } catch(e) { done(e); } })();
    });

    it("parseExpandableSection(segments) parses mn3 (1)", async()=>{
        await suttaStore.initialize();
        var sutta = await suttaStore.loadSutta('mn2');
        var parser = new SectionParser();
        var section = parser
            .parseExpandableSection(sutta.segments.slice(0));

        should.deepEqual(section.values.slice(15,20), 
            MN2_VALUES.slice(15,20));
        should(section.segments.length).equal(12);
        should(section.segments[0].scid).equal('mn2:12.0');
        should(section.segments[section.segments.length-1].scid)
            .equal('mn2:12.11');
        should(section.prefix).match(/Reflecting properly, /);
        should.deepEqual(section.template.map(seg => seg.scid), 
            [ 'mn2:12.2', 'mn2:12.3']);
    });
})
