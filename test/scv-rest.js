(typeof describe === 'function') && describe("scv-rest", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const supertest = require('supertest');
    const {
        Section,
        Sutta,
        SuttaFactory,
        SuttaCentralId,
        ScvRest,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');
    const app = require("../scripts/sc-voice.js"); // access cached instance 

    it("TESTTESTGET /identity returns restbundle identity JSON", function(done) {
        var async = function* () { try {
            var response = yield supertest(app).get("/scv/identity").expect((res) => {
                res.statusCode.should.equal(200);
                var keys = Object.keys(res.body).sort();
                should.deepEqual(keys, [
                    'freemem', 'hostname', 'loadavg', 'name', 'package', 'totalmem', 'uptime', 'version'
                ]);
            }).end((e,r) => e ? async.throw(e) : async.next(r));
            done();
        } catch (e) { done(e); } }();
        async.next();
    });
    it("TESTTESTGET /sutta/mn100/en/sujato returns sutta", function(done) {
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
});

