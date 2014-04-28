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
        correctChoice: null,
        incorrectChoice: null
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

    socket.on('round:answered', function (players, answer) {
      that.setState({
        players: players,
        correctChoice: answer
      });
    });

    socket.on('choice:incorrect', function (choice) {
        that.setState({ incorrectChoice: choice });
    });
  },

  getInitialState: function () {
    return { trivia: null };
  },

  render: function() {
    var trivia = this.state.trivia;
    var JsxToRender;

    if (trivia) {
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