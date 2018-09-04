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
    it("TESTTESTfindAlternates(segments, prop) analyzes mn1 for alternates", function(done) {
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

            done();
        } catch(e) { done(e); } })();
    });
    it("findAlternates(segments, prop) analyzes mn2 for alternates", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn2');

            /* mn2 does indeed have minor alternates (i.e., eye, ear, etc.) 
             * as well as unexpandable ellipses.
             */
            var alternates = Template.findAlternates(sutta.segments);
            should(alternates).equal(null);

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
                //'vanity and negligence',
            ]);
            should.deepEqual(alternates.indexes.map(i => segments[i].scid), [
                'mn3:8.1',
                'mn3:9-15.1',
                'mn3:9-15.2',
                'mn3:9-15.3',
                'mn3:9-15.4',
                'mn3:9-15.5',
                'mn3:9-15.6',
                //'mn3:9-15.7',
            ]);

            done();
        } catch(e) { done(e); } })();
    });

})
