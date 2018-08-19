#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const {
    SegDoc,
    Words,
} = require('../index');

var SC = path.join(__dirname, '../local/sc');
console.log(fs.readdirSync(SC));
