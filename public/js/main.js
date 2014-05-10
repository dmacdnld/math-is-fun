/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Message = require('./components/Message');
var Round = require('./components/Round');
var PlayerList = require('./components/PlayerList');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);
var moment = require('moment');

var Main = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('round:started', function (trivia) {
      that.setState({
        trivia: trivia,
        correctChoice: undefined,
        incorrectChoice: undefined,
        roundState: 'started',
        waitingForNext: null,
        winner: false
      });
    });

    socket.on('player:joined', function (players, roundEndTime) {
      if (roundEndTime) {
        var timeUntilNextRound = moment.utc(roundEndTime).diff(moment.utc(), 's');

        that.setState({
          players: players,
          roundState: 'started',
          waitingForNext: 'round',
          timeUntilNextRound: --timeUntilNextRound
        });
        that.interval = setInterval(function () {
          that.setState({ timeUntilNextRound: --timeUntilNextRound });

          if (timeUntilNextRound === 0) clearInterval(that.interval);
        }, 1000);
      } else {
        that.setState({ players: players });
      }
    });

    socket.on('player:left', function (players) {
      that.setState({ players: players });
    });

    socket.on('round:answered', function (players, answer) {
      that.setState({
        players: players,
        correctChoice: answer,
        roundState: 'over'
      });
    });

    socket.on('choice:incorrect', function (correctChoice, incorrectChoice) {
      that.setState({
        correctChoice: correctChoice,
        incorrectChoice: incorrectChoice,
        roundState: 'over'
      });
    });

    socket.on('round:over', function (answer) {
      that.setState({
        correctChoice: answer,
        roundState: 'over'
      });
    });

    socket.on('game:over', function (winner) {
      var timeUntilNextGame = 10;

      that.setState({
        winner: winner,
        timeUntilNextGame: timeUntilNextGame--,
        waitingForNext: 'game',
        roundState: null
      });
      that.interval = setInterval(function () {
        that.setState({ timeUntilNextGame: timeUntilNextGame-- });

        if (timeUntilNextGame === 0) clearInterval(that.interval);
      }, 1000);
    });
  },

  getInitialState: function () {
    return {};
  },

  render: function() {
    var winner = this.state.winner;
    var trivia = this.state.trivia;
    var roundState = this.state.roundState;
    var waitingForNext = this.state.waitingForNext;
    var timeUntilNextRound = this.state.timeUntilNextRound;
    var timeUntilNextGame = this.state.timeUntilNextGame;
    var JsxToRender;

    if (waitingForNext) {
      JsxToRender = (
        <Message
          winner={ winner }
          roundState={ roundState }
          waitingForNext={ waitingForNext }
          timeUntilNextRound={ timeUntilNextRound }
          timeUntilNextGame={ timeUntilNextGame }
        />
      );
    } else if (trivia) {
      JsxToRender = (
        <div id='game'>
          <Round
            trivia={ trivia }
            correctChoice={ this.state.correctChoice }
            incorrectChoice={ this.state.incorrectChoice }
            roundState={ this.state.roundState }
          />
          <div id='player-section'>
            <h2>Players</h2>
            <PlayerList players={ this.state.players } />
          </div>
        </div>
      );
    } else {
      JsxToRender = <JoinForm />
    }

    return JsxToRender;
  }
});

React.renderComponent(
  <Main />,
  document.getElementById('main')
);

module.exports = Main;