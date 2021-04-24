#!/usr/bin/env node

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
const {
    BilaraData,
} = require('scv-bilara');
const scApi = new ScApi();

(async function() { try {
    let sync = true;
    logger.logLevel = 'warn';
    var suttaStore = await new SuttaStore().initialize();
    var bd = suttaStore.bilaraData;
    let suttaIds = bd.suttaIds;
    var factory = await new SuttaFactory({
        bilaraData:bd,
        scApi,
        suttaLoader: opts => suttaStore.loadBilaraSutta(opts),
    }).initialize();
    var scd = new SuttaDuration();
    var duration = {
        en:{
            amy:{},
        }
    };

    for (const suid of suttaIds) {
        try {
            let sutta = await factory.loadSutta(suid);
            if (bd.isBilaraDoc({suid, lang:'en'})) {
                sutta = factory.sectionSutta(sutta);
                let resMeasure = scd.measure(sutta);
                duration.en.amy[suid] = resMeasure.seconds;
                console.log(suid, resMeasure.seconds);
            }
        } catch(e) {
            console.log(e.message);
        }
    }
   
    let json = JSON.stringify(duration,null,2);
    let fpath = path.join(__dirname, '../src/assets', 'suid-duration.json');
    fs.writeFileSync(fpath, json);
} catch(e) { 
    logger.warn(e.message);
    throw e;
}})();
