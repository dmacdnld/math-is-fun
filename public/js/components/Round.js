/** @jsx React.DOM */

var React = require('react');
var _ = require('lodash');
var Choice = require('./Choice');
var gameConfig = require('../../../libs/game-config');
var ROUND_DURATION = gameConfig.roundDuration;

module.exports = React.createClass({
  componentDidMount: function () {
    var currentTime = this.props.currentTime;
    var roundEndTime = this.props.roundEndTime;
    var timeDiff = roundEndTime.diff(currentTime);

    if (timeDiff < (ROUND_DURATION - 120)) {
      this.addTimerStyle(timeDiff);
    }
  },

  componentWillUpdate: function () {
    this.deleteTimerStyle();
  },

  addTimerStyle: function (timeDiff) {
    var startingPoint = ((timeDiff / ROUND_DURATION) * 100).toFixed(2);
    var animationName = 'Timer--' + timeDiff;
    var animation = '#equation::before { ' +
      'animation: '+ animationName + ' ' + timeDiff + 'ms linear forwards; ' +
      '-webkit-animation: ' + animationName + ' ' + timeDiff + 'ms linear forwards; ' +
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
    var roundEndTime = this.props.roundEndTime;
    var currentTime = this.props.currentTime;
    var correctChoice = this.props.correctChoice;
    var incorrectChoice = this.props.incorrectChoice;
    var timerClassName = '';

    if (roundEndTime && roundEndTime.diff(currentTime) >= (ROUND_DURATION - 120)) {
      timerClassName = 'timer--start';
    } else if (currentTime.isSame(roundEndTime) || currentTime.isAfter(roundEndTime)) {
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
              roundEndTime={ roundEndTime }
              currentTime={ currentTime }
            />
          );
        })}
      </div>
    );
  }
});