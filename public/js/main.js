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

    socket.on('round:started', function (round) {
      that.setState({ trivia: round.trivia });
    });

    socket.on('player:joined', function (players, round) {
      if (round) {
        that.setState({
          players: players,
          trivia: round.trivia
        });
      } else {
        that.setState({ players: players });
      }
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
          <Round trivia={ trivia } />
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