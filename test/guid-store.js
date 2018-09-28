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

    it("GuidStore(opts) creates an asset GuidStore", function() {
        var store = new GuidStore();
        should(store.storePath).equal(path.join(local, 'guid-store'));
        should(fs.existsSync(store.storePath)).equal(true);

        var store = new GuidStore({
            type: 'SoundStore',
            storeName: 'sounds',
        });
        should(store.storePath).equal(path.join(local, 'sounds'));
        should(fs.existsSync(store.storePath)).equal(true);
    });
    it("guidPath(guid) returns file path of guid", function() {
        var store = new GuidStore();
        var guid = mj.hash("hello world");
        var dirPath = path.join(local, 'guid-store', guid.substring(0,2), guid);
        should(store.guidPath(guid,'.gif')).equal(`${dirPath}.gif`);
    });
    it("signaturePath(signature) returns file path of signature", function() {
        var store = new GuidStore();
        var guid = mj.hash("hello world");
        var dirPath = path.join(local, 'guid-store', guid.substring(0,2), guid);
        var signature = {
            guid,
        };
        should(store.signaturePath(signature,'.txt')).equal(`${dirPath}.txt`);

        var store = new GuidStore({
            type: 'SoundStore',
            storeName: 'sounds',
            suffix: '.ogg',
        });
        var guid = mj.hash("hello world");
        var dirPath = path.join(local, 'sounds', guid.substring(0,2), guid);
        var expectedPath = `${dirPath}.ogg`;
        var signature = {
            guid,
        };
        should(store.signaturePath(signature)).equal(expectedPath);
    });


})
