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
    var correctClass = 'btn--correct';
    var incorrectClass = 'btn--incorrect';
    var className = this.props.correct ? correctClass : this.props.incorrect ? incorrectClass : '';

    return (
      <form onSubmit={ this.submitChoice }>
        <input type='hidden' value={ choice } />
        <button type='submit' className={ 'btn ' + className } disabled={ this.props.roundOver }>{ choice }</button>
      </form>
    );
  }
});