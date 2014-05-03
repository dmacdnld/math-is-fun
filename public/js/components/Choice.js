/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  submitChoice: function (event) {
    event.preventDefault();

    var choice = parseFloat(event.currentTarget.firstChild.value);
    return socket.emit('choice:submitted', choice);
  },

  render: function () {
    var choice = this.props.choice;
    var className = '';

    if (this.props.correct) {
      className = 'btn--correct';
    } else if (this.props.incorrect) {
      className = 'btn--incorrect';
    }
    else if (this.props.roundOver) {
      className = 'btn--muted';
    }

    return (
      <form onSubmit={ this.submitChoice }>
        <input type='hidden' value={ choice } />
        <button type='submit' className={ 'btn ' + className }>{ choice }</button>
      </form>
    );
  }
});