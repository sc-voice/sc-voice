(typeof describe === 'function') && describe("po-parser", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        PoParser,
        SegDoc,
    } = require("../index");

    it("TESTTESTparse(lines)", function(done) {
        var parser = new PoParser();
        var lines = [
            'msgctxt "mn1:1.1"',
            'msgid ""',
            '"a1id"',
            '"a2id"',
            'msgstr ""',
            '"a1"',
            '"a2"',
            '',
            'msgctxt "mn1:1.2"',
            'msgid ""',
            '"b1id"',
            '"b2id"',
            'msgstr "b1 b2"',
        ];
        (async function() { try {
            var segDoc = await parser.parseLines(lines);
            should.deepEqual(segDoc, new SegDoc({
                segments: [{
                    scid: 'mn1:1.1',
                    pli: 'a1id a2id',
                    en: 'a1 a2',
                },{
                    scid: 'mn1:1.2',
                    pli: 'b1id b2id',
                    en: 'b1 b2',
                }],
            }));
            done();
        } catch(e) {done(e)} })();
    });
    it("TESTTESTparse(filePath)", function(done) {
        var parser = new PoParser();
        var fname = path.join(__dirname, '../local/mn/en/mn001.po');
        (async function() { try {
            var poInfo = await parser.parse(fname);
            //console.log(JSON.stringify(poInfo, null, 2));
            done();
        } catch(e) {done(e)} })();
    });

})
