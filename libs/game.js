var Round = require('./round');
var Player = require('./player');
var find = require('lodash.find');

var Game = function () {
  "use strict";

  var ROUNDS_LENGTH = 8;
  var ROUND_DURATION = 10000;
  var rounds = (function () {
    var rounds = new Array(Math.max(0, ROUNDS_LENGTH));
    for (var i = 0; i < ROUNDS_LENGTH; i++) rounds[i] = new Round();
    return rounds;
  })();

  this.startRound = function (emitNewRound, emitGameEnd, startNow) {
    var delay = startNow ? 1 : ROUND_DURATION;
    var alreadyOver = this.over;

    this.timeout = setTimeout(function (self) {
      if (rounds.length) {
        self.currentRound = rounds.pop();
        emitNewRound(self.currentRound.trivia);
        self.startRound(emitNewRound, emitGameEnd);
      } else if (!alreadyOver) {
        self.over = true;
        emitGameEnd();
      }
    }, delay, this);
  };

  this.isInProgress = function () {
    return rounds.length > 0;
  };

  this.players = [];

  // Expose private variable for testing
  if (process.env.NODE_ENV === 'test') {
    this.ROUND_DURATION = ROUND_DURATION;
    this.ROUNDS_LENGTH = ROUNDS_LENGTH;
  }
};

Game.prototype.hasPlayerOfName = function (name) {
  return this.players.some(function (player) {
    return player.name === name;
  });
};

Game.prototype.addPlayer = function (player) {
  if (!(player instanceof Player)) return null;
  return this.players.push(player);
};

Game.prototype.getPlayer = function (id) {
  return find(this.players, function (player) {
    return player.id === id;
  });
};

module.exports = Game;