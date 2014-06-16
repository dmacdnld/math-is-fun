/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');
var Choice = require('./Choice');
var gameConfig = require('../../../libs/game-config');
var ROUND_DURATION = gameConfig.roundDuration;

module.exports = React.createClass({
  componentDidMount: function () {
    var timeLeft = this.props.timeLeft;

    if (timeLeft) {
      this.addTimerStyle(timeLeft);
    }
  },

  componentWillReceiveProps: function (nextProps) {
    this.deleteTimerStyle();

    if (nextProps.timeLeft) {
      this.addTimerStyle(nextProps.timeLeft);
    }
  },

  addTimerStyle: function (timeLeft) {
    var startingPoint = ((timeLeft / ROUND_DURATION) * 100).toFixed(2);
    var animationName = 'Timer--' + timeLeft;
    var animation = '#equation::before { ' +
      'animation: '+ animationName + ' ' + timeLeft + 'ms linear forwards; ' +
      '-webkit-animation: ' + animationName + ' ' + timeLeft + 'ms linear forwards; ' +
    '}';
    var keyframes = 'from { ' +
      '-webkit-transform: translateX(-' + startingPoint + '%); ' +
      'transform: translateX(-' + startingPoint + '%); ' +
    '} ' +
    'to { ' +
      '-webkit-transform: translateX(0); ' +
      'transform: translateX(0); ' +
    '}';
    var standardKeyframes = '@keyframes ' + animationName + ' { ' + keyframes + ' }';
    var webkitKeyframes = '@-webkit-keyframes ' + animationName + ' { ' + keyframes + ' }';
    var bodyEl = document.querySelector('body');

    document.styleSheets[0].insertRule(animation, 0);
    if (bodyEl.style.animationName != null) {
      document.styleSheets[0].insertRule(standardKeyframes, 0);
    } else {
      document.styleSheets[0].insertRule(webkitKeyframes, 0);
    }
  },

  deleteTimerStyle: function () {
    var styleSheet = document.styleSheets[0];
    var timerRule = styleSheet.cssRules[0].name;
    var timerRuleIndex = timerRule ? timerRule.indexOf('Timer--') : -1;

    if (timerRuleIndex > -1) {
      styleSheet.deleteRule(0); // Delete the keyframes rule
      styleSheet.deleteRule(0); // Delete the animation rule
    }
  },

  render: function () {
    var trivia = this.props.trivia;
    var timeLeft = this.props.timeLeft;
    var correctChoice = this.props.correctChoice;
    var incorrectChoice = this.props.incorrectChoice;
    var timerClassName = '';

    if (timeLeft === 0) {
      timerClassName = 'timer--stop';
    }

    return (
      <div id='round'>
        <h2 id='equation' className={ 'timer ' + timerClassName } ref="timer">{ trivia.equation }</h2>
        { trivia.choices.map(function (value) {
          return (
            <Choice
              value={ value }
              correctChoice={ correctChoice }
              incorrectChoice={ incorrectChoice }
              timeLeft={ timeLeft }
            />
          );
        })}
      </div>
    );
  }
});