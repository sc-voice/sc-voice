(typeof describe === 'function') && describe("content-updater", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger, } = require('log-instance');
    const {
        ContentUpdater,
        SuttaStore,
    } = require("../index");
    const LANG = 'en';
    const LOCAL = path.join(__dirname, '..', 'local');
    const ROOT = path.join(LOCAL, 'suttas');
    const MAXRESULTS = 5;
    const SC_STAGING = 'http://staging.suttacentral.net/api';
    const PRODUCTION = 'http://suttacentral.net/api';
    this.timeout(10*1000);

    it("constructor(opts)", function() {
        var updater = new ContentUpdater();
        should(updater.isInitialized).equal(false);
    });
    it("initialize() initializes ContentUpdater", function(done) {
        (async function() { try {
            var updater = new ContentUpdater();
            var resInit = await updater.initialize();
            should(updater.suttaStore).instanceOf(SuttaStore);
            should(updater.suttaStore.isInitialized).equal(true);
            should(updater.isInitialized).equal(true);

            done(); 
        } catch(e) {done(e);} })();
    });
    it("update() updates content", function(done) {
        (async function() { try {
            var updater = await new ContentUpdater().initialize();
            var resUpdate = await updater.update();
            var name = `ContentUpdater.update()`;
            should(resUpdate).properties({
                name,
            });
            var actions = 1;
            should(resUpdate.task).properties({
                name,
                actionsDone: actions,
                actionsTotal: actions,
                isActive: false,
                error: null,
                summary: `Update completed`,
            });

            done(); 
        } catch(e) {done(e);} })();
    });

})
