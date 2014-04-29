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
        correctChoice: answer
      });
    });

    socket.on('choice:incorrect', function (choice) {
      that.setState({ incorrectChoice: choice });
    });

    socket.on('game:over', function (winner) {
      var secondsCount = 5;

      that.setState({
        winner: winner,
        secondsCount: secondsCount--
      });
      that.interval = setInterval(function () {
        that.setState({ secondsCount: secondsCount-- });

        if (!secondsCount) clearInterval(that.interval);
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
    var JsxToRender;

    if (winner) {
      JsxToRender = (
        <div>
          <div>{ winner.name } wins with { winner.points } points!</div>
          <div>Next game starts in { secondsCount } { secondPluralization }!</div>
        </div>
      );
    } else if (winner === null) {
      JsxToRender = (
        <div>
          <div>No one won this game :(</div>
          <div>Next game in { secondsCount } { secondPluralization }!</div>
        </div>
      );
    } else if (trivia) {
      JsxToRender = (
        <div>
          <Round trivia={ trivia } correctChoice={ this.state.correctChoice } incorrectChoice={ this.state.incorrectChoice }/>
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