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
    var value = this.props.value;
    var correctChoice = this.props.correctChoice;
    var incorrectChoice = this.props.incorrectChoice;
    var roundEndTime = this.props.roundEndTime;
    var currentTime = this.props.currentTime;
    var className = '';

    if (value === correctChoice) {
      className = 'btn--correct';
    } else if (value === incorrectChoice) {
      className = 'btn--incorrect';
    } else if (currentTime.isSame(roundEndTime)) {
      className = 'btn--muted';
    }

    return (
      <form onSubmit={ this.submitChoice }>
        <input type='hidden' value={ value } />
        <button type='submit' className={ 'btn ' + className }>{ value }</button>
      </form>
    );
  }
});