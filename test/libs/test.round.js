import _ from 'lodash';
import sinon from 'sinon';
import { expect } from 'chai';

import Round from '../../app/server/lib/round';
import Player from '../../app/server/lib/player';
import { EQUATION_OPERATOR_OPTIONS, CHOICES_LENGTH, ROUND_DURATION } from '../../app/shared/game-config';

describe('Round', () => {
  let round;

  beforeEach(() => {
    round = Round.create();
  });

  describe('#create()', () => {

    describe('returns a round with #roundNumber and', () => {

      it('should be the same as the round number passed in', () => {
        const roundNumber = 1;
        round = Round.create(roundNumber);

        round.roundNumber.should.equal(roundNumber);
      });

    });

    describe('returns a round with #trivia and', () => {
      let trivia;

      beforeEach(() => {
        trivia = round.trivia;
      });

      describe('#trivia#equation', () => {

        it('should be an equation', () => {
          const { equation } = trivia;
          const operator = _.find(EQUATION_OPERATOR_OPTIONS, (operator) => equation.includes(operator));
          const equationSplit = equation.split(operator);
          const operandLeft = equationSplit[0].trim();
          const operandRight = equationSplit[1].trim();
          const numberRegexp = /^\d+$/;

          operandLeft.should.match(numberRegexp);
          operandRight.should.match(numberRegexp);
          operator.should.exist;
        });

      });

      describe('#trivia#choices', () => {

        it(`should have an array of ${ CHOICES_LENGTH } choices`, () => {
          const { choices } = trivia;

          choices.should
            .be.an('array').and
            .have.length(CHOICES_LENGTH);
        });

        it(`should have all unique choices`, () => {
          const { choices } = trivia;
          const uniqueChoices = _.uniq(choices);

          choices.should.deep.equal(uniqueChoices);
        });

        it(`should have all numeric choices`, () => {
          const { choices } = trivia;
          const allChoicesNumeric = choices.every(_.isNumber);

          allChoicesNumeric.should.be.true;
        });

        it('should contain the answer in the choices', () => {
          const { equation, choices, answer } = trivia;

          choices.should.contain(answer);
        });

      });

      describe('#trivia#answer', () => {

        it('should equal the result of #trivia#equation', () => {
          const { trivia: { equation, answer } } = round;
          const equationResult = (new Function (`return ${ equation }`))();

          answer.should.equal(equationResult);
        });

      });

    });

    describe('returns a round with #playersAnswered and', () => {

      it('should be an empty array', () => {
        const { playersAnswered } = round;

        playersAnswered.should
          .be.an('array').and
          .be.empty;
      });

    });

    describe('returns a round with #endTime and', () => {

      it('should be undefined', () => {
        expect(round.endTime).to.be.undefined;
      });

    });

    describe('returns a round with #toJSON() and', () => {
      let json;

      describe('#toJSON()', () => {

        beforeEach(() => {
          round = Round.create(1);
          json = round.toJSON();
        });

        it('should return an object with only #roundNumber, #timeLeft, and #trivia', () => {
          const otherProperties = _.keys(_.omit(json, ['roundNumber', 'timeLeft', 'trivia']));
          otherProperties.should.have.length(0);
        });

        describe('returns an object with #roundNumber and', () => {

          it('should equal round#roundNumber', () => {
            json.roundNumber.should.equal(round.roundNumber);
          });

        });

        describe('when the round has ended', () => {

          beforeEach(() => {
            round = Round.create(1);
            Round.end(round);
            json = round.toJSON();
          });

          describe('returns an object with #timeleft and', () => {

            it('should equal round#timeLeft', () => {
              json.timeLeft.should.equal(round.timeLeft);
            });

          });

          describe('returns an object with #trivia and', () => {

            it('should equal round#trivia', () => {
              json.trivia.should.deep.equal(round.trivia);
            });

          });

        });

        describe('when the round has not ended', () => {

          describe('returns an object without #timeleft and', () => {

            it('should equal round#timeLeft', () => {
              expect(json.timeLeft).to.be.undefined;
            });

          });

          describe('returns an object with #trivia and', () => {

            it('should equal round#trivia with no round#trivia#answer', () => {
              delete round.trivia.answer;
              json.trivia.should.deep.equal(round.trivia);
            });

          });

        });

      });

    });

  });

  describe('#start()', () => {
    let sandbox, clock, stub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
      stub = sandbox.stub(Round, 'setTimeLeft');
      Round.start(round);
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should set #endTime', () => {
      round.endTime.should.equal(ROUND_DURATION);
    });

    it('should call #setTimeLeft()', () => {
      stub.should.have.been.calledWithExactly(round);
    });

  });

  describe('#setTimeLeft()', () => {
    let clock;

    beforeEach(() => {
      clock = sinon.useFakeTimers();
      round.endTime = ROUND_DURATION;
    });

    afterEach(() => {
      clock.restore();
    });

    describe('when a value is passed in', () => {

      it('should set that value as #timeLeft', () => {
        const timeLeft = 0;

        Round.setTimeLeft(round, timeLeft);

        round.timeLeft.should.equal(timeLeft);
      });

    });

    describe('when no value is passed in', () => {

      it('should calculate the set the round\'s time left as #timeLeft', () => {
        const TIME_TO_ELAPSE = ROUND_DURATION / 3;
        clock.tick(TIME_TO_ELAPSE);

        Round.setTimeLeft(round);

        round.timeLeft.should.equal(ROUND_DURATION - TIME_TO_ELAPSE);
      });

    });

  });

  describe('#hasPlayerAnswered()', () => {
    let player;

    beforeEach(() => {
      player = {};
    });

    it('should return true if player has answered', () => {
      round.playersAnswered.push(player);

      Round.hasPlayerAnswered(round, player).should.be.true;
    });

    it('should return false if player has not answered', () => {
      Round.hasPlayerAnswered(round, player).should.be.false;
    });

  });

  describe('#isChosenAnswerCorrect()', () => {
    let answer;

    beforeEach(() => {
      answer = round.trivia.answer;
    });

    it('should return true if chosen answer is correct', () => {
      Round.isChosenAnswerCorrect(round, answer).should.be.true;
    });

    it('should return false if chosen answer is incorrect', () => {
      const incorrectAnswer = answer + 1;

      Round.isChosenAnswerCorrect(round, incorrectAnswer).should.be.false;
    });

  });

  describe('#end()', () => {

    it('should set #timeLeft to 0', () => {
      round.timeLeft = ROUND_DURATION;
      Round.end(round);

      round.timeLeft.should.equal(0);
    });

  });


  describe('#hasEnded()', () => {

    it('should return true if the round has ended', () => {
      round.timeLeft = 0;

      Round.hasEnded(round).should.be.true;
    });

    it('should return false if the round has not ended', () => {
      round.timeLeft = ROUND_DURATION;

      Round.hasEnded(round).should.be.false;
    });

  });

});
