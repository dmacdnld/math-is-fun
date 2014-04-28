/** @jsx React.DOM */

var React = require('react');
var Choice = require('./Choice');

module.exports = React.createClass({
  shouldComponentUpdate: function () {
    return true;
  },

  render: function () {
    var choices = this.props.trivia.choices;
    var equation = this.props.trivia.equation;
    var correctChoice = this.props.correctChoice;
    var incorrectChoice = this.props.incorrectChoice;

    return (
      <div>
        <div id='equation'>{ equation }</div>
        <div id='result' />
        {choices.map(function (choice) {
          return <Choice choice={ choice } correct={ choice === correctChoice } incorrect={ choice === incorrectChoice } />;
        })}
      </div>
    );
  }
});