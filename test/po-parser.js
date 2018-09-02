(typeof describe === 'function') && describe("po-parser", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        PoParser,
        SegDoc,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("parse(lines)", function(done) {
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
            'msgstr "b1 <i>b2</i> b3"',
        ];
        (async function() { try {
            var segDoc = await parser.parseLines(lines);
            should.deepEqual(segDoc.segments, [{
                scid: 'mn1:1.1',
                pli: 'a1id a2id',
                en: 'a1 a2',
            },{
                scid: 'mn1:1.2',
                pli: 'b1id b2id',
                en: 'b1 b2 b3',
            }]);
            done();
        } catch(e) {done(e)} })();
    });
    it("parse(filePath) creates a SegDoc", function(done) {
        (async function() { try {
            var parser = new PoParser();
            var fname = path.join(__dirname, '../local/sc/mn/en/mn001.po');
            var segDoc = await parser.parse(fname);
            should(segDoc).instanceOf(SegDoc);
            should(segDoc.segments.length).equal(334);
            var segments = segDoc.findSegments(/mn1:172-194.25/,{prop:'scid'});
            should(segments.length).equal(1);
            should(segments[0]).properties({
                en: 'Why is that?',
                scid: 'mn1:172-194.25',
            });
            done();
        } catch(e) {done(e)} })();
    });
    it("parse(filePath)", function(done) {
        done(); returns;
        var parser = new PoParser();
        var fname = path.join(__dirname, '../local/sc/mn/en/mn001.po');
        var words = new Words();
        var normalPat
        var normalPat = new RegExp("^[ a-zA-Z.<>/:;,?!\"'"+
            "\u2026\u2010\u2011\u2012\u2013\u2014\u2015\u201b\u201c\u201d\u2018\u2019-]*$",
            "u");
        (async function() { try {
            var segDoc = await parser.parse(fname);
            true && segDoc.segments.forEach(seg => {
                if (seg.en && !words.isWord(seg) && !normalPat.test(seg.en)) {
                    //console.log(`${seg.scid}\t${seg.en}`);
                }
            });
            should(segDoc.segments.length).equal(334);
            var text = 'hello\u2026';
            //console.log('\u2026', normalPat, text);
            should(normalPat.test(text)).equal(true);
            done();
        } catch(e) {done(e)} })();
    });
    it("files(opts) returns source file list", (done) => {
        (async function() { try {
            var parser = new PoParser();
            var files = await parser.files();
            should(fs.statSync(files[0]).isFile()).equal(true);
            should(fs.statSync(files[1]).isFile()).equal(true);
            should(fs.statSync(files[files.length-1]).isFile()).equal(true);
            should(files[0]).match(/.*\/en\/[^\/]*\.po$/);
            should(files[1]).match(/.*\/en\/[^\/]*\.po$/);
            should(files[files.length-1]).match(/.*\/en\/[^\/]*\.po$/);
            should(files.length).equal(191);
            done();
        } catch(e) {done(e)} })();

    });
    it("suttaPath(id, root) returns sutta file path", function() {
        should(PoParser.suttaPath('mn1')).equal(path.join(SC, 'mn', 'en', 'mn001.po'));
        should(PoParser.suttaPath('MN123:1.1')).equal(path.join(SC, 'mn', 'en', 'mn123.po'));

        var root = 'dummy';
        should(PoParser.suttaPath('mn1', root)).equal(path.join(root, 'mn', 'en', 'mn001.po'));
        should(PoParser.suttaPath('MN123:1.1', root)).equal(path.join(root, 'mn', 'en', 'mn123.po'));
    });

})
