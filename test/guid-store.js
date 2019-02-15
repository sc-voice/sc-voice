(typeof describe === 'function') && describe("guid-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { MerkleJson } = require("merkle-json");
    const {
        GuidStore,
    } = require("../index");
    const local = path.join(__dirname, '..', 'local');
    var mj = new MerkleJson();

    it("TESTTESTGuidStore(opts) creates an asset GuidStore", function() {
        var store = new GuidStore();
        should(store.storePath).equal(path.join(local, 'guid-store'));
        should(fs.existsSync(store.storePath)).equal(true);

        var store = new GuidStore({
            type: 'SoundStore',
            storeName: 'sounds',
        });
        should(store.storePath).equal(path.join(local, 'sounds'));
        should(store.volume).equal('common');
        should(fs.existsSync(store.storePath)).equal(true);
    });
    it("TESTTESTguidPath(guid) returns file path of guid", function() {
        var store = new GuidStore();
        var guid = mj.hash("hello world");
        var guidDir = guid.substring(0,2);
        var commonPath = path.join(local, 'guid-store', 'common', guidDir);
        var dirPath = path.join(commonPath, guid);
        should(store.guidPath(guid,'.gif')).equal(`${dirPath}.gif`);
    });
    it("TESTTESTsignaturePath(signature) returns file path of signature", function() {
        var store = new GuidStore();
        var guid = mj.hash("hello world");
        var guidDir = guid.substring(0,2);
        var dirPath = path.join(local, 'guid-store', 'common', guidDir);
        var sigPath = path.join(dirPath, guid);
        var signature = {
            guid,
        };
        should(store.signaturePath(signature,'.txt')).equal(`${sigPath}.txt`);

        var store = new GuidStore({
            type: 'SoundStore',
            storeName: 'sounds',
            suffix: '.ogg',
        });
        var guid = mj.hash("hello world");
        var commonPath = path.join(local, 'sounds', 'common', guidDir);
        var sigPath = path.join(commonPath, guid);
        var expectedPath = `${sigPath}.ogg`;
        var signature = {
            guid,
        };
        should(store.signaturePath(signature)).equal(expectedPath);
    });


})
