(typeof describe === 'function') && describe("s3-creds", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    const tmp = require('tmp');
    const { logger, LogInstance } = require('log-instance');
    const { AwsConfig, } = require('say-again');
    const {
        S3Creds,
    } = require("../index");
    const LOCAL = path.join(__dirname, '..', 'local');
    const TESTCONFIG = path.join(__dirname, 'data', 'vsm-s3.json');
    this.timeout(10*1000);

    it("default ctor", function() {
        var creds = new S3Creds();
        should(creds.awsConfig).instanceOf(AwsConfig);
        should(creds.awsConfig.sayAgain.Bucket).equal('say-again.sc-voice');
    });
    it("custom ctor", function() {
        var creds = new S3Creds({configPath:TESTCONFIG});
        should(creds.awsConfig).properties({
            "region": "us-west-1",
            "secretAccessKey": "test-shared-secretAccessKey",
            "accessKeyId": "test-shared-accessKeyId",
        });
        should(creds.awsConfig.polly).properties({
            "region": "us-west-1",
            "secretAccessKey": "test-polly-secretAccessKey",
            "accessKeyId": "test-polly-accessKeyId",
            "signatureVersion": "v4",
            "apiVersion": '2016-06-10',
        });
        should(creds.awsConfig.s3).properties({
            "endpoint": "https://s3.us-west-1.amazonaws.com",
            "region": "us-west-1",
            "secretAccessKey": "test-s3-secretAccessKey",
            "accessKeyId": "test-s3-accessKeyId"
        });
        should(creds.awsConfig.Bucket).equal("sc-voice-vsm");
        should.deepEqual(creds.awsConfig.sayAgain, {
            Bucket: 'say-again.sc-voice',
        });
    });
    it("obfuscated() => *****1234", ()=>{
        var creds = new S3Creds({configPath:TESTCONFIG});
        var obfuscated = creds.obfuscated();
        should(obfuscated.polly).properties({
            "region": "us-west-1",
            "secretAccessKey": "**********************sKey",
            "accessKeyId": "******************eyId",
            "signatureVersion": "v4",
            "apiVersion": '2016-06-10',
        });
        should(obfuscated.s3).properties({
            "endpoint": "https://s3.us-west-1.amazonaws.com",
            "region": "us-west-1",
            "secretAccessKey": "*******************sKey",
            "accessKeyId": "***************eyId"
        });
        should(obfuscated.Bucket).equal("sc-voice-vsm");
    });
})
