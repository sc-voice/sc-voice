(typeof describe === 'function') && describe("md-aria", function() {
    const should = require("should");
    const fs = require('fs');
    const path = require('path');
    const {
        MdAria,
    } = require('../index');

    it("creates <detail> from headings", function(){
        var mdAria = new MdAria();
        var html = mdAria.toHtml([
            'a',
            '# b',
            'b1',
            '## c',
            'c1',
        ].join('\n'));
        should.deepEqual(html.split('\n'), [
            'a',
            '<detail>',
            '<summary>b</summary>',
            'b1',
            '</detail>',
            '<h2>c</h2>',
            'c1',
        ]);
    });
    it("creates <ul> from starred lines", function(){
        var mdAria = new MdAria();
        var html = mdAria.toHtml([
            'a',
            '* b1',
            '* b2',
            '',
            'c',
        ].join('\n'));
        should.deepEqual(html.split('\n'), [
            'a',
            '<ul>',
            '<li>b1</li>',
            '<li>b2</li>',
            '</ul>',
            '<p>',
            'c',
            '</p>',
        ]);
    });
    it("creates <p> from blank lines", function(){
        var mdAria = new MdAria();
        var html = mdAria.toHtml([
            '',
            'a',
            'a1',
            '',
            'b',
            'b1',
            '',
            '',
            'c',
            'c1',
            '',
        ].join('\n'));
        should.deepEqual(html.split('\n'), [
            '<p>',
            'a',
            'a1',
            '</p>',
            '<p>',
            'b',
            'b1',
            '</p>',
            '<p>',
            'c',
            'c1',
            '</p>',
        ]);
    });
    it("creates <p> from blank lines", function(){
        var mdAria = new MdAria();
        var html = mdAria.toHtml([
            'x [x1](x2) x3',
            '* y [y1](y2) y3',
        ].join('\n'));
        should.deepEqual(html.split('\n'), [
            `x <a href="x2">x1</a> x3`,
            '<ul>',
            `<li>y <a href="y2">y1</a> y3</li>`,
            '</ul>',
        ]);
    });
    it("replaces mispronounced words", function(){
        var mdAria = new MdAria();
        var html = mdAria.toHtml(`Hear this on SuttaCentral Voice`);
        should.deepEqual(html, [
            "Hear this on ",
            '<span aria-label="soota central"> </span>',
            '<span aria-hidden="true">SuttaCentral</span>',
            " Voice",
        ].join(""));

        var html = mdAria.toHtml(`Hear these suttas:`);
        should.deepEqual(html, [
            "Hear these ",
            '<span aria-label="sootas"> </span>',
            '<span aria-hidden="true">suttas</span>',
            ":",
        ].join(""));

        var html = mdAria.toHtml(`Hear this sutta?`);
        should.deepEqual(html, [
            "Hear this ",
            '<span aria-label="soota"> </span>',
            '<span aria-hidden="true">sutta</span>',
            "?",
        ].join(""));

        var html = mdAria.toHtml(`http://suttacentral.net/mn1`);
        should.deepEqual(html, [
            `http://%73uttacentral.net/mn1`,
        ].join(""));
        
        var html = mdAria.toHtml(`suttacentral-voice-assistant`);
        should.deepEqual(html, [
            '%73uttacentral-voice-assistant',
        ].join(""));
        
    });
})
