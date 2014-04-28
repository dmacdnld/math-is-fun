var sio = require('socket.io');
var Player = require('./player');
var Game = require('./game');
var Round = require('./round');

module.exports = function (server) {
  "use strict";

  var io = sio.listen(server);
  var game;
  var emitNewRound = function (trivia) {
    io.sockets.in('game').emit('round:started', trivia);
  };
  var emitGameEnd = function () {
    io.sockets.in('game').emit('game:ended');
    setTimeout(function () {
      var players = game.players;
      game = new Game();
      game.players = players;
      game.startRound(emitNewRound, emitGameEnd, true);
    }, 5000);
  };

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
      if (game && game.isInProgress()) {
        if (game.hasPlayerOfName(name)) {
          client.emit('player:invalid');
        } else {
          game.addPlayer(new Player(client.id, name));

          client.join('game');
          client.broadcast.to('game').emit('player:joined', game.players);
          client.emit('player:joined', game.players, game.currentRound.trivia);
        }
      } else {
        game = new Game();
        game.addPlayer(new Player(client.id, name));

        client.join('game');
        io.sockets.in('game').emit('player:joined', game.players);

        game.startRound(emitNewRound, emitGameEnd, true);
      }
    });

    client.on('choice:submitted', function (choice) {
      var player = game.getPlayer(client.id);
      var currentRound = game.currentRound;
      var alreadyAnswered = currentRound.hasPlayerAnswered(player);
      var choiceIsCorrect;
      var allPlayersAnswered;

      if (alreadyAnswered) return;

      currentRound.playersAnswered.push(player);

      choiceIsCorrect = currentRound.isChoiceCorrect(choice);
      allPlayersAnswered = currentRound.playersAnswered.length === game.players.length;

      if (choiceIsCorrect) {
        player.addPoints();
        io.sockets.in('game').emit('round:answered', game.players, game.currentRound.getAnswer());
      }
      else {
        client.emit('choice:incorrect', choice);
      }

      if (choiceIsCorrect || allPlayersAnswered) {
        clearTimeout(game.timeout);
        setTimeout(function () {
          game.startRound(emitNewRound, emitGameEnd, true);
        }, 2000);
      }
    });
  });
};