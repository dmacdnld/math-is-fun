/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Message = require('./components/Message');
var Round = require('./components/Round');
var PlayerList = require('./components/PlayerList');
var io = require('socket.io-client');
var socket = io(window.location.hostname);
var moment = require('moment');

var Main = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('player:joined', function (players, trivia, roundEndTime) {
      if (arguments.length > 1) {
        that.setState({
          players: players,
          trivia: trivia,
          roundEndTime: moment.utc(roundEndTime),
          currentTime: moment.utc()
        });
      } else {
        that.setState({ players: players });
      }
    });

    socket.on('round:started', function (players, trivia, roundEndTime) {
      that.setState({
        players: players,
        trivia: trivia,
        correctChoice: undefined,
        incorrectChoice: undefined,
        roundEndTime: moment.utc(roundEndTime),
        currentTime: moment.utc(),
        winner: false
      });
    });

    socket.on('player:left', function (players) {
      that.setState({ players: players });
    });

    socket.on('choice:rejected', function (correctChoice, incorrectChoice) {
      var roundEndTime = moment.utc();

      that.setState({
        correctChoice: correctChoice,
        incorrectChoice: incorrectChoice,
        roundEndTime: roundEndTime,
        currentTime: roundEndTime
      });
    });

    socket.on('round:ended', function (players, answer) {
      var roundEndTime = moment.utc();
      that.setState({
        players: players,
        correctChoice: answer,
        roundEndTime: roundEndTime,
        currentTime: roundEndTime
      });
    });

    socket.on('game:ended', function (winner) {
      var timeUntilNextGame = 5;

      that.setState({
        winner: winner,
        timeUntilNextGame: timeUntilNextGame--,
        roundEndTime: null
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
    var correctChoice = this.state.correctChoice;
    var incorrectChoice = this.state.incorrectChoice;
    var roundEndTime = this.state.roundEndTime;
    var currentTime = this.state.currentTime;
    var timeUntilNextGame = this.state.timeUntilNextGame;
    var players = this.state.players;
    var JsxToRender;

    if (winner) {
      JsxToRender = (
        <Message
          winner={ winner }
          timeUntilNextGame={ timeUntilNextGame }
        />
      );
    } else if (trivia) {
      JsxToRender = (
        <div id='game'>
          <Round
            trivia={ trivia }
            correctChoice={ correctChoice }
            incorrectChoice={ incorrectChoice }
            roundEndTime={ roundEndTime }
            currentTime={ currentTime }
          />
          <div id='player-section'>
            <h2>Players</h2>
            <PlayerList players={ players } />
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