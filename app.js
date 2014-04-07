var express = require('express');
var http = require('http');

var app = express();
var server = http.createServer(app);

// routing
require('./libs/routes').config(app, __dirname);

// socket.io events
require('./libs/io-events')(server);

var port = process.env.PORT || 5000;
server.listen(port);