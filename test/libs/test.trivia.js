var trivia = require('../../libs/trivia');

describe('trivia',function () {

  describe('#generateEquation()', function () {

    it('should return an equation', function (done) {
      var equation = trivia.generateEquation();
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

    it('should call #setAnswer()', function (done) {
      sinon.spy(trivia, 'setAnswer');
      trivia.generateEquation();

      trivia.setAnswer.should.have.been.calledOnce;

      done();
    });

  });

  describe('#generateChoices()', function () {

    it('should return an array of 4 unique choices containing the answer', function (done) {
      var answer = 1;
      sinon.stub(trivia, 'getAnswer').returns(answer);

      var choices = trivia.generateChoices();
      var uniqueChoices = uniq(choices);
      var allChoicesNumeric = choices.every(isNumeric);

      choices.should
        .be.an('array').and
        .have.length(4).and
        .to.deep.equal(uniqueChoices).and
        .to.contain(answer);
      allChoicesNumeric.should.be.true;

      done();
    });

  });

  describe('#generateTrivia()', function () {

    it('should return an object with an equation and choices', function (done) {
      sinon.stub(trivia, 'generateEquation');
      sinon.stub(trivia, 'generateChoices');

      var triviaData = trivia.generateTrivia();

      triviaData.should
        .be.an('object').and
        .have.keys(['equation', 'choices']);

      done();
    });

  });

});