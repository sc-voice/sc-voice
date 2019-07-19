
(typeof describe === 'function') && describe("sutta-duration", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
    const {
        SuttaDuration,
        Sutta,
        SuttaCentralApi,
        SuttaFactory,
    } = require("../index");

    const suttaCentralApi = new SuttaCentralApi();
    const TOLERANCE = 11.1;

    function testTolerance(actual, expected, e = TOLERANCE) {
        should(actual).above(expected-e);
        should(actual).below(expected+e);
    }

    it("TESTTESTconstructor", function() {
        var scd = new SuttaDuration();
        should(scd.name).equal('amy');
    });
    it("TESTTESTmeasure(sutta, lang) measures thag1.2", function(done) {
        (async function() { try {
            var factory = await new SuttaFactory({
                suttaCentralApi,
            }).initialize();
            var scd = new SuttaDuration();

            var sutta = await factory.loadSutta('thag1.2');
            sutta = factory.sectionSutta(sutta);
            var resMeasure = scd.measure(sutta);
            should(resMeasure).properties({
                text: 264,
                lang: 'en',
                nSegments: 9,
                nSections: 3,
            });
            testTolerance(resMeasure.seconds, 24);

            done();
        } catch(e) { done(e); } })();
    });
    it("TESTTESTmeasure(sutta, lang) measures dn33", function(done) {
        (async function() { try {
            var factory = await new SuttaFactory({
                suttaCentralApi,
            }).initialize();
            var scd = new SuttaDuration();

            var sutta = await factory.loadSutta('dn33');
            sutta = factory.sectionSutta(sutta);
            var resMeasure = scd.measure(sutta);
            should(resMeasure).properties({
                text: 84701,
                lang: 'en',
                nSegments: 1158,
                nSections: 12,
            });
            testTolerance(resMeasure.seconds, 7418);

            done();
        } catch(e) { done(e); } })();
    });
    it("TESTTESTmeasure(sutta, lang) measures thag9.1", function(done) {
        (async function() { try {
            var factory = await new SuttaFactory({
                suttaCentralApi,
            }).initialize();
            var scd = new SuttaDuration();

            var sutta = await factory.loadSutta('thag9.1');
            sutta = factory.sectionSutta(sutta);
            var resMeasure = scd.measure(sutta);
            should(resMeasure).properties({
                text: 1779,
                lang: 'en',
                nSegments: 48,
                nSections: 3,
            });
            testTolerance(resMeasure.seconds, 168);

            done();
        } catch(e) { done(e); } })();
    });
    it("TESTTESTmeasure(sutta, lang) measures sn56.21", function(done) {
        (async function() { try {
            var factory = await new SuttaFactory({
                suttaCentralApi,
            }).initialize();
            var scd = new SuttaDuration();

            var sutta = await factory.loadSutta('sn56.21');
            sutta = factory.sectionSutta(sutta);
            var resMeasure = scd.measure(sutta);
            should(resMeasure).properties({
                text: 1097,
                lang: 'en',
                nSegments: 23,
                nSections: 2,
            });
            testTolerance(resMeasure.seconds, 111);

            done();
        } catch(e) { done(e); } })();
    });
});

