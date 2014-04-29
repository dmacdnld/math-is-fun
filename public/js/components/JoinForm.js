/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('player:invalid', function () {
      that.setState({ invalidReason: 'taken' });
    });
  },

  getInitialState: function () {
    return { invalidReason: null };
  },

  submitForm: function (event) {
    event.preventDefault();

    var name = this.refs.name.getDOMNode().value.trim();

    if (name === '') {
      return this.setState({ invalidReason: 'missing' });
    }

    return socket.emit('player:applied', name);
  },

  render: function () {
    var invalidReason = this.state.invalidReason;
    var errorMessages = {
      taken: "Sorry, that name is taken",
      missing: "Sorry, we need a name"
    };
    var errorMessage = errorMessages[invalidReason];
    var errorStyle = invalidReason ? {} : { display: 'hidden' };

    return (
      <form onSubmit={this.submitForm}>
        <label htmlFor='name'>Name</label><br />
        <input id='name' type='text' placeholder='e.g. Mathemagician' ref='name'/><br />
        <div style={errorStyle}>{ errorMessage }</div>
        <button type='submit'>Join the game!</button>
      </form>
    );
  }
});