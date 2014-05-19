/** @jsx React.DOM */

var React = require('react');
var Choice = require('./Choice');

module.exports = React.createClass({
  render: function () {
    var trivia = this.props.trivia;
    var roundEndTime = this.props.roundEndTime;
    var currentTime = this.props.currentTime;
    var correctChoice = this.props.correctChoice;
    var incorrectChoice = this.props.incorrectChoice;
    var timerClassName;

    if (currentTime.isBefore(roundEndTime)) {
      timerClassName = 'timer--start';
    } else {
      timerClassName = 'timer--stop';
    }

    return (
      <div id='round'>
        <h2 className={ 'timer ' + timerClassName }>{ trivia.equation }</h2>
        { trivia.choices.map(function (value) {
          return (
            <Choice
              value={ value }
              correctChoice={ correctChoice }
              incorrectChoice={ incorrectChoice }
              roundEndTime={ roundEndTime }
              currentTime={ currentTime }
            />
          );
        })}
      </div>
    );
  }
});