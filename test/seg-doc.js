
(typeof describe === 'function') && describe("seg-doc", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const SegDoc = require("../src/seg-doc");

    var segments = [{
        scid: 's:0.1',
        en:'a1 ab ac.',
    },{
        scid: 's:1.1',
        en:'b1 ab bc.',
    },{
        scid: 's:1.2',
        en:'c1 bc ac.',
    }]

    it("findIndexes(pat) returns array of segment indexes", function() {
        var segDoc = new SegDoc({segments});
        should.deepEqual(segDoc.findIndexes('not found'),[]);

        // search string
        var prop = "en";
        should.deepEqual(segDoc.findIndexes('a1',{prop}),[0]);
        should.deepEqual(segDoc.findIndexes('ab',{prop}),[0,1]);
        should.deepEqual(segDoc.findIndexes('bc',{prop}),[1,2]);
        should.deepEqual(segDoc.findIndexes('ac',{prop}),[0,2]);

        // search RegExp
        should.deepEqual(segDoc.findIndexes(/a1/,{prop}),[0]);
        should.deepEqual(segDoc.findIndexes(/ab/,{prop}),[0,1]);
        should.deepEqual(segDoc.findIndexes(/bc/,{prop}),[1,2]);
        should.deepEqual(segDoc.findIndexes(/ac/,{prop}),[0,2]);
        should.deepEqual(segDoc.findIndexes(/a1 ab|ab bc/,{prop}),[0,1]);

        // search prop
        var prop = 'scid'; // default
        should.deepEqual(segDoc.findIndexes(/^s:0.1/,{prop}),[0]); // segment
        should.deepEqual(segDoc.findIndexes(/^s:0.*/,{prop}),[0]); // section
        should.deepEqual(segDoc.findIndexes(/^s:1.*/),[1,2]); // section

        var result = segDoc.segments.filter(seg => /ab/.test(seg.en));
        should.deepEqual(result, [{
            scid: 's:0.1',
            en:'a1 ab ac.',
        },{
            scid: 's:1.1',
            en:'b1 ab bc.',
        }]);
    });
    it("findSegments(pat) returns array of segment indexes", function() {
        var segDoc = new SegDoc({segments});
        should.deepEqual(segDoc.findSegments('not found'), []);

        // search string
        var prop = 'en';
        should.deepEqual(segDoc.findSegments('a1',{prop}),[segments[0]]);
        should.deepEqual(segDoc.findSegments('ab',{prop}),[segments[0],segments[1]]);
        should.deepEqual(segDoc.findSegments('bc',{prop}),[segments[1],segments[2]]);
        should.deepEqual(segDoc.findSegments('ac',{prop}),[segments[0],segments[2]]);

        // search RegExp
        should.deepEqual(segDoc.findSegments(/a1/,{prop}),[segments[0]]);
        should.deepEqual(segDoc.findSegments(/ab/,{prop}),[segments[0],segments[1]]);
        should.deepEqual(segDoc.findSegments(/bc/,{prop}),[segments[1],segments[2]]);
        should.deepEqual(segDoc.findSegments(/ac/,{prop}),[segments[0],segments[2]]);
        should.deepEqual(segDoc.findSegments(/a1 ab|ab bc/,{prop}),[segments[0],segments[1]]);

        // search prop
        var prop = 'scid'; // default value
        should.deepEqual(segDoc.findSegments(/^s:0.1/,{prop}),[segments[0]]); // segment
        should.deepEqual(segDoc.findSegments(/^s:0.*/,{prop}),[segments[0]]); // section
        should.deepEqual(segDoc.findSegments(/^s:1.*/),[segments[1],segments[2]]); // section

        // search all segments
        var segs = segDoc.findSegments(/s.*/);
        should(segs.length).equal(3);
        var segs = segDoc.findSegments(/s:.*/);
        should(segs.length).equal(3);
    });
    it("indexOf(scid) returns segment index", function() {
        var segDoc = new SegDoc({segments});
        should(segDoc.indexOf(0)).equal(0);
        should(segDoc.indexOf(2)).equal(2);
        should(segDoc.indexOf(-2)).equal(-2);
        should(segDoc.indexOf("s:1.1")).equal(1);
        should.throws(() => segDoc.indexOf("nonsense"));
        should.throws(() => segDoc.indexOf("s:1.*"));
    });
    it("excerpt(range) returns segments in range", function() {
        var segDoc = new SegDoc({segments});

        // excerpt all
        should.deepEqual(segDoc.excerpt(), segments);

        // excerpt first 2
        should.deepEqual(segDoc.excerpt({
            end: 2,
        }),[
            segments[0],
            segments[1],
        ]);

        // excerpt lsst 2
        should.deepEqual(segDoc.excerpt({
            start: -2,
            prop: 'en',
        }),[
            segments[1].en,
            segments[2].en,
        ]);

        // excerpt by scid
        should.deepEqual(segDoc.excerpt({
            start: "s:0.1",
            end: "s:1.2",
            prop: 'en',
        }),[
            segments[0].en + segDoc.groupSep,
            segments[1].en,
        ]);
    });

})
