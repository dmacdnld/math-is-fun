/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Message = require('./components/Message');
var Round = require('./components/Round');
var PlayerList = require('./components/PlayerList');
var io = require('socket.io-client');
var socket = io(window.location.hostname);

var Main = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('player:joined', function (players, trivia, timeLeft) {

      if (arguments.length > 1) {
        that.setState({
          players: players,
          trivia: trivia,
          timeLeft: timeLeft
        });
      } else {
        that.setState({ players: players });
      }
    });

    socket.on('round:started', function (players, trivia, timeLeft) {
      that.setState({
        players: players,
        trivia: trivia,
        correctChoice: undefined,
        incorrectChoice: undefined,
        timeLeft: timeLeft,
        winner: false
      });
    });

    socket.on('player:left', function (players) {
      that.setState({ players: players });
    });

    socket.on('choice:rejected', function (correctChoice, incorrectChoice) {
      that.setState({
        correctChoice: correctChoice,
        incorrectChoice: incorrectChoice,
        timeLeft: 0
      });
    });

    socket.on('round:ended', function (players, answer) {
      that.setState({
        players: players,
        correctChoice: answer,
        timeLeft: 0
      });
    });

    socket.on('game:ended', function (winner) {
      var timeUntilNextGame = 5;

      that.setState({
        winner: winner,
        timeUntilNextGame: timeUntilNextGame--,
        timeLeft: 0
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
    var timeLeft = this.state.timeLeft;
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
            timeLeft={ timeLeft }
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