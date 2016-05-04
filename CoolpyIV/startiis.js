var http = require('http');
var cluster = require('cluster');
var fs = require('fs');
var app = require('./app.js');

if (!process.env.mode) {
    app.listen(process.env.PORT);
}
else {
    if (cluster.isMaster) {
        var cpus = require('os').cpus().length;
        var procs = Math.ceil(0.8 * cpus);
        for (var i = 0; i < procs; i++) cluster.fork();
        cluster.on("exit", function (worker, code) {
            if (code != 0) {
                cluster.fork();
            }
        });
    } else {
        app.listen(process.env.PORT);
    }
}


