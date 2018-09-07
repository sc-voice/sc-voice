
(typeof describe === 'function') && describe("segments", function() {
    const should = require("should");
    const {
        Segments,
    } = require("../index");

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

    it("findIndexes(segments, pat) returns array of segment indexes", function() {
        should.deepEqual(Segments.findIndexes(segments, 'not found'),[]);

        // search string
        var prop = "en";
        should.deepEqual(Segments.findIndexes(segments, 'a1',{prop}),[0]);
        should.deepEqual(Segments.findIndexes(segments, 'ab',{prop}),[0,1]);
        should.deepEqual(Segments.findIndexes(segments, 'bc',{prop}),[1,2]);
        should.deepEqual(Segments.findIndexes(segments, 'ac',{prop}),[0,2]);

        // search RegExp
        should.deepEqual(Segments.findIndexes(segments, /a1/,{prop}),[0]);
        should.deepEqual(Segments.findIndexes(segments, /ab/,{prop}),[0,1]);
        should.deepEqual(Segments.findIndexes(segments, /bc/,{prop}),[1,2]);
        should.deepEqual(Segments.findIndexes(segments, /ac/,{prop}),[0,2]);
        should.deepEqual(Segments.findIndexes(segments, /a1 ab|ab bc/,{prop}),[0,1]);

        // search prop
        var prop = 'scid'; // default
        should.deepEqual(Segments.findIndexes(segments, /^s:0.1/,{prop}),[0]); // segment
        should.deepEqual(Segments.findIndexes(segments, /^s:0.*/,{prop}),[0]); // section
        should.deepEqual(Segments.findIndexes(segments, /^s:1.*/),[1,2]); // section

        var result = segments.filter(seg => /ab/.test(seg.en));
        should.deepEqual(result, [{
            scid: 's:0.1',
            en:'a1 ab ac.',
        },{
            scid: 's:1.1',
            en:'b1 ab bc.',
        }]);
    });
    it("findSegments(segments, pat) returns array of segment indexes", function() {
        should.deepEqual(Segments.findSegments(segments, 'not found'), []);

        // search string
        var prop = 'en';
        should.deepEqual(Segments.findSegments(segments, 'a1',{prop}),[segments[0]]);
        should.deepEqual(Segments.findSegments(segments, 'ab',{prop}),[segments[0],segments[1]]);
        should.deepEqual(Segments.findSegments(segments, 'bc',{prop}),[segments[1],segments[2]]);
        should.deepEqual(Segments.findSegments(segments, 'ac',{prop}),[segments[0],segments[2]]);

        // search RegExp
        should.deepEqual(Segments.findSegments(segments, /a1/,{prop}),[segments[0]]);
        should.deepEqual(Segments.findSegments(segments, /ab/,{prop}),[segments[0],segments[1]]);
        should.deepEqual(Segments.findSegments(segments, /bc/,{prop}),[segments[1],segments[2]]);
        should.deepEqual(Segments.findSegments(segments, /ac/,{prop}),[segments[0],segments[2]]);
        should.deepEqual(Segments.findSegments(segments, /a1 ab|ab bc/,{prop}),[segments[0],segments[1]]);

        // search prop
        var prop = 'scid'; // default value
        should.deepEqual(Segments.findSegments(segments, /^s:0.1/,{prop}),[segments[0]]); // segment
        should.deepEqual(Segments.findSegments(segments, /^s:0.*/,{prop}),[segments[0]]); // section
        should.deepEqual(Segments.findSegments(segments, /^s:1.*/),[segments[1],segments[2]]); // section

        // search all segments
        should.deepEqual(Segments.findSegments(segments, /s.*/), segments);
        should.deepEqual(Segments.findSegments(segments, /s:.*/), segments);
    });
    it("indexOf(segments, scid) returns segment index", function() {
        should(Segments.indexOf(segments, 0)).equal(0);
        should(Segments.indexOf(segments, 2)).equal(2);
        should(Segments.indexOf(segments, -2)).equal(-2);
        should(Segments.indexOf(segments, "s:1.1")).equal(1);
        should.throws(() => Segments.indexOf(segments, "nonsense"));
        should.throws(() => Segments.indexOf(segments, "s:1.*"));
    });
    it("excerpt(segments, opts) returns segment/text excerpt", function() {
        // excerpt all
        should.deepEqual(Segments.excerpt(segments), segments);

        // excerpt first 2
        should.deepEqual(Segments.excerpt(segments, {
            end: 2,
        }),[
            segments[0],
            segments[1],
        ]);

        // excerpt lsst 2
        should.deepEqual(Segments.excerpt(segments, {
            start: -2,
            prop: 'en',
        }),[
            segments[1].en,
            segments[2].en,
        ]);

        // excerpt by scid
        should.deepEqual(Segments.excerpt(segments, {
            start: "s:0.1",
            end: "s:1.2",
            prop: 'en',
        }),[
            segments[0].en + Segments.GROUP_SEP,
            segments[1].en,
        ]);
    });

})
