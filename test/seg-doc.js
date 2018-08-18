
(typeof describe === 'function') && describe("seg-doc", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const SegDoc = require("../src/seg-doc");

    var segments = [{
        scid: 's:1.1',
        en:'a1 ab ac',
    },{
        scid: 's:1.2',
        en:'b1 ab bc',
    },{
        scid: 's:2.1',
        en:'c1 bc ac',
    }]

    it("TESTTESTfindIndexes(pat) returns array of segment indexes", function() {
        var segDoc = new SegDoc({segments});
        should.deepEqual(segDoc.findIndexes('not found'),[]);

        // search string
        should.deepEqual(segDoc.findIndexes('a1'),[0]);
        should.deepEqual(segDoc.findIndexes('ab'),[0,1]);
        should.deepEqual(segDoc.findIndexes('bc'),[1,2]);
        should.deepEqual(segDoc.findIndexes('ac'),[0,2]);

        // search RegExp
        should.deepEqual(segDoc.findIndexes(/a1/),[0]);
        should.deepEqual(segDoc.findIndexes(/ab/),[0,1]);
        should.deepEqual(segDoc.findIndexes(/bc/),[1,2]);
        should.deepEqual(segDoc.findIndexes(/ac/),[0,2]);
        should.deepEqual(segDoc.findIndexes(/a1 ab|ab bc/),[0,1]);

        // search prop
        var prop = 'scid';
        should.deepEqual(segDoc.findIndexes(/^s:1.1/,{prop}),[0]); // segment
        should.deepEqual(segDoc.findIndexes(/^s:1.*/,{prop}),[0,1]); // section
        should.deepEqual(segDoc.findIndexes(/^s:2.*/,{prop}),[2]); // section

        var result = segDoc.segments.filter(seg => /ab/.test(seg.en));
        should.deepEqual(result, [{
            scid: 's:1.1',
            en:'a1 ab ac',
        },{
            scid: 's:1.2',
            en:'b1 ab bc',
        }]);
    });
    it("TESTTESTcreatePattern(text) creates a pattern for finding text", function() {
        var segDoc = new SegDoc({segments});
        var pat = segDoc.createPattern("bhikkhu");
        console.log(pat);
        should(pat.test('asfd bhikkhu asdf')).equal(true); // canonical spelling
        should(pat.test('asfd bikkhu asdf')).equal(true); // alternate spelling
        should(pat.test('asfd bhikku asdf')).equal(true); // alternate spelling
        should(pat.test('asfd biku asdf')).equal(false); // invalid spelling
        should(pat.test('asfd bhikkhus asdf')).equal(false); // plural

        var pat = segDoc.createPattern("Tathagata");
        should(pat.test('asfd Tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd Tath\u0101gata asdf')).equal(true); // case
        should(pat.test('asfd tath\u0101gata asdf')).equal(true); // canonical spelling

        var pat = segDoc.createPattern("bhikku tathagata");
        should(pat.test('asfd bhikkhu tathagata asdf')).equal(true); // alternate spelling
        should(pat.test('asfd Bikkhu Tathagata asdf')).equal(true); // alternate spelling

    });

})
