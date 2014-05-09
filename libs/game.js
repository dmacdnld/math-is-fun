var Round = require('./round');
var Player = require('./player');
var gameConfig = require('./game-config');
var _ = require('lodash');

var Game = function () {
  "use strict";

  this.rounds = this.generateRounds();

  this.players = [];

  this.guestsCount = 0;
};

Game.prototype.generateRounds = function () {
  var rounds = new Array(Math.max(0, gameConfig.roundsLength));
  for (var i = 0; i < gameConfig.roundsLength; i++) rounds[i] = new Round();
  return rounds;
};

Game.prototype.startRound = function (emitNewRound, emitRoundEnd, emitGameEnd, startNow) {
  var delay = startNow ? 1 : gameConfig.roundDuration;
  var alreadyOver = this.over;
  var nextRoundCallback = (function () {
    this.currentRound = this.rounds.pop();
    this.currentRound.init();
    emitNewRound(this.currentRound.trivia, this.currentRound.endTime);
    this.startRound(emitNewRound, emitRoundEnd, emitGameEnd);
  }).bind(this);
  var endGameCallback = (function () {
    this.over = true;
    emitGameEnd();
  }).bind(this);

  this.timeout = setTimeout(function (self) {
    if (self.rounds.length) {
      if (startNow) {
        nextRoundCallback();
      } else {
        emitRoundEnd(self.currentRound.getAnswer());
        setTimeout(nextRoundCallback, gameConfig.roundDelay);
      }
    } else if (!alreadyOver) {
      emitRoundEnd(self.currentRound.getAnswer());
      setTimeout(endGameCallback, gameConfig.roundDelay);
    }
  }, delay, this);
};

Game.prototype.end = function () {
  clearTimeout(this.timeout);
  this.rounds.length = 0;
  this.players.length = 0;
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