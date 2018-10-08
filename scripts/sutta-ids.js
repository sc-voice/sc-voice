#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const {
    execSync,
} = require('child_process');
const {
    PoParser,
    Polly,
    Sutta,
    SuttaFactory,
    SuttaCentralId,
    Voice,
    Words,
} = require('../index');


var cmd = 'find . -name "*.po" '+
    '|grep "/en" '+
    '|sed -r -e "s/.*\\///" '+
    '|sed -r -e "s/([^0-9])0+/\\1/g" '+
    '|sed -r -e "s/\\.po//" ' +
    '|grep -v "^$" '+
    '';
var ids = execSync(cmd, {
    cwd: path.join(__dirname, '../local/sc'),
}).toString().split('\n').filter(id => !!id);
ids.sort((a,b) => SuttaCentralId.compare(a,b));
var suttaIdsPath = path.join(__dirname, '../src/node/sutta-ids.json');
ids.slice(0,15).forEach(id => console.log(id));
console.log('...');
ids.slice(ids.length-15).forEach(id => console.log(id));
fs.writeFileSync(suttaIdsPath, JSON.stringify(ids,null,2));
console.log(`${ids.length} sutta ids written to ${suttaIdsPath}`);

