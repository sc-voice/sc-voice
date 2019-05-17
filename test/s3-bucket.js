(typeof describe === 'function') && describe("s3-bucket", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const tmp = require('tmp');
    const { logger } = require('rest-bundle');
    const {
        S3Bucket,
    } = require("../index");
    const AWS = require("aws-sdk");
    const TEST_BUCKET = 'sc-voice-test-bucket';
    const AWS_ENDPOINT = 's3.us-west-1.amazonaws.com';
    const AWS_APIVERSION = '2006-03-01';
    const AWS_REGION = 'us-west-1';
    var s3 = new AWS.S3({
        apiVersion: AWS_APIVERSION,
        endpoint: AWS_ENDPOINT,
        region: AWS_REGION,
    });

    const BUCKET_OPTS = {
        s3,
        Bucket: TEST_BUCKET,
    };

    it("ctor() constructor", function() {
        // default constructor
        var bucket = new S3Bucket();
        should(bucket.s3).instanceOf(AWS.S3);
        should(bucket.s3.config).properties({
            region: AWS_REGION,
            endpoint: AWS_ENDPOINT,
            apiVersion: AWS_APIVERSION,
        });
        should(bucket.initialized).equal(false);

        // custom constructor
        var bucket = new S3Bucket(BUCKET_OPTS);
        should(bucket.s3).equal(s3);
        should(bucket.s3.config).properties({
            region: AWS_REGION,
            endpoint: AWS_ENDPOINT,
            apiVersion: AWS_APIVERSION,
        });
        should(bucket.initialized).equal(false);
    });
    it("initialize() must be called", function(done) {
        this.timeout(3*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            should(bucket.initialized).equal(true);

            var init2 = await bucket.initialize();
            should(init2).equal(bucket);
            should(bucket.initialized).equal(true);

            done();
        } catch(e) {done(e);} })();
    });
    it("putObject(oname,data) uploads object", function(done) {
        this.timeout(9*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            var Key = 'kn_en_sujato_amy.tar.gz';
            var Bucket = TEST_BUCKET;
            var endpoint = 's3.us-west-1.amazonaws.com';
            var region = 'us-west-1';
            var dataPath = path.join(__dirname, 'data', Key);
            var data = fs.createReadStream(dataPath);
            var putResult = await bucket.putObject(Key, data);
            should.deepEqual(putResult.s3Bucket, {
                s3: { 
                    endpoint,
                    region,
                },
                Bucket,
            });
            should(putResult).properties({ Key });
            should(putResult.response).properties(['ETag']);
            done();
        } catch(e) {done(e);} })();
    });
    it("getObject(oname) downloads object", function(done) {
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
    it("getObjectStream(oname) downloads object as stream", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            var name = 'kn_en_sujato_amy.tar.gz';
            var dataPath = path.join(__dirname, 'data', name);
            var data = fs.readFileSync(dataPath);
            var stream = await bucket.getObjectStream(name);
            var outPath = tmp.tmpNameSync();
            var ostream = fs.createWriteStream(outPath);
            ostream.on('error', err => {
                done(err);
            });
            ostream.on('finish', () => {
                var outData = fs.readFileSync(outPath);
                should.deepEqual(outData, data);
                done();
            });
            stream.pipe(ostream);
        } catch(e) {done(e);} })();
    });
    it("local/vsm-s3.json changes endpoint", function(done) {
        this.timeout(9*1000);
        var vsm_s3_path = path.join(__dirname, '..', 'local', 'vsm-s3.json');
        if (!fs.existsSync(vsm_s3_path)) {
            logger.warn(`skipping vsm-s3.json test`);
            done();
            return;
        }
        (async function() { try {
            var vsm_s3 = JSON.parse(fs.readFileSync(vsm_s3_path));
            var bucket = await new S3Bucket(vsm_s3).initialize();
            should(bucket.s3.config.endpoint).equal('https://s3.us-west-1.wasabisys.com');
            should(bucket.Bucket).equal('sc-voice-wasabi');
            should(bucket.initialized).equal(true);

            // we can upload a readStream to Wasabi
            var name = 'kn_en_sujato_amy.tar.gz';
            var dataPath = path.join(__dirname, 'data', name);
            var data = fs.createReadStream(dataPath);
            var putResult = await bucket.putObject(name, data);
            should(putResult.Key).equal(name);
            should(putResult.response).properties(['ETag']);

            // we cn download a stream from Wasabi
            var outPath = tmp.tmpNameSync();
            var ostream = fs.createWriteStream(outPath);
            ostream.on('error', err => {
                done(err);
            });
            ostream.on('finish', () => {
                var expectedData = fs.readFileSync(dataPath);
                var outData = fs.readFileSync(outPath);
                should.deepEqual(outData, expectedData);
                done();
            });
            var stream = await bucket.getObjectStream(name);
            stream.pipe(ostream);
        } catch(e) {done(e);} })();
    });
    it("TESTTESTlistObjects(opts) lists bucket objects", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var bucket = await new S3Bucket(BUCKET_OPTS).initialize();
            var s3Result = await bucket.listObjects();
            should(s3Result).properties({
                Name: TEST_BUCKET,
                MaxKeys: 1000,
            });
            should(s3Result.Contents[0]).properties([
                'Key', 'LastModified', 'ETag', 'Size', 'StorageClass', 'Owner',
            ]);
            should(s3Result.Contents[0].Key).match(/[a-z]*_[a-z]*_[a-z]*_[a-z]*.tar.gz/iu);
            done();
        } catch(e) {done(e);} })();
    });

})
