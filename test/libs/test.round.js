var Round = require('../../libs/round');

describe('Round',function () {

  describe('#trivia', function () {
    var trivia;

    beforeEach(function (done) {
      trivia = new Round().trivia;

      done();
    });

    it('should have an equation', function (done) {
      var equation = trivia.equation;
      var operator = find(['+', '-', '*', '/'], function(operator) {
        return equation.indexOf(operator) > 0;
      });
      var equationSplit = equation.split(operator);
      var operandA = equationSplit[0];
      var operandB = equationSplit[1];

      isNumeric(operandA).should.be.true;
      isNumeric(operandB).should.be.true;
      operator.should.exist;

      done();
    });

    it('should have an array of 4 unique choices', function (done) {
      var choices = trivia.choices;
      var uniqueChoices = uniq(choices);
      var allChoicesNumeric = choices.every(isNumeric);

      choices.should
        .be.an('array').and
        .have.length(4).and
        .to.deep.equal(uniqueChoices);
      allChoicesNumeric.should.be.true;

      done();
    });

  });

  describe('#isChoiceCorrect()', function () {
    var round;
    var answer;

    beforeEach(function (done) {
      var getDecimalPlaces = function (number) {
        var result = /^-?[0-9]+\.([0-9]+)$/.exec(number);
        return result === null ? 0 : result[1].length;
      };

      round = new Round();
      answer = eval(round.trivia.equation);

      if (getDecimalPlaces(answer) > 2) {
        answer = parseFloat(answer.toFixed(2));
      }

      done();
    });

    it('should return true if choice is correct', function (done) {
      round.isChoiceCorrect(answer).should.be.true;

      done();
    });

    it('should return false if choice is incorrect', function (done) {
      var wrongAnswer = answer + 1;

      round.isChoiceCorrect(wrongAnswer).should.be.false;

      done();
    });

  });

});