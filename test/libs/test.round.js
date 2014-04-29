var Round = require('../../libs/round');
var Player = require('../../libs/player');

describe('Round',function () {

  describe('#trivia', function () {
    var round;
    var trivia;

    beforeEach(function (done) {
      round = new Round();
      trivia = round.trivia;

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

    it('should contain the answer in the choices', function (done) {
      var choices = trivia.choices;
      var answer = round.getAnswer();

      choices.should.contain(answer);

      done();
    });

  });

  describe('#isChoiceCorrect()', function () {
    var round;
    var answer;

    beforeEach(function (done) {
      round = new Round();
      answer = round.getAnswer();

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

  describe('#hasPlayerAnswered()', function () {
    var round;
    var player;

    beforeEach(function (done) {
      round = new Round();
      player = new Player(1, 'Name');

      done();
    });

    it('should return true if player has answered', function (done) {
      round.playersAnswered.push(player);
      round.hasPlayerAnswered(player).should.be.true;

      done();
    });

    it('should return false if player has not answered', function (done) {
      round.playersAnswered = [];
      round.hasPlayerAnswered(player).should.be.false;

      done();
    });

  });

});