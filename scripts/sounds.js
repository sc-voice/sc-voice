#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const SOUNDPATH = path.join(__dirname, '..', 'local', 'sounds');


var maxSize = 0;
function scanDir(dirPath) {
    var entries = fs.readdirSync(dirPath, {withFileTypes: true});
    entries.forEach(entry=>{
        if (entry.isDirectory()) {
            scanDir(path.join(dirPath, entry.name));
        } else if (entry.isFile() && entry.name.endsWith('.json')) {
            var fpath = path.join(dirPath, entry.name);
            var stats = fs.statSync(fpath);
            if (stats.size > maxSize) {
                var json = JSON.parse(fs.readFileSync(fpath));
                if (json.api === 'aws-polly') {
                    maxSize = stats.size;
                    console.log(entry.name, stats.size, json.api);
                }
            }
        }
    });
}

scanDir(SOUNDPATH);
