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
    }];

    it("TESTTESTTemplate(segments,alternates) creates a template", function() {
        var template = new Template(segments, 'x1');
        should(template).properties({
            segments,
            alternates: ['x1'],
            reAlternates: /x1/u,
        });
        should(template.reAlternates.test('x1')).equal(true);

        var alternates = ['earth','the Creator','water']; // first alternate is template parameter
        var template = new Template(segments, alternates);
        should(template).properties({
            segments,
            alternates,
            reAlternates: /earth|the Creator|water/u,
        });
    });
    it("TESTTESTexpand(segment) expands a template", function() {
        var template = new Template([
            segments[1],
            segments[2],
        ], ['x1', 'y1', 'y2a y2b','y3']);

        var re = /aaa|bb Cc|ddd/ug;
        should.deepEqual('x aaa y bb Cc z ddd w'.split(re), ['x ',' y ',' z ', ' w']);

        // expand with prefix (mn1:4.2)
        var expansion = template.expand(segments[3]);
        should.deepEqual(expansion, [{
            scid: 's:2.1.1', 
            en: 'b1 y1 b2',
        },{
            scid: 's:2.1.2', 
            en: 'c1 y1 c2 y1 c3',
        }]);

        // expand without prefix (mn1:28-49.6)
        var expansion = template.expand(segments[4]);
        should.deepEqual(expansion, [{
            scid: 's:3.1.1', 
            en: 'b1 y2a y2b b2',
        },{
            scid: 's:3.1.2', 
            en: 'c1 y2a y2b c2 y2a y2b c3',
        }]);

        // expand with alternate  prefix (mn1:28-49.1)
        var expansion = template.expand(segments[5]);
        should.deepEqual(expansion, [{
            scid: 's:4.1.1', 
            en: 'q1 y3 b2',
        },{
            scid: 's:4.1.2', 
            en: 'c1 y3 c2 y3 c3',
        }]);
    });

})
