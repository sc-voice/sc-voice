(typeof describe === 'function') && describe("bilara-data", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        BilaraData,
    } = require("../index");
    const {
        js,
        logger,
    } = require("just-simple").JustSimple;
    const LOCAL = path.join(__dirname, '..', 'local');

    it("TESTTESTdefault ctor", () => {
        var bd = new BilaraData();
        should(bd).instanceOf(BilaraData);
        should(bd.root).equal(`${LOCAL}/bilara-data`);
        should.deepEqual(bd.nikayas.sort(), [
            'mn', 'sn', 'dn', 'an', 'kn',
        ].sort());
        should(bd).properties({
            logLevel: 'info',
        });
    });

})
