/** @jsx React.DOM */

var React = require('react');
var io = require('socket.io-client');
var socket = io.connect(window.location.hostname);

module.exports = React.createClass({
  componentWillMount: function () {
    var that = this;

    socket.on('choice:validated', function (choiceIsCorrect) {
      that.setState({ choiceIsCorrect: choiceIsCorrect });
    });
  },

  getInitialState: function () {
    return { choiceIsCorrect: null };
  },

  submitChoice: function (event) {
    event.preventDefault();

    var choice = event.currentTarget.firstChild.value;

    return socket.emit('choice:submitted', choice);
  },

  render: function () {
    var choices = this.props.trivia.choices;
    var equation = this.props.trivia.equation;

    return (
      <div>
        <div id="equation">{ equation }</div>
        <div id="result" />
        <form onSubmit={this.submitChoice}>
          <input type="hidden" value={ choices[0] } />
          <button type="submit">{ choices[0] }</button>
        </form>
        <form onSubmit={this.submitChoice}>
          <input type="hidden" value={ choices[1] } />
          <button type="submit">{ choices[1] }</button>
        </form>
        <form onSubmit={this.submitChoice}>
          <input type="hidden" value={ choices[2] } />
          <button type="submit">{ choices[2] }</button>
        </form>
        <form onSubmit={this.submitChoice}>
          <input type="hidden" value={ choices[3] } />
          <button type="submit">{ choices[3] }</button>
        </form>
      </div>
    );
  }
});