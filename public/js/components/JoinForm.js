/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('player:invalid', function () {
      that.setState({ playerInvalid: true });
    });
  },

  getInitialState: function () {
    return { playerInvalid: false };
  },

  submitForm: function (event) {
    event.preventDefault();

    var name = this.refs.name.getDOMNode().value.trim();
    return socket.emit('player:applied', name);
  },

  render: function () {
    var errorMessageStyle = {
      display: this.state.playerInvalid ? '' : 'none'
    };

    return (
      <form onSubmit={this.submitForm}>
        <label htmlFor='name'>Pick a name</label><br />
        <input id='name' type='text' placeholder='e.g. Mathemagician' ref='name'/><br />
        <div style={errorMessageStyle}>Name already taken</div>
        <button type='submit'>Join the game!</button>
      </form>
    );
  }
});