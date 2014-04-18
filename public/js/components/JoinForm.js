/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  getInitialState: function () {
    var that = this;

    socket.on('user:invalid', function () {
      that.setState({ invalid: true });
    });

    return { invalid: false };
  },
  submitForm: function (event) {
    event.preventDefault();

    var username = this.refs.username.getDOMNode().value.trim();
    return socket.emit('user:applied', username);
  },
  render: function () {
    return (
      <form onSubmit={this.submitForm}>
        <label htmlFor='username'>Enter a username</label>
        <input id='username' type='text' placeholder='e.g. Mathemagician' ref='username'/>
        <button type='submit'>Join the game!</button>
      </form>
    );
  }
});