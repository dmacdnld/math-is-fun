import _ from 'lodash';

import * as Player from '../../server/lib/player';
import { EQUATION_OPERATOR_OPTIONS, CHOICES_LENGTH, ROUND_DURATION } from '../../shared/game-config';

const getRandomOperator = () => EQUATION_OPERATOR_OPTIONS[_.random(0, EQUATION_OPERATOR_OPTIONS.length - 1)];

const generateChoices = (answer) => {
  const choices = [];
  const correctChoiceIndex = _.random(0, CHOICES_LENGTH - 1);
  const generateChoice = (choices, updatedChoice) => {
    const min = answer - _.random(1, 10);
    const max = answer + _.random(1, 10);
    const choice = updatedChoice || _.random(min, max);
    const choiceNotTaken = choices.every(takenChoice => choice !== takenChoice);
    const choiceUsable = choice !== answer && choiceNotTaken;

    return choiceUsable ? choice : generateChoice(choices, choice + 1);
  };

  for (let i = 0; i < CHOICES_LENGTH; i++) {
    let choice = answer;

    if (i !== correctChoiceIndex) {
      choice = generateChoice(choices);
    }

    choices[i] = choice;
  }

  return choices;
};

const Round = {
  start(round) {
    round.endTime = Date.now() + ROUND_DURATION;
    Round.setTimeLeft(round);
  },

  setTimeLeft(round, timeLeft = (round.endTime - Date.now())) {
    round.timeLeft = timeLeft;
  },

  hasPlayerAnswered(round, player) {
    return _.includes(round.playersAnswered, player)
  },

  isChosenAnswerCorrect(round, chosenAnswer) {
    return chosenAnswer === round.trivia.answer;
  },

  end(round) {
    Round.setTimeLeft(round, 0);
  },

  hasEnded(round) {
    return round.timeLeft === 0
  },

  create(roundNumber) {
    const operandLeft = _.random(1, 20);
    const operandRight = _.random(1, 20);
    const operator = getRandomOperator();
    const equation = `${ operandLeft } ${ operator } ${ operandRight }`;
    const answer = (new Function(`return ${ equation }`))();
    const round = {
      roundNumber,
      trivia: {
        equation,
        answer,
        choices: generateChoices(answer)
      },
      playersAnswered: [],
      toJSON() {
        const json = _.pick(_.cloneDeep(round), 'roundNumber', 'trivia', 'timeLeft');

        if (!Round.hasEnded(round)) {
          delete json.trivia.answer;
        }

        return json;
      }
    };

    return round;
  }
};

export default Round;
