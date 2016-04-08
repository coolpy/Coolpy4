var express = require('express');
var checker = require('./funs/checker.js');
var config = require('./config.json').mongoConfig;
var MongoClient = require('mongodb').MongoClient;
var mongo;
MongoClient.connect(config.address, {
    server: {
        poolSize: config.poolSize
    }
}, function (err, db) {
    if (err === null) {
        mongo = db;
        console.log("Connected correctly to server");
    } else {
        console.log("Connect Error " + err);
    }
});

module.exports = (function () {
    'use strict';
    
    var router = express.Router({ mergeParams: true });
    
    router.route('/upload/:bucket/:fn').post(function (req, res, next) {
        var ext = path.extname(req.params.fn);
        if (ext === "") {
            res.json({ ok: 0, n: 0, err: 'file extname err' });
            return;
        }
        if (!checker.contains.call(config.formFileTypes, ext)) {
            res.json({ ok: 0, n: 0, err: 'invalid file type' });
            return;
        }
        var bucket = new mongodb.GridFSBucket(mongo.db('q1fs'), { bucketName: req.params.bucket });
        bucket.find({ filename: req.params.fn }).toArray(function (err, files) {
            if (files.length === 0) {
                var opt = { contentType: mime.lookup(req.params.fn), metadata: { auth: "user" } };
                var uploader = bucket.openUploadStream(req.params.fn, opt);
                req.pipe(uploader).on('error', function (err) {
                    res.json({ ok: 0, n: 0, err: err });
                }).on('finish', function () {
                    res.json({ ok: 1, n: 1, body : { fn: req.params.fn, id: uploader.id } });
                });
            } else {
                res.json({ ok: 0, n: 0, err: 'file ext' });
            }
        });
    });
    
    router.route('/dlfn/:fn').get(function (req, res, next) {
        //var throttle = new Throttle(1024*1024);
        var bucket = new mongodb.GridFSBucket(mongo.db('q1fs'));
        bucket.find({ filename: req.params.fn }).toArray(function (err, files) {
            if (files.length > 0) {
                if (req.headers.range) {
                    var range = parseRange(files[0].length, req.headers.range);
                    if (range.type === 'bytes') {
                        res.statusCode = 206;
                        var opt = { start: range[0].start, end: range[0].end };
                    } else {
                        res.json({ ok: 0, n: 0, err: 'range type err' });
                    }
                } else {
                    var opt = { start: 0, end: files[0].length };
                }
                var downloader = bucket.openDownloadStreamByName(req.params.fn, opt);
                res.setHeader('Content-type', files[0].contentType);
                downloader.pipe(res);
            } else {
                res.json({ ok: 0, n: 0, err: 'file not ext' });
            }
        });
    });
    
    router.route('/dlid/:id').get(function (req, res, next) {
        var bucket = new mongodb.GridFSBucket(mongo.db('q1fs'));
        var o_id = new mongodb.ObjectID(req.params.id);
        bucket.find({ _id : o_id }).toArray(function (err, files) {
            if (files.length > 0) {
                if (req.headers.range) {
                    var range = parseRange(files[0].length, req.headers.range);
                    if (range.type === 'bytes') {
                        res.statusCode = 206;
                        var opt = { start: range[0].start, end: range[0].end };
                    } else {
                        res.json({ ok: 0, n: 0, err: 'range type err' });
                    }
                } else {
                    var opt = { start: 0, end: files[0].length };
                }
                var downloader = bucket.openDownloadStream(o_id, opt);
                res.setHeader('Content-type', files[0].contentType);
                downloader.pipe(res);
            } else {
                res.json({ ok: 0, n: 0, err: 'file not ext' });
            }
        });
    });
    router.route('/mg/del/:id').get(function (req, res, next) {
        var bucket = new mongodb.GridFSBucket(mongo.db('q1fs'));
        var o_id = new mongodb.ObjectID(req.params.id);
        bucket.delete(o_id, function (error) {
            if (error) {
                res.json({ ok: 0, n: 0, err: error });
            } else {
                res.json({ ok: 1, n: 1 });
            }
        });
    });
    
    router.route('/mg/drop').get(function (req, res, next) {
        var bucket = new mongodb.GridFSBucket(mongo.db('q1fs'));
        bucket.drop(function (error) {
            if (error) {
                res.json({ ok: 0, n: 0, err: error });
            } else {
                res.json({ ok: 1, n: 1 });
            }
        });
    });
    
    return router;
})();