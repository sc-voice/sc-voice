(typeof describe === 'function') && describe("cursor", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
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

    it("TESTTESTTemplate(parms) creates a template", function() {
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
    it("TESTTESTexpand(segment) expands a template (mn1:4.2)", function() {
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
    it("TESTTESTexpand(segment) expands a template (mn1:28-49.6)", function() {
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
    it("TESTTESTexpand(segment) expands a template (mn1:28-49.1)", function() {
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
    it("TESTTESTexpand(segment) expands a template (mn1:28-49.2)", function() {
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

})
