(typeof describe === 'function') && describe("sutta-store", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        Playlist,
        Sutta,
        SuttaFactory,
        SuttaStore,
        SuttaCentralApi,
        SuttaCentralId,
        Voice,
    } = require("../index");
    const LANG = 'en';
    const LOCAL = path.join(__dirname, '..', 'local');
    const ROOT = path.join(LOCAL, 'suttas');
    const MAXRESULTS = 5;
    const SCAPI_2019 = {
        apiUrl: 'http://staging.suttacentral.net/api',
    };
    function checkSuttas(data) {
        should(data.suttas.length).equal(data.suttaRefs.length);
        for (var i = 0; i < data.suttaRefs.length; i++) {
            var refParts = data.suttaRefs[i].split('/');
            var sutta = data.suttas[i];
            should(sutta).instanceOf(Sutta);
            should(sutta.sutta_uid).equal(refParts[0]);
            should(sutta.translation.lang).equal(refParts[1]);
            should(sutta.translation.author_uid).equal(refParts[2]);
        }
    }

    it("initialize() initializes SuttaStore", function(done) {
        (async function() { try {
            var store = new SuttaStore();
            should(store.maxDuration).equal(3*60*60);
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
                json.sort((a,b) => SuttaCentralId.compareLow(a,b));
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
                "an1.1-10",
            ];
            var store = await new SuttaStore({
                suttaIds,
            }).initialize();
            var spath = store.suttaPath('an1.1','en','test');
            should(spath).equal(path.join(ROOT,'an/en/test/an1.1-10.json'));

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
                'thag1.1', 'sn39.1-15', 
                'sn1.8', 'mn1','an1.1-10']);

            /*
            var thag1_1path = path.join(ROOT, 'kn/en/sujato-walton/thag1.1.json');
            should(fs.existsSync(thag1_1path));
            var stat = fs.statSync(thag1_1path);
            var age = Date.now() - stat.mtime;
            should(age).below(maxseconds*1000);
            */

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
    it("search('thig1.1') returns segmented sutta", function(done) {
        (async function() { try {
            var voice = Voice.createVoice({
                name: 'raveena',
                languageUnknown: 'pli',
                usage: 'recite',
            });
            var suttaCentralApi = await new SuttaCentralApi(SCAPI_2019).initialize();
            this.suttaFactory = new SuttaFactory({
                suttaCentralApi,
                autoSection: true,
            });
            var store = await new SuttaStore({
                suttaCentralApi,
                suttaFactory,
                voice,
            }).initialize();

            // multiple results
            var {
                method,
                results,
            } = await store.search('thig1.1');
            should(results).instanceOf(Array);
            should(method).equal('sutta_uid');
            should.deepEqual(results.map(r=>r.count), [1]);
            should.deepEqual(results.map(r=>r.uid), ['thig1.1']);
            should.deepEqual(results.map(r=>r.author_uid), [
                'sujato']);
            should.deepEqual(results.map(r=>r.suttaplex.acronym), [
                'Thig 1.1']);
            should(results[0].quote.en).match(/The Book of the Ones/);
            should(results[0].nSegments).equal(9);
            var sutta = results[0].sutta;
            should(sutta.sutta_uid).equal('thig1.1');
            should(sutta.author_uid).equal('sujato');
            should.deepEqual(sutta.segments[0],{
                en: 'Verses of the Senior Nuns',
                pli: 'Therīgāthā',
                scid: 'thig1.1:1.1',
            });
            var sections = sutta.sections;
            should.deepEqual(sections[0].segments[0],{
                en: 'Verses of the Senior Nuns',
                pli: 'Therīgāthā',
                scid: 'thig1.1:1.1',
            });
            should(sections.length).equal(3);
            should.deepEqual(sections.map(s => s.segments.length), [1,1,7,]);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("search(pattern) returns search results", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var voice = Voice.createVoice({
                name: 'raveena',
                languageUnknown: 'pli',
                usage: 'recite',
            });
            var suttaCentralApi = await new SuttaCentralApi(SCAPI_2019).initialize();
            var store = await new SuttaStore({
                suttaCentralApi,
                voice,
            }).initialize();

            // multiple results
            var {
                method,
                results,
            } = await store.search('is the root of suffering');
            should(results).instanceOf(Array);
            should.deepEqual(Object.keys(results[0]).sort(), [
                'count', 'uid', 'author', 'author_short', 'author_uid',
                'author_blurb', 'lang', 'nSegments', 'title', 'collection_id',
                'suttaplex', 'quote', 'sutta', 'audio',
            ].sort());
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
                'sn42.11', 'mn105', 'mn1', 'mn66', 'an4.257']);

            // multiple spaces
            var {
                method,
                results,
            } = await store.search('quandary with');
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.uid), [
                'sn35.245', 
            ]);
            should.deepEqual(results.map(r=>r.count), [1, ]);
            should(results[0].quote.en).match(/simile of the vipers/i);

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
            should.deepEqual(results.map(r=>r.uid), [
                'thig9.1', 'thig8.1', 'thig7.3']);
            should.deepEqual(results.map(r=>r.count), [1, 1, 1]);
            should.deepEqual(results.map(r=>r.author_uid), [
                'sujato', 'sujato', 'sujato']);

            // no metadata
            var {
                method,
                results,
            } = await store.search({
                pattern: 'jessica walton',
                searchMetadata: false,
            });
            should(results).instanceOf(Array);
            should.deepEqual(results.map(r=>r.uid), [
                'thig9.1', 'thig8.1', 'thig7.3', 'thig7.2', 'thig7.1',
                ]);
            should.deepEqual(results.map(r=>r.count), [1,1,1,1,1]);
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
        testPattern('"doublequote"', '.doublequote.');
        testPattern("'singlequote'", '.singlequote.');
        testPattern("a$b", 'a$b');
        testPattern("a.b", 'a.b');
        testPattern("a.*b", 'a.*b');
        testPattern("a\\'b", 'a\\.b');
        testPattern("a\u0000b", 'ab');
        testPattern("a\u0001b", 'ab');
        testPattern("a\u007Fb", 'ab');
        testPattern("sattānaṃ", "sattānaṃ");
        should.throws(() => SuttaStore.sanitizePattern("not [good"));
    });
    it("normalizePattern(pattern) prevents code injection attacks", function() {
        var testPattern = (pattern,expected) => {
            should(SuttaStore.normalizePattern(pattern)).equal(expected);
        }
        testPattern('root of suffering', 'root +of +suffering');
        testPattern("a\nb\n\r\n\rc", 'a +b +c');
        testPattern("a\tb\t\t\rc", 'a +b +c');
        testPattern("a$b", 'a$b');
        testPattern("a.b", 'a.b');
        testPattern("a.*b", 'a.*b');
        testPattern("a.+b", 'a.+b');
        testPattern("sattānaṃ", "sattānaṃ");
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
            should.deepEqual(results.map(r=>r.count), [174,92,87,80,71]);
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
                uid: 'an10.29',
            },{
                count: 4,
                uid: 'dn16',
            },{
                count: 3,
                uid: 'dn33',
            },{
                count: 3,
                uid: 'dn34',
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
            should(results[1].quote.en).match(/the meditation on universal blue/);
            should(results[2].quote.en).match(/clad in blue/);
            should(results[3].quote.en).match(/Not perceiving form/);
            done(); 
        } catch(e) {done(e);} })();
    });
    it("paliPattern(pattern) should return the Pali pattern", function(){
        should(SuttaStore.paliPattern("jhana")).equal('jh(a|ā)(n|ṅ|ñ|ṇ)(a|ā)');
        should(SuttaStore.paliPattern("abcdefghijklmn"))
        .equal('(a|ā)bc(d|ḍ)efgh(i|ī)jk(l|ḷ)(m|ṁ|ṃ)(n|ṅ|ñ|ṇ)')
        should(SuttaStore.paliPattern("nopqrstuvwxyz"))
        .equal('(n|ṅ|ñ|ṇ)opqrs(t|ṭ)(u|ū)vwxyz');
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
                count: 17,
                uid: 'an9.36',
            },{
                count: 16,
                uid: 'an6.60',
            },{
                count: 16,
                uid: 'mn108',
            },{
                count: 15,
                uid: 'dn33',
            },{
                count: 12,
                uid: 'an9.35',
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
                uid: 'an9.39',
            }]);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("sutta_uidSuccessor(sutta_uid) returns following sutta_uid", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // logical
            should(store.sutta_uidSuccessor('mn33',true)).equal('mn34');
            should(store.sutta_uidSuccessor('sn29.10-21',true)).equal('sn29.22');
            should(store.sutta_uidSuccessor('sn29.10-21')).equal('sn30.1');

            should(store.sutta_uidSuccessor('mn33',false)).equal('mn34');
            should(store.sutta_uidSuccessor('sn29.10-21',false)).equal('sn30.1');
            should(store.sutta_uidSuccessor('thag16.1')).equal('thag16.2');
            should(store.sutta_uidSuccessor('thag16.1-10')).equal('thag17.1');
            done(); 
        } catch(e) {done(e);} })();
    });
    it("supportedSutta(pattern) return supported sutta uid", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            var suttas = SuttaCentralId.supportedSuttas;
            should(store.supportedSutta(suttas[0])).equal(suttas[0]);
            var last = suttas[suttas.length-1];
            should(store.supportedSutta(last)).equal(last);

            should(store.supportedSutta("sn29.1")).equal("sn29.1");
            should(store.supportedSutta("sn29.10")).equal("sn29.10");
            should(store.supportedSutta("sn29.11")).equal("sn29.11-20");
            should(store.supportedSutta("sn29.12")).equal("sn29.11-20");
            should(store.supportedSutta("sn29.19")).equal("sn29.11-20");
            should(store.supportedSutta("sn29.20")).equal("sn29.11-20");
            should(store.supportedSutta("sn29.21")).equal("sn29.21-50");
            should(store.supportedSutta("sn29.49")).equal("sn29.21-50");
            should(store.supportedSutta("sn29.50")).equal("sn29.21-50");
            should(store.supportedSutta("mn33")).equal("mn33");

            // bounds
            should(store.supportedSutta("sn29.51")).equal(null);
            should(store.supportedSutta("z999")).equal(null);
            should(store.supportedSutta("a1")).equal(null);

            // fully specified suttas
            should(store.supportedSutta("mn1/en/sujato")).equal("mn1");
            should(store.supportedSutta("mn1/en/bodhi")).equal("mn1");

            done(); 
        } catch(e) {done(e);} })();
    });
    it("isUidPattern(pattern) is true for sutta_uid patterns", function() {
        // unsupported sutta
        should(SuttaStore.isUidPattern('t1670b2.8')).equal(true);

        // fully specified sutta
        should(SuttaStore.isUidPattern('mn1/en/sujato')).equal(true);
        should(SuttaStore.isUidPattern('mn1/en/sujato,mn1/en/bodhi')).equal(true);

        // valid collection with a number
        should(SuttaStore.isUidPattern('mn2000')).equal(true);
        should(SuttaStore.isUidPattern('an1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20')).equal(true);
        should(SuttaStore.isUidPattern('mn8-11')).equal(true);
        should(SuttaStore.isUidPattern('mn8-11,mn9-12')).equal(true);

        // unknown but valid sutta 
        should(SuttaStore.isUidPattern('a1')).equal(true);
        should(SuttaStore.isUidPattern('mn01')).equal(true);

        // not a sutta_uid pattern
        should(SuttaStore.isUidPattern('red')).equal(false);
        should(SuttaStore.isUidPattern('thig')).equal(false);
        should(SuttaStore.isUidPattern('mn')).equal(false);

        // lists
        should(SuttaStore.isUidPattern('mn1, mn2')).equal(true);
        should(SuttaStore.isUidPattern('sn22-25')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20,mn1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20   ,   mn1')).equal(true);
        should(SuttaStore.isUidPattern('sn22.1-20,red')).equal(false);
        should(SuttaStore.isUidPattern('red,sn22.1-20,mn1')).equal(false);
        should(SuttaStore.isUidPattern('sn22.1-20    ,   red')).equal(false);
        should(SuttaStore.isUidPattern('red,sn22.1-20')).equal(false);
    });
    it("expandRange(item) expands range", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            should.deepEqual(store.expandRange('an5.179').length,1);

            // no subchapters
            should.deepEqual(store.expandRange('mn50'), [
                'mn50' ]);
            should.deepEqual(store.expandRange('mn1-3'), [
                'mn1', 'mn2', 'mn3', ]);

            // subchapters
            should.deepEqual(store.expandRange('sn50'), [
                'sn50.1-12',
                'sn50.13-22',
                'sn50.23-34',
                'sn50.35-44',
                'sn50.45-54',
                'sn50.55-66',
                //'sn50.67-76',
                'sn50.77-88',
                'sn50.89-98',
                'sn50.99-108',
            ]);
            should.deepEqual(store.expandRange('sn50.2-11'), [
                'sn50.1-12']);
            should.deepEqual(store.expandRange('sn50.2-21'), [
                'sn50.1-12', 
                'sn50.13-22']);
            should.deepEqual(store.expandRange('an5.179'), [
                'an5.179']);
            should.deepEqual(store.expandRange('an1.2-5'), [
                'an1.1-10']);
            should.deepEqual(store.expandRange('an10.2-5'), [
                'an10.2',
                'an10.3',
                'an10.4',
                'an10.5',
            ]);
            should.deepEqual(store.expandRange('an10.155-158'), [
                'an10.155',
                'an10.156-166',
            ]);

            // subchapters KN
            should.deepEqual(store.expandRange('thig1.13'), [
                'thig1.13',
            ]);
            should.deepEqual(store.expandRange('thig4'), [
                'thig4.1',
            ]);
            should.deepEqual(store.expandRange('thag8'), [
                'thag8.1',
                'thag8.2',
                'thag8.3',
            ]);
            should.deepEqual(store.expandRange('thig1.1-3'), [
                'thig1.1',
                'thig1.2',
                'thig1.3',
            ]);

            // out of range
            should.deepEqual(store.expandRange('mn666'), ['mn152']);
            should.deepEqual(store.expandRange('an666'), ['an11.992-1151']);
            should.deepEqual(store.expandRange('an2.9999'), ['an2.310-479']);

            // errors
            should.throws(() => {
                store.expandRange('da21'); // no collection
            });
            should.throws(() => {
                store.expandRange('snp1.8'); // no collection
            });
            should.throws(() => {
                store.expandRange('kn9'); // no collection
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("expandRange(item) handles fully sutta refs", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            should.deepEqual(store.expandRange('an5.179').length,1);

            // no subchapters
            should.deepEqual(store.expandRange('mn50/en/sujato'), [
                'mn50/en/sujato' ]);
            should.deepEqual(store.expandRange('mn1-3/en/sujato'), [
                'mn1/en/sujato', 'mn2/en/sujato', 'mn3/en/sujato', ]);

            // subchapters
            should.deepEqual(store.expandRange('sn50/en/sujato'), [
                'sn50.1-12/en/sujato',
                'sn50.13-22/en/sujato',
                'sn50.23-34/en/sujato',
                'sn50.35-44/en/sujato',
                'sn50.45-54/en/sujato',
                'sn50.55-66/en/sujato',
                //'sn50.67-76/en/sujato',
                'sn50.77-88/en/sujato',
                'sn50.89-98/en/sujato',
                'sn50.99-108/en/sujato',
            ]);
            should.deepEqual(store.expandRange('sn50.2-11/en/sujato'), [
                'sn50.1-12/en/sujato']);
            should.deepEqual(store.expandRange('sn50.2-21/en/sujato'), [
                'sn50.1-12/en/sujato', 
                'sn50.13-22/en/sujato']);
            should.deepEqual(store.expandRange('an5.179/en/sujato'), [
                'an5.179/en/sujato']);
            should.deepEqual(store.expandRange('an1.2-5/en/sujato'), [
                'an1.1-10/en/sujato']);
            should.deepEqual(store.expandRange('an10.2-5/en/sujato'), [
                'an10.2/en/sujato',
                'an10.3/en/sujato',
                'an10.4/en/sujato',
                'an10.5/en/sujato',
            ]);
            should.deepEqual(store.expandRange('an10.155-158/en/sujato'), [
                'an10.155/en/sujato',
                'an10.156-166/en/sujato',
            ]);

            // subchapters KN
            should.deepEqual(store.expandRange('thig1.13/en/sujato'), [
                'thig1.13/en/sujato',
            ]);
            should.deepEqual(store.expandRange('thig4/en/sujato'), [
                'thig4.1/en/sujato',
            ]);
            should.deepEqual(store.expandRange('thag8/en/sujato'), [
                'thag8.1/en/sujato',
                'thag8.2/en/sujato',
                'thag8.3/en/sujato',
            ]);
            should.deepEqual(store.expandRange('thig1.1-3/en/sujato'), [
                'thig1.1/en/sujato',
                'thig1.2/en/sujato',
                'thig1.3/en/sujato',
            ]);

            // no collection
            should.throws(() => {
                store.expandRange('da21/en/sujato');
            });
            should.throws(() => {
                store.expandRange('snp1.8/en/sujato');
            });
            should.throws(() => {
                store.expandRange('kn9/en/sujato');
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("suttaList(pattern) finds listed suttas", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();

            should.deepEqual( store.suttaList(
                ['sn 45.161']), // spaces
                ['sn45.161']);
            should.deepEqual( store.suttaList(
                ['MN 1-3/en/sujato']), // spaces
                ['mn1/en/sujato', 'mn2/en/sujato', 'mn3/en/sujato']);
            should.deepEqual( store.suttaList(
                ['AN 5.179', 'sn29.1']), // spaces
                ['an5.179', 'sn29.1']);

            should.deepEqual(store.suttaList( 
                ['an10.1-3']),
                ['an10.1', 'an10.2', 'an10.3']);

            should.deepEqual( store.suttaList(
                ['an2.3']), // sub-chapter embedded 
                ['an2.1-10']);
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
            should.deepEqual( store.suttaList(
                ['AN5.179', 'sn29.1']), // spaces
                ['an5.179', 'sn29.1']);

            should.deepEqual(store.suttaList(
                ['MN9-11']), // major number range
                ['mn9','mn10','mn11']); 
            should.deepEqual(store.suttaList(
                ['mn9-11', 'mn10-12']), // major number range
                ['mn9','mn10','mn11','mn10','mn11','mn12']); 

            done(); 
        } catch(e) {done(e);} })();
    });
    it("search(pattern) finds suttas in range", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // spaces
            var data = await store.search({ pattern: 'sn 45.161', });
            should.deepEqual(data.results.map(r=>r.uid), ['sn45.161']);

            // fully specified unsupported
            var data = await store.search({ pattern: 'mn1/en/bodhi', });
            should.deepEqual(data.results.map(r=>r.uid), ['mn1']);
            should.deepEqual(data.results.map(r=>r.lang), ['en']);
            should.deepEqual(data.results.map(r=>r.author_uid), ['bodhi']);
            should.deepEqual(data.results.map(r=>r.sutta.segments.length), [55]);
            should(data.results.length).equal(1);

            // fully specified
            var data = await store.search({ pattern: 'mn1/en/sujato', });
            should.deepEqual(data.results.map(r=>r.uid), ['mn1']);
            should.deepEqual(data.results.map(r=>r.lang), ['en']);
            should.deepEqual(data.results.map(r=>r.author_uid), ['sujato']);
            should.deepEqual(data.results.map(r=>r.sutta.segments.length), [840]);
            should(data.results.length).equal(1);

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
            var result0 = data.results[0];
            should(result0.author).equal('Bhikkhu Sujato');
            should(result0.author_short).equal('Sujato');
            should(result0.author_uid).equal('sujato');
            should(result0.author_blurb.en).match(
                /Translated for SuttaCentral by.*Bhikkhu Sujato/u);
            should(result0.lang).equal('en');
            should(result0.nSegments).equal(9);
            should(result0.title).equal('Plain Version');
            should(result0.collection_id).equal('sn');
            should(result0.suttaplex.acronym).equal('SN 29.1');
            should(result0.suttaplex.uid).equal('sn29.1');
            should(result0.suttaplex.original_title).equal('Suddhika Sutta');
            should(result0.suttaplex.root_lang).equal('pli');

            done(); 
        } catch(e) {done(e);} })();
    });
    it("findSuttas(opts) finds suttas by phrase", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // Search english phrase
            var data = await store.findSuttas({ pattern: 'root of suffering', });
            should(data.method).equal('phrase');
            should.deepEqual(data.suttaRefs, [
                'sn42.11/en/sujato',
                'mn105/en/sujato',
                'mn1/en/sujato',
                'sn56.21/en/sujato',
                'mn66/en/sujato',
            ]);
            checkSuttas(data);


            done(); 
        } catch(e) {done(e);} })();
    });
    it("findSuttas(opts) finds suttas by keywords", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // Search keywords
            var data = await store.findSuttas({ pattern: 'root suffering', });
            should(data.method).equal('keywords');
            should.deepEqual(data.suttaRefs, [
                'dn14/en/sujato',
                'mn9/en/sujato',
                'dn16/en/sujato',
                'dn33/en/sujato',
                'mn22/en/sujato',
            ]);
            checkSuttas(data);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("keywordSearch(...) finds suttas by keywords", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var language = 'en';

            // Search Pali phrase
            var pattern = store.patternKeywords('Anāthapiṇḍika')[0]; 
            var data = await store.keywordSearch({ pattern, language, });
            should(data.lines.length).equal(223);

            // Search Pali phrase
            var pattern = store.patternKeywords('anathapindika')[0]; 
            console.log(pattern);
            var data2 = await store.keywordSearch({ pattern, language, });
            should(data2.lines.length).equal(224); // sn55.30: anāthapiṇḍikā 

            done(); 
        } catch(e) {done(e);} })();
    });
    it("findSuttas(opts) finds by sutta_uid", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var store = await new SuttaStore().initialize();

            // Search sutta uid list
            var data = await store.findSuttas({ pattern: 'mn2,mn1', });
            should(data.method).equal('sutta_uid');
            should.deepEqual(data.suttaRefs, [
                'mn2/en/sujato',
                'mn1/en/sujato',
            ]);
            checkSuttas(data);

            // Search sutta uid range
            var data = await store.findSuttas({ pattern: 'an3', });
            should.deepEqual(data.suttaRefs, [
                'an3.1/en/sujato',
                'an3.2/en/sujato',
                'an3.3/en/sujato',
                'an3.4/en/sujato',
                'an3.5/en/sujato',
            ]);
            checkSuttas(data);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("createPlaylist(opts) creates playlist", function(done) {
        (async function() { try {
            var store = await new SuttaStore().initialize();
            var playlist = await store.createPlaylist({ pattern: 'an3.76-77', });
            should(playlist.tracks.length).equal(4);
            should.deepEqual(
                playlist.tracks.map(track => track.segments[0].scid), [
                'an3.76:0.1',
                'an3.76:1.1',
                'an3.77:0.1',
                'an3.77:1.1',
            ]);
            should.deepEqual(playlist.stats(), {
                tracks: 4,
                chars: {
                    en: 3086,
                    pli: 2370,
                },
                duration: 483,
                segments: {
                    pli: 40,
                    en: 38,
                }
            });

            // Pali only
            var playlist = await store.createPlaylist({ 
                pattern: 'an3.76-77', 
                languages: ['pli'],
            });
            should(playlist.tracks.length).equal(4);
            should.deepEqual(
                playlist.tracks.map(track => track.segments[0].scid), [
                'an3.76:0.1',
                'an3.76:1.1',
                'an3.77:0.1',
                'an3.77:1.1',
            ]);
            should.deepEqual(playlist.stats(), {
                tracks: 4,
                chars: {
                    pli: 2370,
                },
                duration: 216,
                segments: {
                    pli: 40,
                }
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("maxDuration limits createPlaylist()", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            var store = await new SuttaStore({
                maxDuration: 450,
            }).initialize();
            var eCaught;
            var playlist = await store.createPlaylist({ pattern: 'an3.76-77', });
            should.deepEqual(playlist.stats(), {
                tracks: 1,
                chars: {
                    en: 83,
                },
                duration: 8,
                segments: {
                    en: 1, // error message
                }
            });
            should.deepEqual(playlist.tracks[0],{
                lang: 'en',
                sutta_uid: "createPlaylist_error1",
                segments: [{
                    en: "Play list is too long to be played. All play lists "+
                        "must be less than 8 minutes long",
                    scid: "createPlaylist_error1:0.1",
                }],
            });

            // Pali only
            var playlist = await store.createPlaylist({ 
                pattern: 'an3.76-77', 
                languages: ['pli'],
            });
            should.deepEqual(playlist.stats(), {
                tracks: 4,
                chars: {
                    pli: 2370,
                },
                duration: 216,
                segments: {
                    pli: 40,
                }
            });

            done(); 
        } catch(e) {done(e);} })();
    });
    it("an4.6 has no HTML", function(done) {
        (async function() { try {
            var store = await new SuttaStore({
                maxDuration: 450,
            }).initialize();
            var {
                method,
                results,
            } = await store.search('an4.6');
            var sutta = results[0].sutta;
            should(sutta.sutta_uid).equal('an4.6');
            var en5 = sutta.segments[5].en;
            should(en5).not.match(/<ol>/);
            should(en5).not.match(/<li>/);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("sutta_uidSearch(...) finds suttas by sutta_uid", function(done) {
        (async function() { try {
            var store = await new SuttaStore({
                maxDuration: 450,
            }).initialize();
            var maxResults = 5;
            var language = 'en';

            should.deepEqual(store.sutta_uidSearch("an10.1-10").uids, [
                "an10.1", "an10.2", "an10.3", "an10.4", "an10.5"]);
            should.deepEqual(store.sutta_uidSearch("mn2-11").uids, [
                "mn2", "mn3", "mn4", "mn5", "mn6" ]);
            should.deepEqual(store.sutta_uidSearch("an1.2-11").uids, [
                "an1.1-10", "an1.11-20"]);


            done(); 
        } catch(e) {done(e);} })();
    });
    it("nikaySuttaIds(...) returns sutta_uids", function(done) {
        (async function() { try {
            var store = await new SuttaStore({
                maxDuration: 450,
            }).initialize();
            var language = 'en';
            const KNSTART = [
                'thag1.1', 'thag1.2', 'thag1.3',
            ];
            const KNEND = [
                'thig14.1', 'thig15.1', 'thig16.1',
            ];

            // nikaya, language, author/translator
            var ids = await store.nikayaSuttaIds('kn', 'en', 'sujato');
            should(ids).instanceOf(Array);
            should.deepEqual(ids.slice(0,3), KNSTART);
            should.deepEqual(ids.slice(ids.length-3,ids.length), KNEND);

            // Pali is in English folder
            var ids = await store.nikayaSuttaIds('kn', 'pli', 'sujato');
            should(ids).instanceOf(Array);
            should.deepEqual(ids.slice(0,3), KNSTART);
            should.deepEqual(ids.slice(ids.length-3,ids.length), KNEND);

            // nikaya
            var ids = await store.nikayaSuttaIds('kn');
            should(ids).instanceOf(Array);
            should.deepEqual(ids.slice(0,3), KNSTART);
            should.deepEqual(ids.slice(ids.length-3,ids.length), KNEND);

            // Bad input
            var ids = await store.nikayaSuttaIds('nonikaya', 'yiddish', 'nobody');
            should.deepEqual(ids, []);

            done(); 
        } catch(e) {done(e);} })();
    });

})
