var Round = require('./round');
var Player = require('./player');

var Game = function () {
  "use strict";

  var ROUNDS_LENGTH = 8;
  var ROUND_DURATION = 45000;
  var rounds = (function () {
    var rounds = new Array(Math.max(0, ROUNDS_LENGTH));
    for (var i = 0; i < ROUNDS_LENGTH; i++) rounds[i] = new Round();
    return rounds;
  })();

  this.cycleRounds = function (emitNewRound, emitGameEnd, startNow) {
    var intervalsLength = ROUNDS_LENGTH + 1;

    if (startNow) {
      emitNewRound(rounds.pop());
      intervalsLength--;
    }

    setInterval(function () {
      if (rounds.length) {
        return emitNewRound(rounds.pop());
      } else {
        return emitGameEnd();
      }

    }, ROUND_DURATION, intervalsLength);
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

module.exports = Game;