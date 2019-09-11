(typeof describe === 'function') && describe("content-updater", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const { logger } = require('rest-bundle');
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

    it("constructor(opts)", function() {
        var updater = new ContentUpdater();
        should(updater.isInitialized).equal(false);
        should(updater.apiUrl).equal(SC_STAGING);
        should(updater.gitPath).equal(path.join(LOCAL, 'suttas'));
        should(updater.token).equal('no-token');
        should(fs.existsSync(updater.gitPath)).equal(true);

        var updater = new ContentUpdater({
            apiUrl: 'test-apiUrl',
            token: 'test-token',
        });
        should(updater.isInitialized).equal(false);
        should(updater.apiUrl).equal('test-apiUrl');
        should(updater.gitPath).equal(path.join(LOCAL, 'suttas'));
        should(updater.token).equal('test-token');
        should(fs.existsSync(updater.gitPath)).equal(true);
    });
    it("initialize() initializes ContentUpdater", function(done) {
        (async function() { try {
            var updater = new ContentUpdater();
            var resInit = await updater.initialize();
            should(resInit).equal(updater);
            should(updater.suttaStore).instanceOf(SuttaStore);
            should(updater.suttaStore.isInitialized).equal(true);
            should(updater.isInitialized).equal(true);
            should(updater.remote_origin_url)
                .equal('https://github.com/sc-voice/scv-suttas.git');

            done(); 
        } catch(e) {done(e);} })();
    });
    it("TESTTESTupdate(scids, opts) updates content", function(done) {
        this.timeout(5*1000);
        (async function() { try {
            /*
             * NOTE: This test will FAIL with invalid username or password
             * if content needs to be updated. The token provided is invalid 
             * and only for testing.
             */
            var token = 'test-token'; // Invalid GitHub Personal Access Token
            var token = '42b3ae40075228d04718ea37edd1173ee3d5265c';
            var updater = await new ContentUpdater({
                apiUrl: SC_STAGING,
                token,
            }).initialize();
            var suids = ['mn1', 'mn2'];
            var resUpdate = await updater.update(suids);
            var name = `ContentUpdater.update()`;
            should(resUpdate).properties({
                name,
                suids,
            });
            var actions = suids.length + 1;
            should(resUpdate.task).properties({
                name,
                actionsDone: actions,
                actionsTotal: actions,
                isActive: false,
                error: null,
                summary: `Update completed without change`,
            });
            should(resUpdate.gitLog[0]).match(/Already up-to-date./);

            done(); 
        } catch(e) {done(e);} })();
    });

})
