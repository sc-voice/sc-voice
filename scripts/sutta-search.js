#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    SuttaStore,
    Words,
} = require('../index');
const { logger } = require('rest-bundle');

var words = new Words();
/*
var json = JSON.parse(fs.readFileSync(0));
console.log(json);
json.fragments.forEach(fragment => {
    fragment.lines = fragment.lines
        .map(line => words.romanize(line).replace(/”/gu,' '));
});
console.log(JSON.stringify(json, null, 2));
*/

var argv = process.argv;
var pattern = argv[argv.length-1];
var jsonOut = argv.some(arg => arg === '-j' || arg === '--json');
var pliOut = argv.some(arg => arg === '--pli');
var tranOut = argv.some(arg => arg === '--tran');
var scidOut = argv.some(arg => arg === '--scid');
var spaceChars = " \f\n\r\t\v\u00a0\u1680\u2000-\u200a\u2028\u2029\u202f\u205f\u3000\ufeff"+
    "“”" +
    "\u2008\u200B";
var reSpace = new RegExp(`[${spaceChars}]`, 'ug');
var romanize = argv.some(arg => arg === '--romanize')
    ? t => words.romanize(t).replace(reSpace, ' ').trim()
    : t => t;

(async function() { try {
    var store = await new SuttaStore().initialize();
    var data = await store.search(pattern);
    if (jsonOut) {
        console.log(JSON.stringify(data, null, 2));
    } else if (!pliOut && !tranOut) {
        var jsonSeg = [];
        data.results.forEach(result => {
            result.sutta.segments.forEach((seg,i) => {
                jsonSeg.push(seg);
            });
        });
        console.log(JSON.stringify(jsonSeg, null, 2));
    } else {
        data.results.forEach(result => {
            result.sutta.segments.forEach((seg,i) => {
                var scid = scidOut ? `${scid} ` : '';
                var pli = pliOut ? `${scid}${romanize(seg.pli)}` : '';
                pli && console.log(pli);
                var tran = tranOut ? `${scid}${romanize(seg.tran)}` : '';
                tran && console.log(tran);
            });
        });
    }
} catch(e) {
    logger.error(e.stack);
} })();

