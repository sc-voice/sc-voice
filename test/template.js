(typeof describe === 'function') && describe("template", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SegDoc,
        Sutta,
        Template,
        Words,
    } = require('../index');

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

    it("Template(parms) creates a template", function() {
        var template = new Template({
            segments, 
            alternates: ['x1','x2'],
        });
        should(template).properties({
            segments,
            alternates: ['x1','x2'],
            reAlternates: /x1|x2/u,
        });
        should(template.reAlternates.test('x1')).equal(true);

        var alternates = ['earth','the Creator','water']; // first alternate is template parameter
        var template = new Template({
            segments, 
            alternates,
        });
        should(template).properties({
            segments,
            alternates,
            reAlternates: /earth|the Creator|water/u,
        });
    });
    it("levenshtein(a,b) returns distance between word", function() {
        should(Math.min(321,12,42)).equal(12);
        should(Template.levenshtein('abc','abc')).equal(0);
        should(Template.levenshtein('bc','abc')).equal(1);
        should(Template.levenshtein('abc','axbyc')).equal(2);
        should(Template.levenshtein('abc','ABC')).equal(3);
        should(Template.levenshtein('know','knows')).equal(1);
    });
    it("commonPhrase(a,b,minLength) returns longest common word sequence", function() {
        var minLength = 1;
        should(Template.commonPhrase("a", "b c", minLength)).equal('');
        should(Template.commonPhrase("a", "a b c", minLength)).equal('a');
        should(Template.commonPhrase("a b c", "b c", minLength)).equal('b c');
        should(Template.commonPhrase("a c b b c", "b c", minLength)).equal('b c');
        should(Template.commonPhrase(
            "Take a mendicant who, reflecting properly, lives restraining the faculty of the eye.", 
            "Reflecting properly, they live restraining the faculty of the ear …"
        )).equal('restraining the faculty of the');
    });
    it("expand(segment) expands a template (mn1:4.2)", function() {
        var template = new Template({
            segments: [ segments[1], segments[2], ], 
            alternates: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = template.expand(segments[3]);
        should.deepEqual(expansion, [{
            scid: 's:2.1.1', 
            en: 'b1 y1 b2',
        },{
            scid: 's:2.1.2', 
            en: 'c1 y1 c2 y1 c3',
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.6)", function() {
        var template = new Template({
            segments: [ segments[1], segments[2], ], 
            alternates: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = template.expand(segments[4]);
        should.deepEqual(expansion, [{
            scid: 's:3.1.1', 
            en: 'b1 y2a y2b b2',
        },{
            scid: 's:3.1.2', 
            en: 'c1 y2a y2b c2 y2a y2b c3',
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.1)", function() {
        var template = new Template({
            segments: [ segments[1], segments[2], ], 
            alternates: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = template.expand(segments[5]);
        should.deepEqual(expansion, [{
            scid: 's:4.1.1', 
            en: 'q1 y3 b2',
        },{
            scid: 's:4.1.2', 
            en: 'c1 y3 c2 y3 c3',
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.2)", function() {
        var template = new Template({
            segments: [ segments[1], segments[2], ], 
            alternates: ['x1', 'y1', 'y2a y2b', 'y3', 'y4'],
            prefix: 'q1 ',
        });

        var expansion = template.expand(segments[6]);
        should.deepEqual(expansion, [{
            scid: 's:5.1.1', 
            en: 'q1 y4 b2',
        },{
            scid: 's:5.1.2', 
            en: 'c1 y4 c2 y4 c3',
        }]);
    });
    it("findAlternates(segments, prop) analyzes mn1 for alternates (1)", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn1');
            var prop = "xyz";
            var segments = sutta.segments.map(seg => ({
                scid: seg.scid,
                [prop]: seg.en,
            }));

            var alternates = Template.findAlternates(segments, prop);
            should(alternates.prefix).equal( 'But then they conceive ' );
            var values = alternates.values;
            var i = 0;
            should(values[i++]).equal('earth');
            should(values[i++]).equal('water');
            should(values[i++]).equal('fire');
            should(values[i++]).equal('air');
            should(values[i++]).equal('creatures');
            should(values[22]).equal('all');
            should(values[23]).equal('extinguishment');
            should(values.length).equal(24);
            var indexes = alternates.indexes;
            should(indexes.length).equal(24);
            var i = 0;
            should(segments[indexes[i++]].scid).equal('mn1:3.3'); // conceive earth
            should(segments[indexes[i++]].scid).equal('mn1:4.2'); // conceive water
            should(segments[indexes[i++]].scid).equal('mn1:5.2'); // conceive fire
            should(segments[indexes[22]].scid).equal('mn1:25.2'); // conceive all
            should(segments[indexes[23]].scid).equal('mn1:26.2'); // conceive extinguishment
            should(alternates.prefix).equal('But then they conceive ');
            should(alternates.phrase).equal('But then they conceive');
            should(segments[alternates.start].scid).equal('mn1:3.2');
            should.deepEqual(alternates.template.map(seg => seg.scid), [
                'mn1:3.3',
                'mn1:3.4',
                'mn1:3.5',
            ]);
            should(alternates.length).equal(96);
            should(segments[alternates.start+alternates.length-1].scid).equal('mn1:26.4');

            done();
        } catch(e) { done(e); } })();
    });
    it("findAlternates(segments, prop) analyzes mn1 for alternates (2)", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn1');
            var segments = sutta.segments.slice(109);

            var alternates = Template.findAlternates(segments);
            should(alternates.phrase).equal('directly');
            should(alternates.prefix).equal('They directly know ');
            var values = alternates.values;
            var i = 0;
            should(values[i++]).equal('earth');
            should(values[i++]).equal('water');
            should(values[i++]).equal('fire');
            should(values[i++]).equal('air');
            should(values[i++]).equal('creatures');
            i = 22;
            should(values[i++]).equal('all');
            should(values[i++]).equal('extinguishment');
            should(values.length).equal(24);
            var indexes = alternates.indexes;
            should(indexes.length).equal(24);
            var i = 0;
            should(segments[indexes[i++]].scid).equal('mn1:27.1'); // knows earth
            should(segments[indexes[i++]].scid).equal('mn1:28-49.1'); // knows water
            should(segments[indexes[i++]].scid).equal('mn1:28-49.2'); // knows fire
            should(segments[indexes[22]].scid).equal('mn1:28-49.22'); // knows all
            should(segments[indexes[23]].scid).equal('mn1:28-49.23'); // knows extinguishment
            should(segments[alternates.start].scid).equal('mn1:27.1');
            should.deepEqual(alternates.template.map(seg => seg.scid), [
                'mn1:27.1',
                'mn1:27.2',
                'mn1:27.3',
                'mn1:27.4',
            ]);
            should(alternates.length).equal(30);
            should(segments[alternates.start+alternates.length-1].scid)
                .equal('mn1:50.3');

            done();
        } catch(e) { done(e); } })();
    });
    it("findAlternates(segments, prop) analyzes mn2 for alternates", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn2');
            var segments = sutta.segments;

            var alternates = Template.findAlternates(segments);
            should.deepEqual(alternates.values, [
                'the eye',
                'the ear',
                'the nose',
                'the tongue',
                'the body',
                'the mind',
            ]);
            should.deepEqual(alternates.indexes.map(i => segments[i].scid), [
                'mn2:12.2',
                'mn2:12.4',
                'mn2:12.5',
                'mn2:12.6',
                'mn2:12.7',
                'mn2:12.8', 
            ]);
            should(alternates.prefix).equal('Reflecting properly, they live restraining the faculty of ');
            should(alternates.phrase).equal('restraining the faculty of');
            should(segments[alternates.start].scid).equal('mn2:12.2');
            should.deepEqual(alternates.template.map(seg => seg.scid), [
                'mn2:12.2',
                'mn2:12.3',
            ]);
            should(alternates.length).equal(8);
            should(segments[alternates.start+alternates.length-1].scid).equal('mn2:12.9');

            done();
        } catch(e) { done(e); } })();
    });
    it("findAlternates(segments, prop) analyzes mn3 for alternates", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn3');
            var segments = sutta.segments;

            var alternates = Template.findAlternates(segments);
            should(alternates.prefix).equal(`The bad thing here is `);
            should.deepEqual(alternates.values, [
                'greed and hate',
                'anger and hostility',
                'offensiveness and contempt',
                'envy and stinginess',
                'deceit and deviousness',
                'obstinacy and aggression',
                'conceit and arrogance',
                'vanity and negligence',
            ]);
            should.deepEqual(alternates.indexes.map(i => segments[i].scid), [
                'mn3:8.1',
                'mn3:9-15.1',
                'mn3:9-15.2',
                'mn3:9-15.3',
                'mn3:9-15.4',
                'mn3:9-15.5',
                'mn3:9-15.6',
                'mn3:9-15.7',
            ]);
            should(alternates.prefix).equal('The bad thing here is ');
            should(alternates.phrase).equal('The bad thing here is');
            should(alternates.length).equal(18);
            should(segments[alternates.start].scid).equal('mn3:8.1');
            should.deepEqual(alternates.template.map(seg => seg.scid), [
                'mn3:8.1',
                'mn3:8.2',
                'mn3:8.3',
                'mn3:8.4',
                'mn3:8.5',
                'mn3:8.6',
            ]);
            should(alternates.length).equal(18);
            should(segments[alternates.start+alternates.length-1].scid).equal('mn3:9-15.12');

            done();
        } catch(e) { done(e); } })();
    });

})
