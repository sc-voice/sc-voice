(typeof describe === 'function') && describe("sutta-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SuttaStore,
        SuttaCentralApi,
        SuttaCentralId,
    } = require("../index");
    const LANG = 'en';
    const LOCAL = path.join(__dirname, '..', 'local');
    const ROOT = path.join(LOCAL, 'suttas');

    it("initialize() initializes SuttaStore", function(done) {
        (async function() { try {
            var store = new SuttaStore();
            should(store.isInitialized).equal(false);
            should(await store.initialize()).equal(store);
            should(store.suttaCentralApi).instanceOf(SuttaCentralApi);
            should(store.root).equal(ROOT);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("suttaPath(opts) returns sutta filepath", function(done) {
        (async function() { try {
            if (1) {
                var suttaIdsPath = path.join(__dirname, '../src/node/sutta-ids.json');

                var json = JSON.parse(fs.readFileSync(suttaIdsPath));
                json.sort((a,b) => SuttaCentralId.compare(a,b));
                fs.writeFileSync(suttaIdsPath, JSON.stringify(json, null, 2));
            }

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

            // opts.suttaIds controls suttaPath
            var suttaIds = [
                "an1.1-5",
            ];
            var store = await new SuttaStore({
                suttaIds,
            }).initialize();
            var spath = store.suttaPath('an1.1','en','test');
            should(spath).equal(path.join(ROOT,'an/en/test/an1.1-5.json'));

            // src/node/sutta-ids.json controls suttaPath
            var store = await new SuttaStore().initialize();
            var spath = store.suttaPath('an1.3','en','test');
            should(spath).equal(path.join(ROOT,'an/en/test/an1.1-10.json'));

            done(); 
        } catch(e) {done(e);} })();
    });
    it("suttaPath(opts) throws Error", function(done) {
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
    it("collectionIterator(collection) creates iterator", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var iter = store.collectionIterator();
            should.deepEqual(iter.next(), {
                value: 0,
                done: false,
            });
            should.deepEqual(iter.next(), {
                value: 1,
                done: false,
            });
            done(); 
        } catch(e) {done(e);} })();
    });
    it("updateSuttas(ids) updates suttas from SuttaCentral", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            await store.updateSuttas(['sn1.8', 'mn1','an1.1-10']);

            var sn1_8path = path.join(ROOT, 'sn/en/sujato/sn1.8.json');
            should(fs.existsSync(sn1_8path));
            var stat = fs.statSync(sn1_8path);
            var age = Date.now() - stat.mtime;
            should(age).below(1000);

            var mn1path = path.join(ROOT, 'mn/en/sujato/mn1.json');
            should(fs.existsSync(mn1path));
            var stat = fs.statSync(mn1path);
            var age = Date.now() - stat.mtime;
            should(age).below(1000);

            var an1path = path.join(ROOT, 'an/en/sujato/an1.1-10.json');
            should(fs.existsSync(an1path));
            var stat = fs.statSync(an1path);
            var age = Date.now() - stat.mtime;
            should(age).below(1000);

            done(); 
        } catch(e) {done(e);} })();
    });

})
