var Round = function () {
  "use strict";

  var answer, correctChoice;

  var setAnswer = function (newAnswer) {
    answer = newAnswer;
  };

  var generateEquation = function () {
    var generateNumber = function () {
      return Math.ceil(Math.random() * 20);
    };
    var operandA = generateNumber();
    var operandB = generateNumber();
    var operatorIndex = Math.floor(Math.random() * 3);
    var equation;

    switch (operatorIndex) {
      case 0: equation = operandA + ' + ' + operandB;
              setAnswer(operandA + operandB);
              break;
      case 1: equation = operandA + ' - ' + operandB;
              setAnswer(operandA - operandB);
              break;
      case 2: equation = operandA + ' * ' + operandB;
              setAnswer(operandA * operandB);
              break;
    }

    return equation;
  };

  var setCorrectChoice = function (choices) {
    correctChoice = Math.floor(Math.random() * 4);
    choices[correctChoice] = answer;
  };

  var generateChoices = function () {
    var generateChoice = function (updatedChoice) {
      var choice = updatedChoice || parseInt(Math.random() * answer, 10);
      var choiceNotTaken = choices.every(function (takenChoice) {
        return choice !== takenChoice;
      });

      if (choice !== answer && choiceNotTaken) {
        return choice;
      }
      else {
        return generateChoice(choice + 1);
      }
    };
    var choices = [];

    setCorrectChoice(choices);

    for (var i = 0, length = 4; i < length; i++) {
      if (i === correctChoice) continue;
      choices[i] = generateChoice();
    }

    return choices;
  };

  this.playersAnswered = [];

  this.getAnswer = function () {
    return answer;
  };

  this.isChoiceCorrect = function (choice) {
    return choice === answer;
  };

  this.trivia = {
    equation: generateEquation(),
    choices: generateChoices()
  };
};

Round.prototype.hasPlayerAnswered = function (player) {
  return this.playersAnswered.indexOf(player) !== -1;
};

module.exports = Round;