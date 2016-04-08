/**
 * Created by biles on 16/4/8.
 */

var express = require("express");
var basicAuth = require('./../funs/auth.js');

var router = express.Router({ mergeParams: true });

router.route('/users/:id?')
    .post(function (req, res, next) {
        isvalid(req.body, admin, function (err, validData) {
            if (err) {
                res.json({ ok: 0, n : 0, err : err });
            } else {
                validData.ukey = uuid.v4();
                var mgo = mongo.db('coolpy').collection('users');
                mgo.findOne({ 'userId': validData.userId }, function (err, doc) {
                    if (err) {
                        res.json({ ok: 0, n : 0, err : err });
                    } else {
                        if (doc === null) {
                            mgo.insertOne(validData, function (err, r) {
                                if (err) {
                                    res.json({ ok: 0, n : 0, err : err });
                                } else {
                                    res.json(r.result);
                                }
                            });
                        } else {
                            res.json({ ok: 0, n : 0, err : "object exits" });
                        }
                    }
                });
            }
        });
    })
    .put(function (req, res, next) {
        isvalid(req.body, admin, function (err, validData) {
            if (err) {
                res.json({ ok: 0, n : 0, err : err });
            } else {
                delete validData.ukey;
                var mgo = mongo.db('coolpy').collection('users');
                var filter = Object();
                filter.userId = validData.userId;
                mgo.findOne(filter, function (err, doc) {
                    if (err) {
                        res.json({ ok: 0, n : 0, err : err });
                    } else {
                        if (doc === null) {
                            res.json({ ok: 0, n : 0, err : "object not exits" });
                        } else {
                            var update = Object();
                            update.$set = validData;
                            mgo.updateOne(filter, update, function (err, r) {
                                if (err) {
                                    res.json({ ok: 0, n : 0, err : err });
                                } else {
                                    res.json(r.result);
                                }
                            });
                        }
                    }
                });
            }
        });
    })
    .get(function (req, res, next) {
        if (req.params.id) {
            mongo.db('coolpy').collection('users').findOne({ 'userId': req.params.id }, function (err, doc) {
                if (err) {
                    res.json({ ok: 0, n : 0, err : err });
                } else {
                    if (doc === null) {
                        res.json({ ok: 0, n : 0, err : "object not exits" });
                    } else {
                        delete doc.pwd;
                        delete doc.ukey;
                        delete doc._id;
                        res.json({ ok: 0, n : 0, obj : doc });
                    }
                }
            });
        }
    })
    .delete(basicAuth, function (req, res, next) {
        if (req.params.id) {
            mongo.db('coolpy').collection('users').deleteOne({ 'userId': req.params.id }, function (err, doc) {
                if (err) {
                    res.json({ ok: 0, n : 0, err : err });
                } else {
                    if (doc === null) {
                        res.json({ ok: 0, n : 0, err : "object not exits" });
                    } else {
                        delete doc.pwd;
                        delete doc.ukey;
                        delete doc._id;
                        res.json({ ok: 0, n : 0, obj : doc });
                    }
                }
            });
        }
    });

module.exports = router;