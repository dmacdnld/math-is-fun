var Round = require('./round');
var Player = require('./player');
var _ = require('lodash');

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

  this.end = function () {
    clearTimeout(this.timeout);
    rounds.length = 0;
    this.players.length = 0;
  };

  this.players = [];
  this.guestsCount = 0;

  // Expose private variable for testing
  if (process.env.NODE_ENV === 'test') {
    this.rounds = rounds;
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
  if (player.isGuest) this.guestsCount++;
  return this.players.push(player);
};

Game.prototype.removePlayer = function (player) {
  var index = this.players.indexOf(player);
  if (index != -1) {
    return this.players.splice(index, 1);
  } else {
    return null;
  }
};

Game.prototype.getPlayer = function (id) {
  return _.find(this.players, function (player) {
    return player.id === id;
  });
};

Game.prototype.getWinner = function () {
  var mostPoints = _.max(_.pluck(this.players, 'points'));
  if (mostPoints === 0) return null;

  var winner = _.where(this.players, { points: mostPoints });
  return winner;
};

Game.prototype.resetPoints = function () {
  return _.invoke(this.players, 'resetPoints');
};

module.exports = Game;