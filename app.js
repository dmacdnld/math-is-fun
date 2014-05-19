var express = require('express');
var http = require('http');
var sio = require('socket.io');

var app = express();
var server = http.createServer(app);

// routing
require('./libs/routes').config(app, __dirname);

// socket.io
var io = sio.listen(server);

io.configure('production', function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.enable('browser client gzip');
  io.set('log level', 1);

  io.set('transports', [
    'websocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling'
  ]);
});

io.configure('development', function(){
  io.set('transports', ['websocket']);
});

// game
var Game = require('./libs/game');
var game = new Game(io);
game.init();

var port = process.env.PORT || 5000;
server.listen(port);