(typeof describe === 'function') && describe("po-parser", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        PoParser,
        Sutta,
        Words,
    } = require("../index");
    const SC = path.join(__dirname, '../local/sc');

    it("parse(lines)", function(done) {
        var parser = new PoParser();
        var lines = [
            'msgctxt "mn1:1.1"',
            'msgid ""',
            '"a1id "',
            '"a2id"',
            'msgstr ""',
            '"a1 "',
            '"a2"',
            '',
            'msgctxt "mn1:1.2"',
            'msgid ""',
            '"b1id "',
            '"b2id"',
            'msgstr "b1 <i>b2</i> b3"',
        ];
        (async function() { try {
            var segments = await parser.parseLines(lines);
            should.deepEqual(segments, [{
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
    it("parse(filePath) creates array of segments", function(done) {
        (async function() { try {
            var parser = new PoParser();
            var fname = path.join(__dirname, '../local/sc/mn/en/mn001.po');
            var segments = await parser.parse(fname);
            should(segments.length).equal(334);
            var segments = Sutta.findSegments(segments, /mn1:172-194.25/,{prop:'scid'});
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
            var segments = await parser.parse(fname);
            true && segments.forEach(seg => {
                if (seg.en && !words.isWord(seg) && !normalPat.test(seg.en)) {
                    //console.log(`${seg.scid}\t${seg.en}`);
                }
            });
            should(segments.length).equal(334);
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
            const count = {
                mn: 153,
                dn: 35,
                an: 1408,
                sn: 1821,
                kn: 338,
            //    pivi: 97,
            };
            should(files.filter(f => f.match(/\/mn\//)).length).equal(count.mn);
            should(files.filter(f => f.match(/\/dn\//)).length).equal(count.dn);
            should(files.filter(f => f.match(/\/an\//)).length).equal(count.an);
            should(files.filter(f => f.match(/\/sn\//)).length).equal(count.sn);
            should(files.filter(f => f.match(/\/kn\//)).length).equal(count.kn);
           //should(files.filter(f => f.match(/\/pi-vi\//)).length).equal(count.pivi);
            should(files.filter(f => f.match(/\/en\//)).length).not.below(
                Object.keys(count).reduce((acc,key) => count[key] + acc, 0));
            done();
        } catch(e) {done(e)} })();

    });
    it("suttaPath(id, root, opts) returns sutta file path", function() {
        should(PoParser.suttaPath('mn1')).equal(path.join(SC, 'mn', 'en', 'mn001.po'));
        should(PoParser.suttaPath('MN123:1.1')).equal(path.join(SC, 'mn', 'en', 'mn123.po'));

        var root = 'dummy';
        should(PoParser.suttaPath('mn1', root)).equal(path.join(root, 'mn', 'en', 'mn001.po'));
        should(PoParser.suttaPath('MN123:1.1', root)).equal(path.join(root, 'mn', 'en', 'mn123.po'));
        should(PoParser.suttaPath('sn22.1', root)).equal(path.join(root, 'sn/en/sn22/sn22.001.po'));
        should(PoParser.suttaPath('an3.163-182', root)).equal(path.join(root, 'an/en/an03/an3.163-182.po'));
        should(PoParser.suttaPath('an2.1-10', root)).equal(path.join(root, 'an/en/an02/an2.001-10.po'));
        should(PoParser.suttaPath('an3.3', root)).equal(path.join(root, 'an/en/an03/an3.003.po'));
        should(PoParser.suttaPath('dn1', root)).equal(path.join(root, 'dn/en/dn01.po'));
        should(PoParser.suttaPath('dn12', root)).equal(path.join(root, 'dn/en/dn12.po'));
        should(PoParser.suttaPath('thag1.2', root)).equal(path.join(root, 'kn/en/thag/thag01.002.po'));
        should(PoParser.suttaPath('thig1.12', root)).equal(path.join(root, 'kn/en/thig/thig01.12.po'));

        if (0) { // TODO 
            should(PoParser.suttaPath('pli-tv-bu-vb-ay2', root))
                .equal(path.join(root, 'pi-vi/en/ay/pli-tv-bu-vb-ay2.po'));
            should(PoParser.suttaPath('pli-tv-bu-vb-np2', root))
                .equal(path.join(root, 'pi-vi/en/np/pli-tv-bu-vb-np2.po'));
            should(PoParser.suttaPath('pli-tv-bu-vb-pc2', root))
                .equal(path.join(root, 'pi-vi/en/pc/pli-tv-bu-vb-pc2.po'));
            should(PoParser.suttaPath('pli-tv-bu-vb-pj2', root))
                .equal(path.join(root, 'pi-vi/en/pj/pli-tv-bu-vb-pj2.po'));
            should(PoParser.suttaPath('pli-tv-bu-vb-ss2', root))
                .equal(path.join(root, 'pi-vi/en/ss/pli-tv-bu-vb-ss2.po'));
        }

        // unavailable but legal suttas
        should.throws(() => {
            PoParser.suttaPath('snp1.8', root);
        });
    });
    it("suttaPath(id, root, opts) returns nearest sutta file path", function() {
        // if root exists
        should(PoParser.suttaPath('an2.11'))
            .equal(path.join(SC, 'an/en/an02/an2.011-20.po'));
        should(PoParser.suttaPath('sn29.22'))
            .equal(path.join(SC, 'sn/en/sn29/sn29.21-50.po'));

        // if root does not exist
        var root = 'dummy';
        should(PoParser.suttaPath('an2.11', root)).equal('dummy/an/en/an02/an2.011.po');
    });

})
