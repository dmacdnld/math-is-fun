import React from 'react';
import _ from 'lodash';

import Choice from './choice';
import { ROUND_DURATION } from '../game-config';

class Round extends React.Component {
  componentDidMount() {
    const { timeLeft } = this.props;

    if (timeLeft) {
      this.addTimerStyle(timeLeft);
    }
  }

  componentWillReceiveProps(nextProps) {
    this.deleteTimerStyle();

    if (nextProps.timeLeft) {
      this.addTimerStyle(nextProps.timeLeft);
    }
  }

  addTimerStyle(timeLeft) {
console.log('RoundComponent.addTimerStyle', startingPoint);
    const startingPoint = ((timeLeft / ROUND_DURATION) * 100).toFixed(2);
    const animationName = `Timer--${ timeLeft }`;
    const animation = ` .round__timer::after {
                          animation: ${ animationName } ${ timeLeft }ms linear forwards;
                          -webkit-animation: ${ animationName } ${ timeLeft }ms linear forwards;
                        }`;
    const keyframes = ` from {
                          -webkit-transform: translateX(-${ startingPoint }%);
                          transform: translateX(-${ startingPoint }%);
                        }
                        to {
                          -webkit-transform: translateX(0);
                          transform: translateX(0);
                        }`;
    const standardKeyframes = `@keyframes ${ animationName } { ${ keyframes } }`;
    const webkitKeyframes = `@-webkit-keyframes ${ animationName } { ${ keyframes } }`;
    const bodyEl = document.querySelector('body');

    document.styleSheets[0].insertRule(animation, 0);
    if (bodyEl.style.animationName != null) {
      document.styleSheets[0].insertRule(standardKeyframes, 0);
    } else {
      document.styleSheets[0].insertRule(webkitKeyframes, 0);
    }
  }

  deleteTimerStyle() {
    const styleSheet = document.styleSheets[0];
    const timerRule = styleSheet.cssRules[0].name;
    const timerRuleIndex = timerRule && timerRule.indexOf('Timer--') === 0;

    if (timerRuleIndex > -1) {
      styleSheet.deleteRule(0); // Delete the keyframes rule
      styleSheet.deleteRule(0); // Delete the animation rule
    }
  }

  render() {
    const { emitAnswerSubmission, trivia, timeLeft, roundNumber, roundsTotal } = this.props;
    const { answer } = trivia;
    const roundEnded = timeLeft === 0;
    let timerClassName = roundEnded ? 'round__timer--stopped' : '';

    return (
      <div className='round'>
        <h2>Round { roundNumber }/{ roundsTotal } </h2>
        <h3 className={ `round__timer ${ timerClassName }` } ref='timer'>{ trivia.equation }</h3>
        { trivia.choices.map((choice, i) => {
          const needsAutofocus = roundNumber === 1 && i === 0;

          return (
            <Choice
              key={ i }
              emitAnswerSubmission={ emitAnswerSubmission }
              choice={ choice }
              roundEnded={ roundEnded }
              answer={ answer }
              needsAutofocus={ needsAutofocus }
            />
          );
        })}
      </div>
    );
  }
};

export default Round;
