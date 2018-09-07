#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    PoParser,
    Segments,
    Words,
} = require('../index');

var words = new Words();
var pali = fs.readFileSync(0).toString().split('\n');
var prevrw = "";
console.log("{");
pali.forEach(pw => {
    pw = pw.toLowerCase();
    if (pw) {
        var rw = words.romanize(pw);
        if (rw.endsWith('sutta')) {
            var rw2 = rw.substring(0,rw.length-5);
            var pw2 = pw.substring(0,pw.length-5);
            prevrw !== rw2 && console.log(`"${rw2}": "${pw2}",`);
        }
        console.log(`"${rw}": "${pw}",`);
        prevrw = rw;
    }
});
console.log('"_end":"_end"}');
