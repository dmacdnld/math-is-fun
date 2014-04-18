var express = require("express");

exports.config = function (app, dirname) {

    app.get("/", function (req, res) {
        return res.sendfile(dirname + "/index.html");
    });

    app.use('/', express.static(dirname + '/public'));
};