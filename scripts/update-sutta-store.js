#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { logger, } = require('log-instance');
const {
    ScApi,
} = require('suttacentral-api');
const {
    Sutta,
    SuttaStore,
} = require('../index');


(async function() { try {
    var scApi = await new ScApi({
        apiUrl: 'http://staging.suttacentral.net/api',
    }).initialize();
    var store = await new SuttaStore({
        scApi,
    }).initialize();
    var msStart = Date.now();
    var maxAge = 24*60*60;
    await store.updateSuttas(undefined, {
        maxAge,
    });
    logger.info(`elapsed:${((Date.now() - msStart)/1000).toFixed(1)}`);
} catch(e) {
    logger.error(e.stack);
    process.exit(-1);
}})();

