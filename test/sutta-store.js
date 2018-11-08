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
    const MAXRESULTS = 5;

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
    it("search(pattern) returns search results", function(done) {
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
            fs.writeFileSync(jsonPath, JSON.stringify({
                method,
                results,
            }, null, 2));

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
    it("search(pattern) finds metadata", function(done) {
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
    it("search(pattern) returns voice guid", function(done) {
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
    it("search(pattern) sorts by numeric count", function(done) {
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
    it("search(pattern) performs keyword search", function(done) {
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
            should(method).equal('keywords');
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
            should(results[0].quote.en).match(/blue, with blue color/);
            should(results[1].quote.en).match(/clad in blue, adorned with blue/);
            should(results[2].quote.en).match(/the meditation on universal blue/);
            should(results[3].quote.en).match(/or blue, yellow, red, or magenta/);
            should(results[4].quote.en).match(/or blue, yellow, red, or magenta/);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("paliPattern(pattern) should return the Pali pattern", function(){
        should(SuttaStore.paliPattern("jhana")).equal('jh(a|ā)(n|ṅ|ñ|ṇ)(a|ā)');
        should(SuttaStore.paliPattern("abcdefghijklmn"))
        .equal('(a|ā)bcdefgh(i|ī)jk(l|ḷ)(m|ṁ)(n|ṅ|ñ|ṇ)')
        should(SuttaStore.paliPattern("nopqrstuvwxyz"))
        .equal('(n|ṅ|ñ|ṇ)opqrst(u|ū)vwxyz');
        should(SuttaStore.paliPattern("[abcdefghijklmnopqrstuvwxyz]"))
        .equal('[abcdefghijklmnopqrstuvwxyz]');
    });
    it("search(pattern) finds romanized Pali keywords ", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var {
                method,
                results,
                resultPattern,
            } = await store.search('jhana');
            should(method).equal('keywords');
            should.deepEqual(results.map(r=> ({
                uid:r.uid,
                count:r.count,
            })), [{
                count: 20,
                uid: 'thag16.7',
            },{
                count: 17,
                uid: 'an9.36',
            },{
                count: 16,
                uid: 'mn108',
            },{
                count: 16,
                uid: 'an6.60',
            },{
                count: 15,
                uid: 'dn33',
            }]);
            should(resultPattern).equal('\\bjh(a|ā)(n|ṅ|ñ|ṇ)(a|ā)');

            var {
                method,
                results,
            } = await store.search('third jhana');
            should(method).equal('keywords');
            should.deepEqual(results.map(r=> ({
                uid:r.uid,
                count:r.count,
            })), [{
                count: 15,
                uid: 'dn33',
            },{
                count: 9,
                uid: 'dn34',
            },{
                count: 7,
                uid: 'mn85',
            },{
                count: 7,
                uid: 'sn40.3',
            },{
                count: 5,
                uid: 'mn77',
            }]);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("compareSuttaUids(a,b) compares sutta file names", function(){
        // Standalone 
        should(SuttaStore.compareSuttaUids('mn33', 'mn33')).equal(0);
        should(SuttaStore.compareSuttaUids('mn33', 'mn34')).equal(-1);
        should(SuttaStore.compareSuttaUids('mn34', 'mn33')).equal(1);

        // collection
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn22.1', 
            'an/en/sujato/an22.1')).equal(1);
        should(SuttaStore.compareSuttaUids(
            'an/en/sujato/an22.1', 
            'sn/en/sujato/sn22.1')).equal(-1);
        should(SuttaStore.compareSuttaUids(
            'xx/en/sujato/sn22.1', 
            'xx/en/sujato/an22.1')).equal(1);
        should(SuttaStore.compareSuttaUids(
            'xx/en/sujato/an22.1', 
            'xx/en/sujato/sn22.1')).equal(-1);

        // major number
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.1', 
            'sn/en/sujato/sn22.1')).equal(7);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn22.1', 
            'sn/en/sujato/sn29.1')).equal(-7);

        // subchapter numbering
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn30.1', 
            'sn/en/sujato/sn30.2')).equal(-1);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.1', 
            'sn/en/sujato/sn29.10')).equal(-9);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.10', 
            'sn/en/sujato/sn29.1')).equal(9);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.1', 
            'sn/en/sujato/sn29.11-20')).equal(-10);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.11-20', 
            'sn/en/sujato/sn29.1')).equal(10);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.10', 
            'sn/en/sujato/sn29.11-20')).equal(-1);
        should(SuttaStore.compareSuttaUids(
            'sn/en/sujato/sn29.11-20', 
            'sn/en/sujato/sn29.10')).equal(1);

        // ranges
        should(SuttaStore.compareSuttaUids('sn29.11-20', 'sn29.11-20')).equal(0);
        should(SuttaStore.compareSuttaUids('sn29.11-20', 'sn29.10')).equal(1);
        should(SuttaStore.compareSuttaUids('sn29.11-20', 'sn29.11')).equal(0);
        should(SuttaStore.compareSuttaUids('sn29.11-20', 'sn29.12')).equal(-1);
        should(SuttaStore.compareSuttaUids('sn29.21', 'sn29.20')).equal(1);
        should(SuttaStore.compareSuttaUids('sn29.21', 'sn29.21')).equal(0);
        should(SuttaStore.compareSuttaUids('sn29.21', 'sn29.22')).equal(-1);

        should(SuttaStore.compareSuttaUids("an1.1-10", "an1.1-10")).equal(0);
        should(SuttaStore.compareSuttaUids("an1.1", "an1.1-10")).equal(0);

    });
    it("sutta_uidSuccessor(sutta_uid) returns following sutta_uid", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            should(store.sutta_uidSuccessor('mn33',true)).equal('mn34');
            should(store.sutta_uidSuccessor('mn33',false)).equal('mn34');
            should(store.sutta_uidSuccessor('sn29.10-21',true)).equal('sn29.22');
            should(store.sutta_uidSuccessor('sn29.10-21')).equal('sn30.1');
            should(store.sutta_uidSuccessor('sn29.10-21',false)).equal('sn30.1');
            should(store.sutta_uidSuccessor('thag16.1')).equal('thag16.2');
            should(store.sutta_uidSuccessor('thag16.1-10')).equal('thag17.1');
            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsuttaList(pattern) finds sutta file", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            var suttas = SuttaCentralId.supportedSuttas;
            should(store.suttaFile(suttas[0])).equal(suttas[0]);
            var last = suttas[suttas.length-1];
            should(store.suttaFile(last)).equal(last);

            should(store.suttaFile("sn29.1")).equal("sn29.1");
            should(store.suttaFile("sn29.10")).equal("sn29.10");
            should(store.suttaFile("sn29.11")).equal("sn29.11-20");
            should(store.suttaFile("sn29.12")).equal("sn29.11-20");
            should(store.suttaFile("sn29.19")).equal("sn29.11-20");
            should(store.suttaFile("sn29.20")).equal("sn29.11-20");
            should(store.suttaFile("sn29.21")).equal("sn29.21-50");
            should(store.suttaFile("sn29.49")).equal("sn29.21-50");
            should(store.suttaFile("sn29.50")).equal("sn29.21-50");
            should(store.suttaFile("mn33")).equal("mn33");

            // bounds
            should(store.suttaFile("sn29.51")).equal(null);
            should(store.suttaFile("z999")).equal(null);
            should(store.suttaFile("a1")).equal(null);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTisUidPattern(pattern) is true for sutta_uid patterns", function() {
        // valid collection with a number
        should(SuttaStore.isUidPattern('mn2000')).equal(true);
        should(SuttaStore.isUidPattern('an1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20')).equal(true);
        should(SuttaStore.isUidPattern('mn8-11')).equal(true);
        should(SuttaStore.isUidPattern('mn8-11,mn9-12')).equal(true);

        // not a sutta_uid pattern
        should(SuttaStore.isUidPattern('red')).equal(false);
        should(SuttaStore.isUidPattern('a1')).equal(false);
        should(SuttaStore.isUidPattern('thig')).equal(false);
        should(SuttaStore.isUidPattern('mn')).equal(false);
        should(SuttaStore.isUidPattern('mn01')).equal(false);

        // lists
        should(SuttaStore.isUidPattern('sn22-25')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20,mn1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20   ,   mn1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20,red')).equal(false);
        should(SuttaStore.isUidPattern('red,sn22.1-20,mn1')).equal(false);
        should(SuttaStore.isUidPattern('sn22.1-20    ,   red')).equal(false);
        should(SuttaStore.isUidPattern('red,sn22.1-20')).equal(false);
    });
    it("TESTTESTsuttaList(pattern) finds listed suttas", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            should.deepEqual( store.suttaList(
                ['sn29']), // implied sub-chapters
                ['sn29.1', 'sn29.2', 'sn29.3', 'sn29.4', 'sn29.5',
                    'sn29.6', 'sn29.7', 'sn29.8', 'sn29.9', 'sn29.10',
                    'sn29.11-20', 'sn29.21-50', ]);
            should.deepEqual( store.suttaList(
                ['SN28.8-10']), // sub-chapter range (exact)
                ['sn28.8', 'sn28.9', 'sn28.10']);
            should.deepEqual( store.suttaList(
                ['sn28.8-999']), // sub-chapter range (right over)
                ['sn28.8', 'sn28.9', 'sn28.10']);
            should.deepEqual( store.suttaList(
                ['sn29.1', 'mn33', 'SN29.2']), // order as entered
                ['sn29.1', 'mn33', 'sn29.2']);
            should.deepEqual( store.suttaList(
                ['sn29.1', 'sn29.12', 'sn29.2']), // within range
                ['sn29.1', 'sn29.11-20', 'sn29.2']);
            should.deepEqual( store.suttaList(
                'sn29.1, sn29.12, sn29.2'), // String
                ['sn29.1', 'sn29.11-20', 'sn29.2']);
            should.deepEqual( store.suttaList(
                ['sn29.9-11']), // expand sub-chapter range
                ['sn29.9', 'sn29.10', 'sn29.11-20']);
            should.deepEqual( store.suttaList(
                ['sn29.1', 'sn29.1', 'sn29.2']), // duplicates
                ['sn29.1', 'sn29.1', 'sn29.2']);

            should.deepEqual(store.suttaList(
                ['MN9-11']), // major number range
                ['mn9','mn10','mn11']); 
            should.deepEqual(store.suttaList(
                ['mn9-11', 'mn10-12']), // major number range
                ['mn9','mn10','mn11','mn10','mn11','mn12']); 

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTsearch(pattern) finds suttas in range", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            var data = await store.search({ pattern: 'sn29.9-999', });
            should.deepEqual(data.results.map(r=>r.uid),
                ['sn29.9', 'sn29.10', 'sn29.11-20', 'sn29.21-50']);
            should(data.results.length).equal(4);
            should(data.method).equal('sutta_uid');

            // maxResults
            var data = await store.search({ pattern: 'sn29', });
            should.deepEqual(data.results.map(r=>r.uid),
                ['sn29.1', 'sn29.2', 'sn29.3', 'sn29.4', 'sn29.5']);
            should(data.results.length).equal(MAXRESULTS);
            should(data.method).equal('sutta_uid');

            done(); 
        } catch(e) {done(e);} })();
    });

})
