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
    var correctStyle = { color: '#0F0' };
    var incorrectStyle = { color: '#F00' };
    var style = this.props.correct ? correctStyle : this.props.incorrect ? incorrectStyle : {};

    return (
      <form onSubmit={ this.submitChoice }>
        <input type='hidden' value={ choice } />
        <button type='submit' style={ style }>{ choice }</button>
      </form>
    );
  }
});