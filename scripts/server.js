#!/usr/bin/env node

const path = require("path");
const winston = require("winston");
const compression = require("compression");
const express = require('express');
const app = module.exports = express();
const {
    RestBundle,
    RbServer,
} = require('rest-bundle');
const {
    ScvRest,
} = require('../index');

global.__appdir = path.dirname(__dirname);

app.use(compression());

// ensure argv is actually for script instead of mocha
var argv = process.argv[1].match(__filename) && process.argv || [];
argv.filter(a => a==='--log-debug').length && (winston.level = 'debug');

// set up application
app.all('*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", 
        "X-Requested-With, Content-Type, Access-Control-Allow-Headers");
    res.header("Access-Control-Allow-Methods", "GET, OPTIONS, PUT, POST");
    next();
});
app.use("/", express.static(path.join(__dirname, "../public")));
app.use("/dist", express.static(path.join(__dirname, "../dist")));
app.use("/js", express.static(path.join(__dirname, "../dist/js")));
app.use("/css", express.static(path.join(__dirname, "../dist/css")));
app.use("/sounds", express.static(path.join(__dirname, "../local/sounds")));
var async = function*() {
    try {
        // create RestBundles
        var restBundles = app.locals.restBundles = [];
        var scvRest = new ScvRest();
        yield scvRest.initialize().then(r=>async.next(r)).catch(e=>async.throw(e));
        restBundles.push(scvRest);

        // create http server and web socket
        var ports = [80, 8081].concat(new Array(100).fill(3000).map((p,i)=>p+i));
        var rbServer =  app.locals.rbServer = new RbServer();
        rbServer.listen(app, restBundles, ports); 
        yield rbServer.initialize().then(r=>async.next(r)).catch(e=>async.throw(e));
    } catch(e) {
        winston.error(e.stack);
        throw e;
    }
}();
async.next();
