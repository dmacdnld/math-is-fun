/** @jsx React.DOM */

var React = require('react');
var Choice = require('./Choice');

module.exports = React.createClass({
  render: function () {
    var that = this;
    var timerClassName = '';
    var roundState = this.props.roundState;

    if (roundState === 'started') {
      timerClassName = 'timer--start';
    } else if (roundState === 'over') {
      timerClassName = 'timer--stop';
    }

    return (
      <div id='round'>
        <h2 className={ 'timer ' + timerClassName }>{ this.props.trivia.equation }</h2>
        <div id='result' />
        { this.props.trivia.choices.map(function (choice) {
          return (
            <Choice
              choice={ choice }
              correct={ choice === that.props.correctChoice }
              incorrect={ choice === that.props.incorrectChoice }
              roundState={ roundState }
            />
          );
        })}
      </div>
    );
  }
});