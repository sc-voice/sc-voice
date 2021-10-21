
(typeof describe === 'function') && describe("sutta-duration", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('log-instance');
    const { ScApi } = require('suttacentral-api');
    const {
        SuttaDuration,
        Sutta,
        SuttaFactory,
        SuttaStore,
    } = require("../index");
    const scApi = new ScApi();
    const TOLERANCE = 33;
    const logLevel = false;
    this.timeout(20*1000);

    function testTolerance(actual, expected, e = TOLERANCE) {
        should(actual).above(expected-e);
        should(actual).below(expected+e);
    }

    var suttaStore;
    async function testSuttaStore() {
        if (!suttaStore) {
            suttaStore = await new SuttaStore().initialize();
        }
        return suttaStore;
    }
    var suttaFactory;
    async function testSuttaFactory() {
        if (!suttaFactory) {
            let suttaStore = await testSuttaStore();
            let scApi = await new ScApi().initialize();
            suttaFactory = await new SuttaFactory({
                suttaLoader: opts => suttaStore.loadBilaraSutta(opts),
                scApi,
            }).initialize();
        }
        return suttaFactory;
    }

    it("constructor", function() {
        var scd = new SuttaDuration();
        should(scd.name).equal('amy');
    });
    it("measure(sutta, lang) measures thag1.2", async()=>{
        var store = await testSuttaStore();
        var factory = await testSuttaFactory();
        var sutta = await store.loadSutta('thag1.2');
        sutta = factory.sectionSutta(sutta);
        var scd = new SuttaDuration();
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 254,
            lang: 'en',
            nSegments: 9,
            nSections: 2,
            nEmptySegments: 0,
        });
        testTolerance(resMeasure.seconds, 24);
    });
    it("measure(sutta, lang) measures thig1.1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('thig1.1');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 332,
            lang: 'en',
            nSegments: 9,
            nEmptySegments: 0,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 31);
    });
    it("measure(sutta, lang) measures sn2.2", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('sn2.2');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 345,
            lang: 'en',
            nSegments: 9,
            nEmptySegments: 0,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 31);
    });
    it("measure(sutta, lang) measures thig5.1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('thig5.1');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 717,
            lang: 'en',
            nSegments: 26,
            nEmptySegments: 1,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 69);
    });
    it("measure(sutta, lang) measures sn1.1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('sn1.1');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 938,
            lang: 'en',
            nSegments: 20,
            nEmptySegments: 1,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 85);
    });
    it("measure(sutta, lang) measures sn56.21", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();

        var sutta = await factory.loadSutta('sn56.21');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 1101,
            lang: 'en',
            nSegments: 23,
            nEmptySegments: 1,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 111);
    });
    it("measure(sutta, lang) measures thag9.1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('thag9.1');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 1779,
            lang: 'en',
            nSegments: 48,
            nSections: 2,
            nEmptySegments: 8,
        });
        testTolerance(resMeasure.seconds, 168);
    });
    it("measure(sutta, lang) measures sn36.11", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('sn36.11');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 2998,
            lang: 'en',
            nSegments: 50,
            nEmptySegments: 4,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 270);
    });
    it("measure(sutta, lang) measures sn42.11", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();

        var sutta = await factory.loadSutta('sn42.11');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 3315,
            lang: 'en',
            nSegments: 55,
            nEmptySegments: 1,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 292);
    });
    it("measure(sutta, lang) measures an2.1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('an2.1');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 6570,
            lang: 'en',
            nSegments: 126,
            nEmptySegments: 26,
            nSections: 11,
        });
        testTolerance(resMeasure.seconds, 596);
    });
    it("measure(sutta, lang) measures sn12.51", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('sn12.51');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 6789,
            lang: 'en',
            nSegments: 92,
            nEmptySegments: 1,
            nSections: 2,
        });
        testTolerance(resMeasure.seconds, 719);
    });
    it("measure(sutta, lang) measures dn33", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('dn33');
        sutta = factory.sectionSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 84655,
            lang: 'en',
            nSegments: 1167,
            nEmptySegments: 38,
            nSections: 12,
        });
        testTolerance(resMeasure.seconds, 7500);
    });
    it("measure(sutta, lang) measures mn1", async()=>{
        var factory = await testSuttaFactory();
        var scd = new SuttaDuration();
        var sutta = await factory.loadSutta('mn1');
        sutta = factory.sectionSutta(sutta);

        // unexpanded
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 14237,
            lang: 'en',
            nSegments: 334,
            nSections: 2,
            nEmptySegments: 9,
        });
        testTolerance(resMeasure.seconds, 1250);

        // expanded
        sutta = factory.expandSutta(sutta);
        var resMeasure = scd.measure(sutta);
        should(resMeasure).properties({
            text: 76660,
            lang: 'en',
            nSegments: 840,
            nSections: 10,
            nEmptySegments: 9,
        });
        testTolerance(resMeasure.seconds, 12051);
    });
});

