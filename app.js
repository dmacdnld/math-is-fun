var express = require('express');
var http = require('http');
var socket = require('socket.io');

var app = express();
var server = http.createServer(app);
var io = socket.listen(server);

server.listen(8002);

// routing
require('./libs/routes').config(app, __dirname);

var trivia = {
  question: "1+1",
  answerChoices: { a: 0, b: 1, c: 2, d: 3 }
};

io.sockets.on('connection', function (socket) {
  socket.emit('trivia', trivia);
});