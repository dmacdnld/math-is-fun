/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./JoinForm');
var Round = require('./Round');
var PlayerList = require('./PlayerList');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);
var moment = require('moment');
var _ = require('lodash');

module.exports = React.createClass({
  getNextRoundMessage: function () {
    return this.getNextMessage(this.props.timeUntilNextRound, 'round');
  },

  getNextGameMessage: function () {
    return this.getNextMessage(this.props.timeUntilNextGame, 'game');
  },

  getNextMessage: function (timeUntilNext, type) {
    var secondPluralization = timeUntilNext > 1 ? 'seconds' : 'second';
    var countDownMessage = 'Join the next ' + type + ' in ' + timeUntilNext + ' ' + secondPluralization + '!';
    var startingMessage = 'Next ' + type + ' starting...';
    return timeUntilNext > 0 ? countDownMessage : startingMessage;
  },

  getWinningMessage: function (winner) {
    var tyingPlayers;

    if (!winner) return 'No winner this game :(';
    if (winner.length === 1) return winner[0].name + ' wins with ' + winner[0].points + ' points!';
    if (winner.length > 2) {
      tyingPlayers = _.reduce(winner, function(memo, player, index) {
        if (index < winner.length - 2) return memo + player.name + ', ';
        if (index < winner.length - 1) return memo + player.name + ', and ';
        return memo + player.name;
      }, '');
    } else if (winner.length === 2) {
      tyingPlayers = _.pluck(winner, 'name').join(' and ');
    }

    return tyingPlayers + ' tie with ' + _.first(winner).points + ' points!';
  },

  render: function() {
    var winner = this.props.winner;
    var roundState = this.props.roundState;
    var waitingForNext = this.props.waitingForNext;
    var nextMessage;

    if (waitingForNext === 'round') {
      nextMessage = this.getNextRoundMessage();
      return (
        <div id='game'>
          <h2>Game in progress</h2>
          <div>{ nextMessage }</div>
        </div>
      );
    }

    nextMessage = this.getNextGameMessage();
    winningMessage = this.getWinningMessage(winner);
    return (
      <div id='game'>
        <h2>{ winningMessage }</h2>
        <div>{ nextMessage }</div>
      </div>
    );
  }
});