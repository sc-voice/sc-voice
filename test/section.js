
(typeof describe === 'function') && describe("section", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
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
        'the seen', 'the heard', 'the thought', 'the cognized',
        'oneness', 'diversity', 'all', 'extinguishment',
    ];

    it("TESTTESTSection(parms) creates a section", function() {
        var section = new Section({
            segments, 
        });
        should(section).properties({
            segments,
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

})
