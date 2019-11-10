(typeof describe === 'function') && describe("sutta", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Section,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

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

    it("TESTTESTdefault ctor", ()=>{
        should.throws(()=>{
            var sutta = new Sutta();
        });
    });
    it("TESTTESTcustom ctor", ()=>{
        var sutta_uid = "testSutta1";
        var author = "testAuthor";
        var lang = "test";
        var segments = [{
            scid: "testSutta1:0.1",
            test: "text 1",
        }];
        var sutta = new Sutta({
            author,
            lang,
            sutta_uid,
            segments,
        });
        should(sutta).properties({
            author,
            sutta_uid,
            lang,
        });
        should.deepEqual(sutta.segments, segments);
    });
    it("scidGroup(scid) returns immediate segment group", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');

            // first group
            should.deepEqual(sutta.scidGroup("mn1:0.1"), {
                scid: 'mn1:0.',
                segments: [
                    sutta.segments[0],
                    sutta.segments[1],
                ],
            });

            // some group
            var mn1_1 = sutta.scidGroup("mn1:1.2");
            should(mn1_1.scid).equal('mn1:1.');
            should(mn1_1.segments.length).equal(6);
            should(mn1_1.segments[0].scid).equal('mn1:1.1');
            should(mn1_1.segments[5].scid).equal('mn1:1.6');

            // full sutta group
            var mn1 = sutta.scidGroup("mn1:1");
            should(mn1.scid).equal('mn1:');
            should(mn1.segments.length).equal(sutta.segments.length);

            // not yet imoplemented. returning entire MN might be overkill
            should.throws(() => sutta.scidGroup('mn1') );

            done();
        } catch(e) { done(e); } })();
    });
    it("nextSegment(scid, offset) returns following segment", function(done) {
        (async function() { try {
            var sutta = await SuttaFactory.loadSutta('mn1');

            // scid variants
            should.deepEqual(
                sutta.nextSegment('mn1:0.1'),
                sutta.nextSegment(new SuttaCentralId('mn1:0.1'))
            );

            // next at start
            var nextseg = sutta.nextSegment('mn1:0.1');
            var i = 1;
            should.deepEqual(nextseg, sutta.segments[i++]);
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg.scid, sutta.segments[i++].scid);
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg.scid, sutta.segments[i++].scid);
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg.scid, sutta.segments[i++].scid);
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg.scid, sutta.segments[i++].scid);
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg.scid, sutta.segments[i++].scid);

            // next at end
            i = sutta.segments.length - 2;
            nextseg = sutta.nextSegment(sutta.segments[i++].scid);
            should.deepEqual(nextseg.scid, "mn1:172-194.32");
            nextseg = sutta.nextSegment(nextseg.scid);
            should.deepEqual(nextseg, null);

            // offset
            nextseg = sutta.nextSegment('mn1:1.2', 2);
            should(nextseg.scid).equal('mn1:1.4');
            nextseg = sutta.nextSegment('mn1:1.2', -2);
            should(nextseg.scid).equal('mn1:0.2');

            // bounds
            nextseg = sutta.nextSegment('mn1:1.2', -100);
            should(nextseg).equal(null);

            // segment following group
            nextseg = sutta.nextSegment('mn1:1.',1);
            should(nextseg.scid).equal('mn1:2.1');

            // segment preceding group
            nextseg = sutta.nextSegment('mn1:2.',-1);
            should(nextseg.scid).equal('mn1:1.6');

            // segment at end of group
            nextseg = sutta.nextSegment('mn1:2.',0);
            should(nextseg.scid).equal('mn1:2.4');

            done();
        } catch(e) { done(e); } })();
    });
    it("findIndexes(segments, pat) returns array of segment indexes", function() {
        should.deepEqual(Sutta.findIndexes(segments, 'not found'),[]);

        // search string
        var prop = "en";
        should.deepEqual(Sutta.findIndexes(segments, 'a1',{prop}),[0]);
        should.deepEqual(Sutta.findIndexes(segments, 'ab',{prop}),[0,1]);
        should.deepEqual(Sutta.findIndexes(segments, 'bc',{prop}),[1,2]);
        should.deepEqual(Sutta.findIndexes(segments, 'ac',{prop}),[0,2]);

        // search RegExp
        should.deepEqual(Sutta.findIndexes(segments, /a1/,{prop}),[0]);
        should.deepEqual(Sutta.findIndexes(segments, /ab/,{prop}),[0,1]);
        should.deepEqual(Sutta.findIndexes(segments, /bc/,{prop}),[1,2]);
        should.deepEqual(Sutta.findIndexes(segments, /ac/,{prop}),[0,2]);
        should.deepEqual(Sutta.findIndexes(segments, /a1 ab|ab bc/,{prop}),[0,1]);

        // search prop
        var prop = 'scid'; // default
        should.deepEqual(Sutta.findIndexes(segments, /^s:0.1/,{prop}),[0]); // segment
        should.deepEqual(Sutta.findIndexes(segments, /^s:0.*/,{prop}),[0]); // section
        should.deepEqual(Sutta.findIndexes(segments, /^s:1.*/),[1,2]); // section

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
        should.deepEqual(Sutta.findSegments(segments, 'not found'), []);

        // search string
        var prop = 'en';
        should.deepEqual(Sutta.findSegments(segments, 'a1',{prop}),[segments[0]]);
        should.deepEqual(Sutta.findSegments(segments, 'ab',{prop}),[segments[0],segments[1]]);
        should.deepEqual(Sutta.findSegments(segments, 'bc',{prop}),[segments[1],segments[2]]);
        should.deepEqual(Sutta.findSegments(segments, 'ac',{prop}),[segments[0],segments[2]]);

        // search RegExp
        should.deepEqual(Sutta.findSegments(segments, /a1/,{prop}),[segments[0]]);
        should.deepEqual(Sutta.findSegments(segments, /ab/,{prop}),[segments[0],segments[1]]);
        should.deepEqual(Sutta.findSegments(segments, /bc/,{prop}),[segments[1],segments[2]]);
        should.deepEqual(Sutta.findSegments(segments, /ac/,{prop}),[segments[0],segments[2]]);
        should.deepEqual(Sutta.findSegments(segments, /a1 ab|ab bc/,{prop}),[segments[0],segments[1]]);

        // search prop
        var prop = 'scid'; // default value
        should.deepEqual(Sutta.findSegments(segments, /^s:0.1/,{prop}),[segments[0]]); // segment
        should.deepEqual(Sutta.findSegments(segments, /^s:0.*/,{prop}),[segments[0]]); // section
        should.deepEqual(Sutta.findSegments(segments, /^s:1.*/),[segments[1],segments[2]]); // section

        // search all segments
        should.deepEqual(Sutta.findSegments(segments, /s.*/), segments);
        should.deepEqual(Sutta.findSegments(segments, /s:.*/), segments);
    });
    it("indexOf(segments, scid) returns segment index", function() {
        should(Sutta.indexOf(segments, 0)).equal(0);
        should(Sutta.indexOf(segments, 2)).equal(2);
        should(Sutta.indexOf(segments, -2)).equal(-2);
        should(Sutta.indexOf(segments, "s:1.1")).equal(1);
        should.throws(() => Sutta.indexOf(segments, "nonsense"));
        should.throws(() => Sutta.indexOf(segments, "s:1.*"));
    });
    it("excerpt(segments, opts) returns segment/text excerpt", function() {
        // excerpt all
        should.deepEqual(Sutta.excerpt(segments), segments);

        // excerpt first 2
        should.deepEqual(Sutta.excerpt(segments, {
            end: 2,
        }),[
            segments[0],
            segments[1],
        ]);

        // excerpt lsst 2
        should.deepEqual(Sutta.excerpt(segments, {
            start: -2,
            prop: 'en',
        }),[
            segments[1].en,
            segments[2].en,
        ]);

        // excerpt by scid
        should.deepEqual(Sutta.excerpt(segments, {
            start: "s:0.1",
            end: "s:1.2",
            prop: 'en',
        }),[
            segments[0].en + Sutta.GROUP_SEP,
            segments[1].en,
        ]);
    });
    it("textOfSegments(segments, opts) returns array of text", function() {
        should.deepEqual(Sutta.textOfSegments(segments), [
            `${segments[0].en}\n`, // group change forces extra EOL
            segments[1].en,
            segments[2].en,
        ]);

        should.deepEqual(Sutta.textOfSegments(segments), 
            Sutta.textOfSegments(segments, {
                prop: 'en',
        }));
    });
});

