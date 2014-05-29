// base setup
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 5001;

// routing
app.get("/", function (req, res) {
  return res.sendfile(__dirname + "/index.html");
});
app.use('/', express.static(__dirname + '/public'));

// game
var Game = require('./libs/game');
var game = new Game(io);
game.init();

// start
server.listen(port);