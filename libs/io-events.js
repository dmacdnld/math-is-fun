var sio = require('socket.io');
var Player = require('./player');
var Game = require('./game');
var Round = require('./round');

module.exports = function (server) {
  "use strict";

  var io = sio.listen(server);
  var game;

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

  io.sockets.on('connection', function (client) {
    client.on('player:applied', function (name) {
      var emitNewRound = function (round) {
        io.sockets.in('game').emit('round:started', round);
      };
      var emitGameEnd = function () {
        io.sockets.in('game').emit('game:ended');
      };

      if (game && game.isInProgress()) {
        if (game.hasPlayerOfName(name)) {
          client.emit('player:invalid');
        } else {
          game.addPlayer(new Player(name));

          client.join('game');
          io.sockets.in('game').emit('player:joined', game.players);
        }
      } else {
        game = new Game();
        game.addPlayer(new Player(name));

        client.join('game');
        io.sockets.in('game').emit('player:joined', game.players);

        game.cycleRounds(emitNewRound, emitGameEnd, true);
      }
    });

    client.on('choice:submitted', function (choice) {

      console.log(choice);

    });
  });
};