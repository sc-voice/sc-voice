(typeof describe === 'function') && describe("sutta", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Sutta,
        SuttaCentralId,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("TESTTESTloadSutta(id, opts) returns a Sutta", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn1');
            var end = 21;
            var header = sutta.excerpt({
                start: 0,
                end: 2,
                prop: 'pli',
            });
            var excerpt = sutta.excerpt({
                start: 0,
                end,
                prop: 'en',
            });
            var i = 0;
            should(excerpt[i++]).equal('Middle Discourses 1\n'); // autoterminate segment
            should(excerpt[i++]).equal('The Root of All Things\n'); // end group
            should(excerpt[i++]).equal('So I have heard.');
            should(excerpt[end-2]).equal('Why is that?');
            done();
        } catch(e) { done(e); } })();
    });
    it("TESTTESTscidGroup(scid) returns immediate segment group", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn1');

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
    it("TESTTESTnextSegment(scid, offset) returns following segment", function(done) {
        (async function() { try {
            var sutta = await Sutta.loadSutta('mn1');

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
});

