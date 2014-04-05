var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

io.configure('production', function(){
  io.enable('browser client minification');
  io.enable('browser client etag');
  io.enable('browser client gzip');
  io.set('log level', 1);

  io.set('transports', [
    'websocket',
    'htmlfile',
    'xhr-polling',
    'jsonp-polling',
  ]);
});

io.configure('development', function(){
  io.set('transports', ['websocket']);
});

var port = process.env.PORT || 5000;
server.listen(port);

// routing
require('./libs/routes').config(app, __dirname);

var trivia = {
  question: "1+1",
  answerChoices: { a: 0, b: 1, c: 2, d: 3 }
};

io.sockets.on('connection', function (socket) {
  socket.emit('trivia', trivia);
});