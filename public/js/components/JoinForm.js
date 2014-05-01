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

    return socket.emit('player:applied', name);
  },

  render: function () {
    var invalidReason = this.state.invalidReason;
    var errorMessages = {
      taken: "Sorry, that name is taken",
      missing: "Sorry, we need a name"
    };
    var errorMessage = errorMessages[invalidReason];
    var errorClass = invalidReason ? 'error' : 'hidden';

    return (
      <form id="join-form" onSubmit={this.submitForm}>
        <label htmlFor='name'>Choose a name</label>
        <input id='name' type='text' placeholder='e.g. Mathlete' ref='name' autofocus/>
        <div className={ errorClass }>{ errorMessage }</div>
        <small>or join as a guest</small>
        <button className='btn btn--primary' type='submit'>Start playing!</button>
      </form>
    );
  }
});