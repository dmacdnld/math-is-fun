var _ = require('lodash');

var timer = require('./timer');
var Round = require('./round');
var Player = require('./player');
var gameConfig = require('./game-config');

var ROUNDS_LENGTH = gameConfig.roundsLength;
var ROUND_DURATION = gameConfig.roundDuration;
var NEXT_ROUND_DELAY = gameConfig.nextRoundDelay;
var NEXT_GAME_DELAY = gameConfig.nextGameDelay;

var Game = function (io) {
  this.io = io;
  this.timer = timer;
  this.rounds = this.generateRounds();
  this.players = [];
  this.guestsCount = 0;
};

Game.prototype.init = function () {
  this.io.on('connection', this.handleConnection.bind(this));
};

Game.prototype.handleConnection = function (socket) {
  var handlePlayerRemoval = this.handlePlayerRemoval.bind(this, socket);
  var handlePlayerApplication = this.handlePlayerApplication.bind(this, socket);
  var handleChoiceSubmission = this.handleChoiceSubmission.bind(this, socket);

  socket.on('disconnect', handlePlayerRemoval);
  socket.on('player:applied', handlePlayerApplication);
  socket.on('choice:submitted', handleChoiceSubmission);
};

Game.prototype.generateRounds = function () {
  var rounds = new Array(Math.max(0, ROUNDS_LENGTH));
  for (var i = 0; i < ROUNDS_LENGTH; i++) rounds[i] = new Round();
  return rounds;
};

Game.prototype.start = function () {
  this.startRound();
};

Game.prototype.startRound = function () {
  this.currentRound = this.rounds.pop();
  this.currentRound.start();
  this.io.sockets.in('game').emit('round:started', this.players, this.currentRound.trivia, this.currentRound.endTime);
  this.timer.start(this.endRound.bind(this), ROUND_DURATION);
};

Game.prototype.endRound = function () {
  var callback = this.rounds.length ? this.startRound : this.end;

  this.timer.stop();
  this.io.sockets.in('game').emit('round:ended', this.players, this.currentRound.getAnswer());
  this.timer.start(callback.bind(this), NEXT_ROUND_DELAY);
};

Game.prototype.end = function () {
  this.timer.stop();
  this.io.sockets.in('game').emit('game:ended', this.getWinner());
  this.restart();
};

Game.prototype.restart = function () {
  this.resetPoints();
  this.rounds = this.generateRounds();
  this.timer.start(this.start.bind(this), NEXT_GAME_DELAY);
};

Game.prototype.hasPlayerOfName = function (name) {
  return this.players.some(function (player) {
    return player.name === name;
  });
};

Game.prototype.handlePlayerApplication = function (socket, name) {
  var nameTaken = this.hasPlayerOfName(name);

  if (nameTaken) {
    socket.emit('player:rejected');
  } else {
    this.addPlayer(socket.id, name);

    if (!this.currentRound) this.start();

    socket.join('game');
    socket.emit('player:joined', this.players, this.currentRound.trivia, this.currentRound.endTime);
    socket.broadcast.to('game').emit('player:joined', this.players);
  }
};

Game.prototype.addPlayer = function (id, name) {
  var player = new Player(id, name, this.guestsCount);
  if (player.isGuest) this.guestsCount++;
  return this.players.push(player);
};

Game.prototype.handlePlayerRemoval = function (socket) {
  var player = this.getPlayer(socket.id);

  if (!player) return;

  this.removePlayer(player);
  if (this.players.length) {
    this.io.sockets.in('game').emit('player:left', this.players);
  } else {
    this.end();
  }
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

Game.prototype.handleChoiceSubmission = function (socket, choice) {
  var player = this.getPlayer(socket.id);
  var alreadyAnswered = this.currentRound.hasPlayerAnswered(player);
  var choiceIsCorrect;
  var allPlayersAnswered;

  if (alreadyAnswered) return;
  this.trackPlayersAnswered(player);

  choiceIsCorrect = this.currentRound.isChoiceCorrect(choice);
  if (choiceIsCorrect) {
    player.addPoints();
    this.endRound();
    return;
  } else {
    socket.emit('choice:rejected', this.currentRound.getAnswer(), choice);
  }

  allPlayersAnswered = this.haveAllPlayersAnswered();
  if (allPlayersAnswered) {
    this.endRound();
  }
};

Game.prototype.trackPlayersAnswered = function (player) {
  this.currentRound.playersAnswered.push(player);
};

Game.prototype.haveAllPlayersAnswered = function () {
  var playersAnswered = this.currentRound.playersAnswered;
  var currentPlayers = this.players;
  return _.isEqual(currentPlayers, _.intersection(currentPlayers, playersAnswered));
};

module.exports = Game;