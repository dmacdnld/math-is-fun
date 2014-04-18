/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Round = require('./components/Round');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

var Game = React.createClass({
  getInitialState: function () {
    var that = this;

    socket.on('user:joined', function (trivia) {
      that.setState({
        equation: trivia.equation,
        choices: trivia.choices
      });
    });

    return { equation: null, choices: null };
  },
  render: function() {
    return this.state.equation
      ? <Round equation={this.state.equation} choices={this.state.choices} />
      : <JoinForm />;
  }
});

module.exports = Game;

React.renderComponent(
  <Game />,
  document.getElementById('game')
);