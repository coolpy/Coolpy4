var express = require('express');
var isvalid = require('isvalid');
var uuid = require('uuid');
var admin = require('./models/admin.js');
var basicauth = require('./funs/auth.js');
var mongo = require("./middleware/mongo.js");

module.exports = (function () {
    'use strict';
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
    .delete(basicauth, function (req, res, next) {
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
    
    router.route('/update').post(basicauth, function (req, res, next) {
        if (req.body.hasOwnProperty('filter') && req.body.hasOwnProperty('update')) {
            var db = req.params.db;
            var coll = req.params.coll;
            mongo.db(db).collection(coll).updateMany(req.body.filter, req.body.update, function (err, r) {
                if (err) {
                    res.json({ ok: 0, n : 0, err : err });
                } else {
                    res.json(r.result);
                }
            });
        } else {
            res.json({ ok: 0, n : 0, err : 'params err' });
        }
    });
    
    router.route('/delete/:db/:coll').post(function (req, res, next) {
        if (req.body.hasOwnProperty('filter')) {
            var db = req.params.db;
            var coll = req.params.coll;
            mongo.db(db).collection(coll).deleteMany(req.body.filter, function (err, r) {
                if (err) {
                    res.json({ ok: 0, n : 0, err : err });
                } else {
                    res.json(r.result);
                }
            });
        } else {
            res.json({ ok: 0, n : 0 });
        }
    });
    
    router.route('/drop/:db/:coll').get(function (req, res, next) {
        var db = req.params.db;
        var coll = req.params.coll;
        mongo.db(db).collection(coll).drop(function (err, r) {
            if (err) {
                res.json({ ok: 0, n : 0, err : err });
            } else {
                res.json(r);
            }
        });
    });
    
    router.route('/search/:db/:coll/:skip/:limit').post(function (req, res, next) {
        if (req.body.hasOwnProperty('filter')) {
            var db = req.params.db;
            var coll = req.params.coll;
            var skip = parseInt(req.params.skip, 10);
            var limit = parseInt(req.params.limit, 10);
            if (isNaN(skip) || isNaN(limit)) {
                res.json({ ok: 0, n : 0, err: "params type err" });
            } else {
                mongo.db(db).collection(coll).find(req.body.filter).skip(skip).limit(limit).toArray(function (err, r) {
                    if (err) {
                        res.json({ ok: 0, n : 0, err : err });
                    } else {
                        res.json({ ok: 1, n : r.length, data: r });
                    }
                });
            }
        } else {
            res.json({ ok: 0, n : 0 });
        }
    });
    
    //权限测试
    router.route('/search/role/:db/:coll/:skip/:limit').post(function (req, res, next) {
        if (req.body.hasOwnProperty('filter')) {
            var db = req.params.db;
            var coll = req.params.coll;
            var skip = parseInt(req.params.skip, 10);
            var limit = parseInt(req.params.limit, 10);
            //设置权限返回内容
            var role = { _id: false, Pwd: true, Ukey: true };
            if (isNaN(skip) || isNaN(limit)) {
                res.json({ ok: 0, n : 0, err: "params type err" });
            } else {
                mongo.db(db).collection(coll).find(req.body.filter, role).skip(skip).limit(limit).toArray(function (err, r) {
                    if (err) {
                        res.json({ ok: 0, n : 0, err : err });
                    } else {
                        res.json({ ok: 1, n : r.length, data: r });
                    }
                });
            }
        } else {
            res.json({ ok: 0, n : 0 });
        }
    });
    
    router.route('/clear/:db/:coll').get(function (req, res, next) {
        var db = req.params.db;
        var coll = req.params.coll;
        mongo.db(db).collection(coll).removeMany(function (err, r) {
            if (err) {
                res.json({ ok: 0, n : 0, err : err });
            } else {
                res.json(r);
            }
        });
    });
    
    router.route('/idx/:db/:coll').post(function (req, res, next) {
        if (req.body.hasOwnProperty('index')) {
            if (!req.body.hasOwnProperty('options')) {
                req.body.options = { background: true };
            }
            var db = req.params.db;
            var coll = req.params.coll;
            mongo.db(db).collection(coll).ensureIndex(req.body.index, req.body.options, function (err, indexName) {
                if (err) {
                    res.json({ ok: 0, n : 0, err : err });
                } else {
                    res.json({ ok: 1, n : 1, data: indexName });
                }
            });
        } else {
            res.json({ ok: 0, n : 0 });
        }
    });

    router.route('/idx/:db/:coll/:idx').get(function (req, res, next) {
        var db = req.params.db;
        var coll = req.params.coll;
        mongo.db(db).collection(coll).dropIndex(req.params.idx, function (err, r) {
            if (err) {
                res.json({ ok: 0, n : 0, err : err });
            } else {
                res.json(r);
            }
        });
    });
    
    return router;
})();