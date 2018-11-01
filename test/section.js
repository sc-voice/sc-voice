
(typeof describe === 'function') && describe("section", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        Segments,
        Sutta,
        Words,
    } = require('../index');

    var segments = [{ // 0
        scid: 's:0.1',
        en: 'a1 a2, a3',
    },{ // 1
        scid: 's:1.1',
        en: 'b1 x1 b2',
    },{ // 2
        scid: 's:1.2',
        en: 'c1 x1 c2 x1 c3',
    },{ // 3 (mn1:4.2)
        scid: 's:2.1',
        en: `d1 y1 ${Words.U_ELLIPSIS}`,
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


    it("Section(parms) creates a section", function() {
        var section = new Section({
            segments, 
        });
        should(section).properties({
            segments,
            type: 'Section',
            title: `a1 a2, a3`,
        });
    });

    it("expand(segment) expands a template (mn1:4.2)", function() {
        var section = new Section({
            segments,
            prefix: 'd1 ',
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = section.expand(segments[3]);
        should.deepEqual(expansion, [{
            scid: 's:2.1.1', 
            en: 'd1 y1 b2',
            expanded: true,
        },{
            scid: 's:2.1.2', 
            en: 'c1 y1 c2 y1 c3',
            expanded: true,
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.6)", function() {
        var section = new Section({
            segments,
            prefix: 'e1 ',
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = section.expand(segments[4]);
        should.deepEqual(expansion, [{
            scid: 's:3.1.1', 
            en: 'e1 y2a y2b b2',
            expanded: true,
        },{
            scid: 's:3.1.2', 
            en: 'c1 y2a y2b c2 y2a y2b c3',
            expanded: true,
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.1)", function() {
        var section = new Section({
            segments,
            prefix: 'e1 ',
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b','y3']
        });

        var expansion = section.expand(segments[5]);
        should.deepEqual(expansion, [{
            scid: 's:4.1.1', 
            en: 'q1 y3 b2',
            expanded: true,
        },{
            scid: 's:4.1.2', 
            en: 'c1 y3 c2 y3 c3',
            expanded: true,
        }]);
    });
    it("expand(segment) expands a template (mn1:28-49.2)", function() {
        var section = new Section({
            segments,
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b', 'y3', 'y4'],
            prefix: 'q1 ',
        });

        var expansion = section.expand(segments[6]);
        should.deepEqual(expansion, [{
            scid: 's:5.1.1', 
            en: 'q1 y4 b2',
            expanded: true,
        },{
            scid: 's:5.1.2', 
            en: 'c1 y4 c2 y4 c3',
            expanded: true,
        }]);
    });
    it("expandAll() returns expanded section", function() {
        var section = new Section({
            segments,
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b', 'y3', 'y4'],
            prefix: 'q1 ',
        });
        var section2 = section.expandAll();
        should(section2).properties({
            prefix: '',
            template: [],
            values: [],
        });
        should(section2.expandable).equal(false);
        should(section.expandable).equal(true);
        should.deepEqual(section2.segments, [{ // 0
            scid: 's:0.1',
            en: 'a1 a2, a3',
        },{ // 1
            scid: 's:1.1',
            en: 'b1 x1 b2',
        },{ // 2
            scid: 's:1.2',
            en: 'c1 x1 c2 x1 c3',
        },{ // 3 (mn1:4.2)
            scid: 's:2.1.1', 
            en: 'd1 y1 b2',
            expanded: true,
        },{
            scid: 's:2.1.2', 
            en: 'c1 y1 c2 y1 c3',
            expanded: true,
        },{ // 4 (mn1:28-49.6)
            scid: 's:3.1.1', 
            en: 'q1 y2a y2b b2',
            expanded: true,
        },{
            scid: 's:3.1.2', 
            en: 'c1 y2a y2b c2 y2a y2b c3',
            expanded: true,
        },{ // 5 (mn1:28-49.1)
            scid: 's:4.1.1', 
            en: 'q1 y3 b2',
            expanded: true,
        },{
            scid: 's:4.1.2', 
            en: 'c1 y3 c2 y3 c3',
            expanded: true,
        },{ // 6 (mn1:28-49.2)
            scid: 's:5.1.1', 
            en: 'q1 y4 b2',
            expanded: true,
        },{
            scid: 's:5.1.2', 
            en: 'c1 y4 c2 y4 c3',
            expanded: true,
        }]);
        should(section2.expandAll()).equal(section2);
    });
    it("Section is serializable", function() {
        var section = new Section({
            segments,
            template: [ segments[1], segments[2], ], 
            values: ['x1', 'y1', 'y2a y2b', 'y3', 'y4'],
            prefix: 'q1 ',
        });
        var json = JSON.stringify(section);
        var sectCopy = new Section(JSON.parse(json));
        should.deepEqual(sectCopy, section);
    });

})
