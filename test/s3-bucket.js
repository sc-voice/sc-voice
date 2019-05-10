(typeof describe === 'function') && describe("s3-bucket", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        S3Bucket,
    } = require("../index");
    const AWS = require("aws-sdk");
    const TEST_BUCKET = 'sc-voice-test-bucket';
    var s3 = new AWS.S3();
    const BUCKET_OPTS = {
        s3,
        Bucket: TEST_BUCKET,
    };

    it("ctor() constructor", function() {
        // default constructor
        var bucket = new S3Bucket();
        should(bucket.s3).instanceOf(AWS.S3);
        should(bucket.initialized).equal(false);

        // custom construtor
        var bucket = new S3Bucket(BUCKET_OPTS);
        should(bucket.s3).equal(s3);
        should(bucket.initialized).equal(false);
    });
    it("initialize() must be called", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            should(bucket.initialized).equal(true);
            done();
        } catch(e) {done(e);} })();
    });
    it("putObject(oname,data) uploads object", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            var name = 'kn_en_sujato_amy.tar.gz';
            var dataPath = path.join(__dirname, 'data', name);
            var data = fs.readFileSync(dataPath);
            var putResult = await bucket.putObject(name, data);
            should(putResult).properties(['ETag']);
            done();
        } catch(e) {done(e);} })();
    });
    it("getObject(oname,data) downloads object", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            var name = 'kn_en_sujato_amy.tar.gz';
            var dataPath = path.join(__dirname, 'data', name);
            var data = fs.readFileSync(dataPath);
            var getResult = await bucket.getObject(name);
            should(getResult).properties([
                'Body', 
                'AcceptRanges',
                'LastModified',
                'ContentLength',
                'ETag',
                'ContentType',
                'Metadata',
            ]);
            should(getResult.AcceptRanges).equal('bytes');
            should(getResult.ContentLength).equal(data.length);
            should(getResult.ContentType).equal('application/octet-stream');
            should(getResult.Body.length).equal(data.length);
            should.deepEqual(getResult.Body, data);
            done();
        } catch(e) {done(e);} })();
    });

})
