var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var logger = require('morgan');
var config = require('./config.json');
var app = express();

function defaultContentTypeMiddleware(req, res, next) {
    req.headers['content-type'] = req.headers['content-type'] || 'application/json';
    next();
}
app.use(defaultContentTypeMiddleware);

if (config.systemConfig.debug) {
    app.use(logger('dev'));
}
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.all('*', function (req, res, next) {
    if (!req.get('Origin')) return next();
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.set('Access-Control-Allow-Headers', 'U-ApiKey, Content-Type');
    //res.set('Access-Control-Allow-Max-Age', 3600);
    if ('OPTIONS' == req.method) return res.status(200).end();
    next();
});

if (config.systemConfig.whiteList[0] != '0.0.0.0/0') {
    var ipfilter = require('express-ipfilter');
    var setting = { mode: 'allow', log: false, errorCode: 403, errorMessage: '' };
    app.use(ipfilter(config.systemConfig.whiteList, setting));
}

if (config.redisConfig.isEnable) {
    var rds = require('./rds.js');
    app.use('/rds', rds);
}

//var mgs = require('./mg.js');
//app.use('/ac', mgs);
var user = require("./router/user.js");
app.use("/ac",user);


//var fsio = require('./fsio.js');
//app.use("/fs", fsio);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res) {
    res.status(500 || err.status);
    res.json({ ok: 0, n: 0, err: err.message });
});

module.exports = app;
