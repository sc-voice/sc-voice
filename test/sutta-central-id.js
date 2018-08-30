(typeof describe === 'function') && describe("seg-doc", function() {
    const should = require("should");
    const {
        SuttaCentralId,
    } = require("../index");

    it("TESTTESTSuttaCentralId(scid) is ctor", function() {
        // sutta id
        var scid = new SuttaCentralId('mn1');
        should(scid).instanceOf(SuttaCentralId);
        should(scid.toString()).equal('mn1');

        // segment id
        var scid = new SuttaCentralId('mn1:2.3.4');
        should(scid).instanceOf(SuttaCentralId);
        should(scid.toString()).equal('mn1:2.3.4');

        // default ctor
        var scid = new SuttaCentralId();
        should(scid).instanceOf(SuttaCentralId);
        should(scid.toString()).equal(null);
    });
    it("TESTTESTsutta return sutta id", function() {
        var scid = new SuttaCentralId();
        should(scid.sutta).equal(null);

        var scid = new SuttaCentralId('mn1');
        should(scid.sutta).equal('mn1');

        var scid = new SuttaCentralId('mn1:2.3.4');
        should(scid.sutta).equal('mn1');
    });
    it("TESTTESTparent returns parent SuttaCentralId", function() {
        var scid = new SuttaCentralId('mn1');
        should(scid.parent).instanceOf(SuttaCentralId);
        should(scid.parent.scid).equal(null);

        var scid = new SuttaCentralId('mn1:2.');
        should(scid.parent).instanceOf(SuttaCentralId);
        should(scid.parent.scid).equal('mn1:');

        var scid = new SuttaCentralId('mn1:2.3.4');
        should(scid.parent).instanceOf(SuttaCentralId);
        should(scid.parent.scid).equal('mn1:2.3.');
    });
    it("TESTTESTscidRegExp(pat) creates a wildcard pattern for finding scids", function() {
        // should be same as Linux file wildcards
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.3'), /mn1:2\.3/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.*'), /mn1:2\..*/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.?'), /mn1:2\../);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:[2-3].*'), /mn1:[2-3]\..*/);
        should.deepEqual(SuttaCentralId.scidRegExp('^mn1:2.3'), /\^mn1:2\.3/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.3$'), /mn1:2\.3\$/);
    });
    it("TESTTESTgroups returns array of groups", function() {
        var scid = new SuttaCentralId('mn1:2.3.4');
        should.deepEqual(scid.groups, ['2','3','4']);
        var scid = new SuttaCentralId('mn1');
        should.deepEqual(scid.groups, null);
    });

})
