(typeof describe === 'function') && describe("sutta-central-id", function() {
    const should = require("should");
    const {
        SuttaCentralId,
    } = require("../index");

    it("SuttaCentralId(scid) is ctor", function() {
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
    it("normalizeSuttaId(id) returns normalized sutta_uid", function(done) {
        (async function() { try {
            should(SuttaCentralId.normalizeSuttaId('an2.12')).equal('an2.11-20');
            should(SuttaCentralId.normalizeSuttaId('an1.21-30')).equal('an1.21-30');
            should(SuttaCentralId.normalizeSuttaId('AN 1.21-30')).equal('an1.21-30');
            should(SuttaCentralId.normalizeSuttaId(' AN  1.21-30 ')).equal('an1.21-30');
            should(SuttaCentralId.normalizeSuttaId('An 1.21-30')).equal('an1.21-30');
            should(SuttaCentralId.normalizeSuttaId('Ds 1.1')).equal('ds1.1');
            should(SuttaCentralId.normalizeSuttaId('fear')).equal(null);
            should(SuttaCentralId.normalizeSuttaId('root of suffering')).equal(null);
            should(SuttaCentralId.normalizeSuttaId('1986')).equal(null);
            should(SuttaCentralId.normalizeSuttaId(' 1986')).equal(null);
            done();
        } catch(e) { done(e); } })();
    });
    it("compare(id1,id2) compares two ids", function() {
        var cmp = (a,b,expected) => {
            should(SuttaCentralId.compare(a,b))[expected](0);
            if (expected === 'equal') {
                should(SuttaCentralId.compare(b,a)).equal(0);
            } else if (expected === 'above') {
                should(SuttaCentralId.compare(b,a)).below(0);
            } else {
                should(SuttaCentralId.compare(b,a)).above(0);
            }
        };
        cmp('an1.1', 'an2.11-20', 'below');
        cmp('an1.1', 'an2.011-20', 'below');
        cmp('an1.100', 'an2.11-20', 'below');
        cmp('an1.100', 'an2.011-020', 'below');
        cmp('an2.1', 'an2.11-20', 'below');
        cmp('an2.1', 'an2.011-020', 'below');
        cmp('an2.5', 'an2.11-20', 'below');
        cmp('an2.10', 'an2.11-20', 'below');
        cmp('an2.11', 'an2.11-20', 'equal');
        cmp('an2.15', 'an2.11-20', 'equal');
        cmp('an2.20', 'an2.11-20', 'equal');
        cmp('an2.21', 'an2.11-20', 'above');
        cmp('an2.100', 'an2.11-20', 'above');
        cmp('an3.1', 'an2.11-20', 'above');
        cmp('an3.1', 'an2.011-020', 'above');
        cmp('an1', 'dn2', 'below');
        cmp('an9.1', 'dn2', 'below');
        cmp('dn2', 'mn1', 'below');
        cmp('an2.1-10', 'an2.11-20', 'below');
    });
    it("sutta return sutta id", function() {
        var scid = new SuttaCentralId();
        should(scid.sutta).equal(null);

        var scid = new SuttaCentralId('mn1');
        should(scid.sutta).equal('mn1');

        var scid = new SuttaCentralId('mn1:2.3.4');
        should(scid.sutta).equal('mn1');
    });
    it("parent returns parent SuttaCentralId", function() {
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
    it("scidRegExp(pat) creates a wildcard pattern for finding scids", function() {
        // should be same as Linux file wildcards
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.3'), /mn1:2\.3/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.*'), /mn1:2\..*/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.?'), /mn1:2\../);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:[2-3].*'), /mn1:[2-3]\..*/);
        should.deepEqual(SuttaCentralId.scidRegExp('^mn1:2.3'), /\^mn1:2\.3/);
        should.deepEqual(SuttaCentralId.scidRegExp('mn1:2.3$'), /mn1:2\.3\$/);
    });
    it("groups returns array of groups", function() {
        var scid = new SuttaCentralId('mn1:2.3.4');
        should.deepEqual(scid.groups, ['2','3','4']);
        var scid = new SuttaCentralId('mn1');
        should.deepEqual(scid.groups, null);
    });

})
