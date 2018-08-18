#!/usr/bin/env node

const path = require("path");
const winston = require("winston");
const compression = require("compression");
const express = require('express');
const app = module.exports = express();

global.__appdir = path.dirname(__dirname);

app.use(compression());

// ensure argv is actually for script instead of mocha
var argv = process.argv[1].match(__filename) && process.argv || [];
argv.filter(a => a==='--log-debug').length && (winston.level = 'debug');

// set up application
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With, Content-Type, Access-Control-Allow-Headers");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
    next();
});
app.use("/", express.static(path.join(__dirname, "../src/ui")));
app.use("/sounds", express.static(path.join(__dirname, "../local/sounds")));

var port = 8080;
app.listen(port, () => {
    console.log(`listening on port ${port}`);
})
.on('error', e => {
    console.log(e.stack);
    throw e;
});

