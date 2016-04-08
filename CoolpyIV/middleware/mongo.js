/**
 * Created by biles on 16/4/8.
 */

var mongoConfig = require('./../config.json').mongoConfig;
var MongoClient = require('mongodb').MongoClient;
var mongo = null;

MongoClient.connect(mongoConfig.address, {
    server: {
        poolSize: mongoConfig.poolSize
    }
}, function (err, db) {
    if (err === null) {
        mongo = db;
        console.log("Connected correctly to server");
    } else {
        console.log("Connect Error " + err);
    }
});

module.exports = mongo;