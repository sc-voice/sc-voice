(typeof describe === 'function') && describe("polly", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SuttaStore,
        SuttaCentralApi,
    } = require("../index");
    const LANG = 'en';
    const ROOT = path.join(__dirname, '..', 'local', 'suttas');
    it("TESTTESTinitialize() initializes SuttaStore", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            should(store.suttaCentralApi).instanceOf(SuttaCentralApi);
            should(store.root).equal(ROOT);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsuttaPath(opts) returns sutta filepath", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var spath = store.suttaPath('mn1','en','test');
            should(spath).equal(path.join(ROOT,'mn/en/test/mn1.json'));
            var dir = path.dirname(spath);
            should(fs.existsSync(dir)).equal(true);

            // folder path will be created as required
            fs.rmdirSync(dir);
            should(fs.existsSync(dir)).equal(false);
            var dir = path.dirname(store.suttaPath('mn1','en','test'));
            should(fs.existsSync(dir)).equal(true);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsuttaPath(opts) throws Error", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            should.throws(() => store.suttaPath()); 
            should.throws(() => store.suttaPath({
                // sutta_uid: 'MN 1',
                language: 'en',
                author_id: 'sujato',
            })); 
            should.throws(() => store.suttaPath('mn1')); 
            should.throws(() => store.suttaPath('mn1', 'en')); 
            should.throws(() => store.suttaPath('abcdef','en','sujato')); 
            should.throws(() => store.suttaPath({
                sutta_uid: 'MN 1',
                language: 'en',
                // author_id: 'sujato',
            })); 
            done(); 
        } catch(e) {done(e);} })();
    });

})
