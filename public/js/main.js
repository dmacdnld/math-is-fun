/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Round = require('./components/Round');
var PlayerList = require('./components/PlayerList');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

var Main = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('round:started', function (trivia) {
      that.setState({
        trivia: trivia,
        correctChoice: undefined,
        incorrectChoice: undefined,
        roundOver: undefined,
        winner: undefined
      });
    });

    socket.on('player:joined', function (players, trivia) {
      if (trivia) {
        that.setState({
          players: players,
          trivia: trivia
        });
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
        roundOver: true
      });
    });

    socket.on('choice:incorrect', function (correctChoice, incorrectChoice) {
      that.setState({
        correctChoice: correctChoice,
        incorrectChoice: incorrectChoice,
        roundOver: true
      });
    });

    socket.on('game:over', function (winner) {
      var secondsCount = 10;

      that.setState({
        winner: winner,
        secondsCount: secondsCount--
      });
      that.interval = setInterval(function () {
        that.setState({ secondsCount: secondsCount-- });

        if (secondsCount === 0) clearInterval(that.interval);
      }, 1000);
    });
  },

  getInitialState: function () {
    return {};
  },

  render: function() {
    var winner = this.state.winner;
    var trivia = this.state.trivia;
    var secondsCount = this.state.secondsCount;
    var secondPluralization = secondsCount > 1 ? 'seconds' : 'second';
    var countDownMessage = 'Next game in ' + secondsCount + ' ' + secondPluralization + '!';
    var startingMessage = 'Next game starting...';
    var message = secondsCount > 0 ? countDownMessage : startingMessage;
    var JsxToRender;

    if (winner) {
      JsxToRender = (
        <div id='game'>
          <h2>{ winner.name } wins with { winner.points } points!</h2>
          <div>{ message }</div>
        </div>
      );
    } else if (winner === null) {
      JsxToRender = (
        <div id='game'>
          <h2>No winner this game :(</h2>
          <div>{ message }</div>
        </div>
      );
    } else if (trivia) {
      JsxToRender = (
        <div id='game'>
          <Round trivia={ trivia } correctChoice={ this.state.correctChoice } incorrectChoice={ this.state.incorrectChoice } roundOver={ this.state.roundOver }/>
          <PlayerList players={ this.state.players } />
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