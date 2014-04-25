/** @jsx React.DOM */

var React = require('react');
var JoinForm = require('./components/JoinForm');
var Round = require('./components/Round');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

var Main = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('round:started', function (round) {
      that.setState({ trivia: round.trivia });
    });

    socket.on('player:joined', function (players) {
      that.setState({ players: players });
    });
  },

  getInitialState: function () {
    return { trivia: null };
  },

  render: function() {
    return this.state.trivia
      ? <Round trivia={ this.state.trivia } players={ this.state.players } />
      : <JoinForm />;
  }
});

React.renderComponent(
  <Main />,
  document.getElementById('main')
);

module.exports = Main;