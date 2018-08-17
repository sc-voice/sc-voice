
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

    it("TESTTESTfind(pat) returns array of segment indexes", function() {
        var segDoc = new SegDoc({segments});
        should.deepEqual(segDoc.find('not found'),[]);

        // search string
        should.deepEqual(segDoc.find('a1'),[0]);
        should.deepEqual(segDoc.find('ab'),[0,1]);
        should.deepEqual(segDoc.find('bc'),[1,2]);
        should.deepEqual(segDoc.find('ac'),[0,2]);

        // search RegExp
        should.deepEqual(segDoc.find(/a1/),[0]);
        should.deepEqual(segDoc.find(/ab/),[0,1]);
        should.deepEqual(segDoc.find(/bc/),[1,2]);
        should.deepEqual(segDoc.find(/ac/),[0,2]);
        should.deepEqual(segDoc.find(/a1 ab|ab bc/),[0,1]);

        // search prop
        var prop = 'scid';
        should.deepEqual(segDoc.find(/^s:1.1/,{prop}),[0]); // segment
        should.deepEqual(segDoc.find(/^s:1.*/,{prop}),[0,1]); // section
        should.deepEqual(segDoc.find(/^s:2.*/,{prop}),[2]); // section
    });

})
