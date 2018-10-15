(typeof describe === 'function') && describe("sutta-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        SuttaStore,
        SuttaCentralApi,
        SuttaCentralId,
        Voice,
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
        var maxseconds = 5;
        this.timeout(maxseconds*1000);
        (async function() { try {
            var store = await new SuttaStore().initialize();
            await store.updateSuttas([
                'thag1.1', 'sn39.1-15', 'sn12.93', 'an6.170-649', 
                'sn1.8', 'mn1','an1.1-10']);

            var thag1_1path = path.join(ROOT, 'kn/en/sujato-walton/thag1.1.json');
            should(fs.existsSync(thag1_1path));
            var stat = fs.statSync(thag1_1path);
            var age = Date.now() - stat.mtime;
            should(age).below(maxseconds*1000);

            var sn1_8path = path.join(ROOT, 'sn/en/sujato/sn1.8.json');
            should(fs.existsSync(sn1_8path));
            var stat = fs.statSync(sn1_8path);
            var age = Date.now() - stat.mtime;
            should(age).below(maxseconds*1000);

            var mn1path = path.join(ROOT, 'mn/en/sujato/mn1.json');
            should(fs.existsSync(mn1path));
            var stat = fs.statSync(mn1path);
            var age = Date.now() - stat.mtime;
            should(age).below(maxseconds*1000);

            var an1path = path.join(ROOT, 'an/en/sujato/an1.1-10.json');
            should(fs.existsSync(an1path));
            var stat = fs.statSync(an1path);
            var age = Date.now() - stat.mtime;
            should(age).below(maxseconds*1000);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsearch(pattern) returns search results", function(done) {
        (async function() { try {
            var voice = Voice.createVoice({
                name: 'raveena',
                languageUnknown: 'pli',
                usage: 'recite',
            });
            var store = await new SuttaStore({
                voice,
            }).initialize();

            // multiple results
            var {
                method,
                results,
            } = await store.search('is the root of suffering');
            should(results).instanceOf(Array);
            should(method).equal('phrase');
            should.deepEqual(results.map(r=>r.count), [5, 3, 2, 1]);
            should.deepEqual(results.map(r=>r.uid), [
                'sn42.11', 'mn105', 'mn1', 'mn66']);
            should.deepEqual(results.map(r=>r.author_uid), [
                'sujato', 'sujato', 'sujato', 'sujato', ]);
            should.deepEqual(results.map(r=>r.suttaplex.acronym), [
                'SN 42.11', 'MN 105', 'MN 1', 'MN 66', ]);
            should(results[0].quote.en).match(/desire is the root of suffering/);
            should(results[1].quote.en).match(/attachment is the root of suffering/);
            should(results[2].quote.en).match(/relishing is the root of suffering/);
            should(results[3].quote.en).match(/attachment is the root of suffering/);
            var jsonPath = path.join(__dirname, '../public/search/test');
            fs.writeFileSync(jsonPath, JSON.stringify(results, null, 2));

            // regular expression
            var {
                method,
                results,
            } = await store.search('is.*root.*suffering');
            should(results).instanceOf(Array);
            should(method).equal('phrase');
            should.deepEqual(results.map(r=>r.count), [5, 3, 2, 1, 1]);
            should.deepEqual(results.map(r=>r.uid), [
                'sn42.11', 'mn105', 'mn1', 'sn12.51', 'mn66']);

            // multiple spaces
            var {
                method,
                results,
            } = await store.search('adorned is');
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.count), [1, 1, 1]);
            should.deepEqual(results.map(r=>r.uid), [
                'thag20.1', 'thag17.3', 'thag16.4', ]);
            should(results[0].quote.en).match(/body all adorned  Is enough/);
            should(results[1].quote.en).match(/body all adorned  Is enough/);
            should(results[2].quote.en).match(/body all adorned  Is enough/);

            // no results
            var {
                method,
                results,
            } = await store.search('not-in-suttas');
            should(results.length).equal(0);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsearch(pattern) finds metadata", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // author
            var {
                method,
                results,
            } = await store.search('jessica walton',3);
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.count), [3, 3, 3]);
            should.deepEqual(results.map(r=>r.uid), [
                'thag9.1', 'thag8.3', 'thag8.2', ]);
            should.deepEqual(results.map(r=>r.author_uid), [
                'sujato-walton', 'sujato-walton', 'sujato-walton']);

            // no metadata
            var {
                method,
                results,
            } = await store.search({
                pattern: 'jessica walton',
                searchMetadata: false,
            });
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.count), []);
            var {
                method,
                results,
            } = await store.search({
                pattern: 'root of suffering',
                searchMetadata: false,
            });
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.count), [5,3,2,1,1]);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("sanitizePattern(pattern) prevents code injection attacks", function() {
        var testPattern = (pattern,expected) => {
            should(SuttaStore.sanitizePattern(pattern)).equal(expected);
        }
        testPattern('root of suffering', 'root +of +suffering');
        testPattern('"doublequote"', '.doublequote.');
        testPattern("'singlequote'", '.singlequote.');
        testPattern("a\nb\n\r\n\rc", 'a +b +c');
        testPattern("a\tb\t\t\rc", 'a +b +c');
        testPattern("a$b", 'a$b');
        testPattern("a.b", 'a.b');
        testPattern("a.*b", 'a.*b');
        testPattern("a\\'b", 'a\\.b');
        testPattern("a.+b", 'a.+b');
        testPattern("a\u0000b", 'ab');
        testPattern("a\u0001b", 'ab');
        testPattern("a\u007Fb", 'ab');
        testPattern("sattānaṃ", "sattānaṃ");
        should.throws(() => SuttaStore.sanitizePattern("not [good"));
    });
    it("search(pattern) is sanitized", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var {
                method,
                results,
            } = await store.search('"`echo doublequote`"');
            should(results.length).equal(0);
            var {
                method,
                results,
            } = await store.search("'`echo singlequote`'");
            should(results.length).equal(0);
            var {
                method,
                results,
            } = await store.search("${PATH}");
            should(results.length).equal(0);
            var {
                method,
                results,
            } = await store.search("is\tthe\rroot\nof\nsuffering");
            should.deepEqual(results.map(r=>r.uid), [
                'sn42.11', 'mn105', 'mn1', 'mn66']);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("search(pattern) handles long text", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var longstring = new Array(100).fill("abcdefghijklmnopqrstuvwxyz").join(" ");
            await store.search(longstring);
            done(new Error("expected failure"));
        } catch(e) {
            if (/text too long/.test(e.message)) {
                done();
            } else {
                done(e);
            }
        } })();
    });
    it("search(pattern) handles invalid regexp", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            await store.search("not[good");
            done(new Error("expected failure"));
        } catch(e) {
            if (/Invalid regular expression/.test(e.message)) {
                done();
            } else {
                done(e);
            }
        } })();
    });
    it("TESTTESTsearch(pattern) returns voice guid", function(done) {
        this.timeout(10*1000);
        (async function() { try {
            var voice = Voice.createVoice({
                language: 'en',
                languageUnknown: 'pli',
                usage: 'recite',
            });
            var store = await new SuttaStore({
                voice,
            }).initialize();

            var {
                method,
                results,
            } = await store.search('root of suffering');
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.count), [5,3,2,1,1]);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsearch(pattern) sorts by numeric count", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var {
                method,
                results,
            } = await store.search('Sāriputta');
            // numerical sort has 174 greater than 90
            // standard sort has 90 greater than 174
            should.deepEqual(results.map(r=>r.count), [174,90,87,80,71]);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsearch(pattern) performs keyword search", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var expected = [{
                count: 6,
                uid: 'mn77',
            },{
                count: 4,
                uid: 'dn16',
            },{
                count: 4,
                uid: 'an10.29',
            },{
                count: 3,
                uid: 'mn99',
            },{
                count: 3,
                uid: 'mn75',
            }];
            var {
                method,
                results,
            } = await store.search('blue yellow');
            should.deepEqual(results.map(r=> ({
                uid:r.uid,
                count:r.count,
            })), expected);
            var {
                method,
                results,
            } = await store.search('yellow blue');
            should.deepEqual(results.map(r=> ({
                uid:r.uid,
                count:r.count,
            })), expected);
            done(); 
        } catch(e) {done(e);} })();
    });

})
