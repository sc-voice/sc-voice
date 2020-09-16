#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

var args = process.argv.slice(1);
var root = args[1] || path.join('local', 'sounds');

const map = {};

var maxSize = 0;
var suffix = '.mp3';
var now = new Date();
var MS_DAY = 1000 * 60 * 60 * 24;
var MS_WEEK = MS_DAY * 7;
function scanDir(dirPath) {
    var entries = fs.readdirSync(dirPath, {withFileTypes: true});
    entries.forEach(entry=>{
        if (entry.isDirectory()) {
            scanDir(path.join(dirPath, entry.name));
        } else if (entry.isFile()) {
            if (entry.name.endsWith(suffix)) {
                var fpath = path.join(dirPath, entry.name);
                var stats = fs.statSync(fpath);
                var tMod = Math.ceil((now - stats.mtime)/MS_DAY);
                var tAccess = Math.ceil((now - stats.atime)/MS_DAY);
                map[tMod] = map[tMod] || {mod:0, access:0};
                map[tAccess] = map[tAccess] || {mod:0, access:0};
                map[tMod].mod += stats.size / 1000000;
                map[tAccess].access += stats.size / 1000000;
            }
        }
    });
}

scanDir(root);
console.log(`${root}/**/*${suffix} sizes (MB)`);
console.log(`days\tmod\taccess`);
Object.entries(map).sort((a,b) => a[0]-b[0]).forEach(e=>{
    var [k,v] = e;
    var {mod, access} = v;
    console.log([
        `${k}`,
        mod ? `${mod.toFixed(1)}` : '0',
        access ? `${access.toFixed(1)}` : '0',
    ].join('\t'));
});
