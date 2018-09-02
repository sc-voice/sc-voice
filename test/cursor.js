(typeof describe === 'function') && describe("cursor", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const Cursor = require("../src/cursor");
    const Sutta = require("../src/sutta");
    const SuttaCentralId = require("../src/sutta-central-id");

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
    var sutta = new Sutta({
        segments,
    });

    it("Cursor(sutta, opts) creates a cursor", function() {
        var cursor = new Cursor(sutta);
        should(cursor.sutta).equal(sutta);
        should(cursor.scid).instanceOf(SuttaCentralId);
        should(cursor.scid.scid).equal('s:0.');
        should(cursor.height).equal(1);
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
    });
    it("next() advances cursor", function() {
        var cursor = new Cursor(sutta);

        // return true if advanced
        should(cursor.next()).equal(true);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);

        // return false if at end
        should(cursor.next()).equal(false);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);
    });
    it("back() moves cursor back", function() {
        var cursor = new Cursor(sutta);

        // return true if moved back
        should(cursor.next()).equal(true);
        should(cursor.back()).equal(true);
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);

        // return false if at beginning
        should(cursor.back()).equal(false);
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
    });
    it("moveToScid(scid) moves cursor to segment", function() {
        var cursor = new Cursor(sutta);

        // return true on success
        should(cursor.moveToScid('s:0.1')).equal(true);
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
        should(cursor.moveToScid('s:1.2')).equal(true);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);

        // return true if already there
        should(cursor.moveToScid('s:1.2')).equal(true);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);

        // return false if not found
        should(cursor.moveToScid('s:911')).equal(false);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);
    });
    it("moveToIndex(index) moves cursor to index", function() {
        var cursor = new Cursor(sutta);

        // return true on success
        should(cursor.moveToIndex(0)).equal(true); // don't move
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
        should(cursor.moveToIndex(-1)).equal(true);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);
        should(cursor.moveToIndex(1)).equal(true);
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
        should(cursor.moveToIndex(2)).equal(true);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);

        // return false on failure
        should(cursor.moveToIndex(-10)).equal(false);
        should(cursor.scid.scid).equal('s:0.');
        should.deepEqual(cursor.segments,[
            segments[0],
        ]);
        should(cursor.moveToIndex(10)).equal(false);
        should(cursor.scid.scid).equal('s:1.');
        should.deepEqual(cursor.segments,[
            segments[1],
            segments[2],
        ]);


    });
    it("should handle empty sutta", function() {
        var sutta = new Sutta();
        var cursor = new Cursor(sutta);
        should.deepEqual(cursor.scid, new SuttaCentralId());
        should.deepEqual(cursor.segments, []);

        // back() should not do anything
        should(cursor.back()).equal(false);
        should.deepEqual(cursor.scid, new SuttaCentralId());
        should.deepEqual(cursor.segments, []);

        // next() should not do anything
        should(cursor.next()).equal(false);
        should.deepEqual(cursor.scid, new SuttaCentralId());
        should.deepEqual(cursor.segments, []);
    });


})
