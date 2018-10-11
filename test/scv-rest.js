(typeof describe === 'function') && describe("scv-rest", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const supertest = require('supertest');
    const {
        Definitions,
        ScvRest,
        Section,
        Sutta,
        SuttaCentralApi,
        SuttaCentralId,
        SuttaFactory,
        Words,

    } = require("../index");
    const Queue = require('promise-queue');
    const SC = path.join(__dirname, '../local/sc');
    const app = require("../scripts/sc-voice.js"); // access cached instance 

    it("GET /identity returns restbundle identity JSON", function(done) {
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/identity").expect((res) => {
                res.statusCode.should.equal(200);
                var keys = Object.keys(res.body).sort();
                should.deepEqual(keys, [
                    'freemem', 'hostname', 'loadavg', 'name', 
                    'package', 'totalmem', 'uptime', 'version'
                ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/mn1/en/sujato returns sutta", function(done) {
        this.timeout(5*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn1/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                var sutta = res.body;
                should.deepEqual(Object.keys(sutta).sort(), [
                    'translation', 'suttaCode', 'sutta_uid', 'author_uid', 
                    "sections", "suttaplex", "support",
                ].sort());
                should.deepEqual(sutta.support, Definitions.SUPPORT_LEVELS.Supported);
                var sections = sutta.sections;
                should(sections.length).equal(10);
                should(sections[2].expandable).equal(false);
                should(sections[2].expanded).equal(true);
                should(sections[2].prefix).equal("");
                should(sections[2].prop).equal("en");
                should.deepEqual(sections[2].template, []);
                should(sections[2].title).match(/.Take an uneducated.*/u);
                should(sections[2].type).equal("Section");
                should.deepEqual(sections[2].values, []);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/mn100/en/sujato returns sutta", function(done) {
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/mn100/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                should(res.body).properties([
                    "sections"
                ]);
                var sections = res.body.sections;
                should(sections.length).equal(2);
                should.deepEqual(sections[0], {
                    expandable: false,
                    expanded: false,
                    prefix: "",
                    prop: 'en',
                    template: [],
                    title: `Middle Discourses 100${Words.U_ELLIPSIS}`,
                    type: 'Section',
                    values: [],
                    segments: [{
                        en: 'Middle Discourses 100',
                        pli: 'Majjhima Nikāya 100',
                        scid: 'mn100:0.1',
                    },{
                        en: 'With Saṅgārava',
                        pli: 'Saṅgāravasutta',
                        scid: 'mn100:0.2',
                    }],
                });
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /recite/sutta/mn1/en/sujato/2 returns recitation", function(done) {
        this.timeout(15*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/recite/section/mn1/en/sujato/2")
                .expect((res) => {
                    res.statusCode.should.equal(200);
                    should(res.body).properties([
                        'guid', 
                    ]);
                    should(res.body).properties({
                        language: 'en',
                        name: 'Amy',
                        section: 2,
                        sutta_uid: 'mn1',
                        translator: 'sujato', 
                        usage: 'recite', 
                    });
                }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /recite/sutta/mn100/en/sujato/1 returns recitation", function(done) {
        this.timeout(15*1000);
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/recite/section/mn100/en/sujato/1")
                .expect((res) => {
                //console.log(res);
                    res.statusCode.should.equal(200);
                    should(res.body).properties([
                        'guid', 
                    ]);
                    should(res.body).properties({
                        language: 'en',
                        name: 'Amy',
                        section: 1,
                        sutta_uid: 'mn100',
                        translator: 'sujato', 
                        usage: 'recite', 
                    });
                }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /download/sutta/mn100/en/sujato/review returns download", function(done) {
        this.timeout(15*1000);
        var async = function* () { try {
                console.log('debug1');
            var response = yield supertest(app)
                .get("/scv/download/sutta/mn100/en/sujato/review")
                .expect('Content-Type', /audio\/mp3/)
                .expect('Content-Disposition', /attachment; filename=mn100-en-sujato.mp3/)
                .expect('Content-Length', /9[0-9][0-9][0-9][0-9][0-9][0-9]/)
                .end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("GET /sutta/an2.1-10/en/sujato returns sutta", function(done) {
        done(); return; // TODO
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/sutta/an2.1-10/en/sujato").expect((res) => {
                res.statusCode.should.equal(200);
                should(res.body).properties([
                    "sections"
                ]);
                var sections = res.body.sections;
                should(sections.length).equal(2);
                should.deepEqual(sections[0], {
                    expandable: false,
                    prefix: "",
                    prop: 'en',
                    template: [],
                    title: `Middle Discourses 100${Words.U_ELLIPSIS}`,
                    type: 'Section',
                    values: [],
                    segments: [{
                        en: 'Middle Discourses 100',
                        pli: 'Majjhima Nikāya 100',
                        scid: 'mn100:0.1',
                    },{
                        en: 'With Saṅgārava',
                        pli: 'Saṅgāravasutta',
                        scid: 'mn100:0.2',
                    }],
                });
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("Queue handles promises", function(done) {
        (async function() { try {
            var monitor = [];
            var q = new Queue(3, Infinity);
            var doit = (ms) => new Promise((resolve, reject) => {
                setTimeout(() => {
                    monitor.push(ms);
                    resolve(ms);
                }, ms);
            });
            var queuedPromises = [1,2,3,4,5,6,7].map(i => q.add(() => doit(i)));
            var all = Promise.all(queuedPromises);
            should(q.getQueueLength()).equal(4); // waiting
            should(q.getPendingLength()).equal(3); // processing
            should.deepEqual(monitor, []);
            var r1 = await(queuedPromises[1]);
            should(r1).equal(2);
            should.deepEqual(monitor, [1,2]);
            should(q.getQueueLength()).equal(2); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var r2 = await(queuedPromises[2]);
            should(r2).equal(3);
            should(q.getQueueLength()).equal(1); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var r3 = await(queuedPromises[3]);
            should(r3).equal(4);
            should(q.getQueueLength()).equal(0); // waiting
            should(q.getPendingLength()).equal(3); // processing
            var allResult = await(all);
            should.deepEqual(allResult, [1,2,3,4,5,6,7]);
            done();
        } catch(e) {done(e);} })();
    });
    it("TESTTESTGET /search/:maxResults/:language/:pattern suttaplexes found", function(done) {
        var async = function* () { try {
            var maxResults = 3;
            var pattern = `root of suffering`;
            var url = `/scv/search/${maxResults}/en/${pattern}`;
            var response = yield supertest(app).get(url).expect((res) => {
                res.statusCode.should.equal(200);
                var results = res.body;
                should(results).instanceOf(Array);
                should(results.length).equal(3);
                should.deepEqual(results.map(r => r.uid),[
                    'sn42.11', 'mn105', 'mn1',
                ]);
                should.deepEqual(results.map(r => r.count),[ 5,3,2, ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
});

