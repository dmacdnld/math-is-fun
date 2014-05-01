/** @jsx React.DOM */

var React = require('react');
var Choice = require('./Choice');

module.exports = React.createClass({
  shouldComponentUpdate: function () {
    return true;
  },

  render: function () {
    var that = this;

    return (
      <div id='round'>
        <h2 id='equation'>{ this.props.trivia.equation }</h2>
        <div id='result' />
        {this.props.trivia.choices.map(function (choice) {
          return (
            <Choice
              choice={ choice }
              correct={ choice === that.props.correctChoice }
              incorrect={ choice === that.props.incorrectChoice }
              roundOver={ that.props.roundOver } />
          );;
        })}
      </div>
    );
  }
});