(typeof describe === 'function') && describe("po-parser", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const PoParser = require("../src/po-parser");

    it("TESTTESTparse(lines)", function(done) {
        var parser = new PoParser();
        var lines = [
            'msgctxt "mn1:1.1"',
            'msgid ""',
            '"aid1"',
            '"a2id"',
            'msgstr ""',
            '"a1"',
            '"a2"',
            '',
            'msgctxt "mn1:1.2"',
            'msgid ""',
            '"bid1"',
            '"b2id"',
            'msgstr "b1 b2"',
        ];
        (async function() { try {
            var poInfo = await parser.parseLines(lines);
            should.deepEqual(poInfo, {
                idMap: {
                    'mn1:1.1': 'a1 a2',
                    'mn1:1.2': 'b1 b2',
                },
                segments: [
                    'a1 a2',
                    'b1 b2',
                ],
            });
            done();
        } catch(e) {done(e)} })();
    });
    it("TESTTESTparse(filePath)", function(done) {
        var parser = new PoParser();
        var fname = path.join(__dirname, '../local/mn/en/mn001.po');
        (async function() { try {
            var poInfo = await parser.parse(fname);
            console.log(JSON.stringify(poInfo, null, 2));
            done();
        } catch(e) {done(e)} })();
    });

})
