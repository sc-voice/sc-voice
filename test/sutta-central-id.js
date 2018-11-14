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
    it("compareLow(a,b) compares sutta file names", function(){
        var cmp = SuttaCentralId.compareLow;

        // misc
        should(cmp('an1.1', 'an2.11-20')).equal(-1);
        should(cmp('an1.1', 'an2.011-20')).equal(-1);
        should(cmp('an1.100', 'an2.11-20')).equal(-1);
        should(cmp('an1.100', 'an2.011-020')).equal(-1);
        should(cmp('an2.1', 'an2.11-20')).equal(-10);
        should(cmp('an2.1', 'an2.011-020')).equal(-10); 
        should(cmp('an2.5', 'an2.11-20')).equal(-6);
        should(cmp('an2.10', 'an2.11-20')).equal(-1);
        should(cmp('an2.11', 'an2.11-20')).equal(0);
        should(cmp('an2.21', 'an2.11-20')).equal(10);
        should(cmp('an2.100', 'an2.11-20')).equal(89);
        should(cmp('an3.1', 'an2.11-20')).equal(1);
        should(cmp('an3.1', 'an2.011-020')).equal(1);
        should(cmp('an1', 'dn2')).equal(-1);
        should(cmp('an9.1', 'dn2')).equal(-1);
        should(cmp('dn2', 'mn1')).equal(-1);
        should(cmp('an2.1-10', 'an2.11-20')).equal(-10);

        // Standalone 
        should(cmp('mn33', 'mn33')).equal(0);
        should(cmp('mn33', 'mn34')).equal(-1);
        should(cmp('mn34', 'mn33')).equal(1);

        // collection
        should(cmp( 'sn/en/sujato/sn22.1', 'an/en/sujato/an22.1')).equal(1);
        should(cmp( 'an/en/sujato/an22.1', 'sn/en/sujato/sn22.1')).equal(-1);
        should(cmp( 'xx/en/sujato/sn22.1', 'xx/en/sujato/an22.1')).equal(1);
        should(cmp( 'xx/en/sujato/an22.1', 'xx/en/sujato/sn22.1')).equal(-1);

        // major number
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn22.1')).equal(7);
        should(cmp( 'sn/en/sujato/sn22.1', 'sn/en/sujato/sn29.1')).equal(-7);

        // subchapter numbering
        should(cmp( 'sn/en/sujato/sn30.1', 'sn/en/sujato/sn30.2')).equal(-1);
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn29.10')).equal(-9);
        should(cmp( 'sn/en/sujato/sn29.10', 'sn/en/sujato/sn29.1')).equal(9);
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn29.11-20')).equal(-10);
        should(cmp( 'sn/en/sujato/sn29.11-20', 'sn/en/sujato/sn29.1')).equal(10);
        should(cmp( 'sn/en/sujato/sn29.10', 'sn/en/sujato/sn29.11-20')).equal(-1);
        should(cmp( 'sn/en/sujato/sn29.11-20', 'sn/en/sujato/sn29.10')).equal(1);

        // ranges
        should(cmp('sn29.11-20', 'sn29.11-20')).equal(0);
        should(cmp('sn29.11-20', 'sn29.10')).equal(1);
        should(cmp('sn29.11-20', 'sn29.11')).equal(0);
        should(cmp('sn29.11-20', 'sn29.12')).equal(-1);
        should(cmp('sn29.21', 'sn29.20')).equal(1);
        should(cmp('sn29.21', 'sn29.21')).equal(0);
        should(cmp('sn29.21', 'sn29.22')).equal(-1);

        should(cmp("an1.1-10", "an1.1-10")).equal(0);
        should(cmp("an1.1", "an1.1-10")).equal(0);
        should(cmp("an1.10", "an1.1-10")).equal(9);

    });
    it("compareHigh(a,b) compares sutta file names", function(){
        var cmp = SuttaCentralId.compareHigh;

        // misc
        should(cmp('an1.1', 'an2.11-20')).equal(-1);
        should(cmp('an1.1', 'an2.011-20')).equal(-1);
        should(cmp('an1.100', 'an2.11-20')).equal(-1);
        should(cmp('an1.100', 'an2.011-020')).equal(-1);
        should(cmp('an2.1', 'an2.11-20')).equal(-19);
        should(cmp('an2.1', 'an2.011-020')).equal(-19); 
        should(cmp('an2.5', 'an2.11-20')).equal(-15);
        should(cmp('an2.10', 'an2.11-20')).equal(-10);
        should(cmp('an2.11', 'an2.11-20')).equal(-9);
        should(cmp('an2.21', 'an2.11-20')).equal(1);
        should(cmp('an2.100', 'an2.11-20')).equal(80);
        should(cmp('an3.1', 'an2.11-20')).equal(1);
        should(cmp('an3.1', 'an2.011-020')).equal(1);
        should(cmp('an1', 'dn2')).equal(-1);
        should(cmp('an9.1', 'dn2')).equal(-1);
        should(cmp('dn2', 'mn1')).equal(-1);
        should(cmp('an2.1-10', 'an2.11-20')).equal(-10);

        // Standalone 
        should(cmp('mn33', 'mn33')).equal(0);
        should(cmp('mn33', 'mn34')).equal(-1);
        should(cmp('mn34', 'mn33')).equal(1);

        // collection
        should(cmp( 'sn/en/sujato/sn22.1', 'an/en/sujato/an22.1')).equal(1);
        should(cmp( 'an/en/sujato/an22.1', 'sn/en/sujato/sn22.1')).equal(-1);
        should(cmp( 'xx/en/sujato/sn22.1', 'xx/en/sujato/an22.1')).equal(1);
        should(cmp( 'xx/en/sujato/an22.1', 'xx/en/sujato/sn22.1')).equal(-1);

        // major number
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn22.1')).equal(7);
        should(cmp( 'sn/en/sujato/sn22.1', 'sn/en/sujato/sn29.1')).equal(-7);

        // subchapter numbering
        should(cmp( 'sn/en/sujato/sn30.1', 'sn/en/sujato/sn30.2')).equal(-1);
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn29.10')).equal(-9);
        should(cmp( 'sn/en/sujato/sn29.10', 'sn/en/sujato/sn29.1')).equal(9);
        should(cmp( 'sn/en/sujato/sn29.1', 'sn/en/sujato/sn29.11-20')).equal(-19);
        should(cmp( 'sn/en/sujato/sn29.11-20', 'sn/en/sujato/sn29.1')).equal(19);
        should(cmp( 'sn/en/sujato/sn29.10', 'sn/en/sujato/sn29.11-20')).equal(-10);
        should(cmp( 'sn/en/sujato/sn29.11-20', 'sn/en/sujato/sn29.10')).equal(10);

        // ranges
        should(cmp('sn29.11-20', 'sn29.11-20')).equal(0);
        should(cmp('sn29.11-20', 'sn29.10')).equal(10);
        should(cmp('sn29.11-20', 'sn29.11')).equal(9);
        should(cmp('sn29.11-20', 'sn29.12')).equal(8);
        should(cmp('sn29.21', 'sn29.20')).equal(1);
        should(cmp('sn29.21', 'sn29.21')).equal(0);
        should(cmp('sn29.21', 'sn29.22')).equal(-1);

        should(cmp("an1.1-10", "an1.1-10")).equal(0);
        should(cmp("an1.1", "an1.1-10")).equal(-9);
        should(cmp("an1.10", "an1.1-10")).equal(0);

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
