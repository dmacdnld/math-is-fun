var Round = function () {
  "use strict";

  var answer, correctChoice;

  var getDecimalPlaces = function (number) {
    var result = /^-?[0-9]+\.([0-9]+)$/.exec(number);
    return result === null ? 0 : result[1].length;
  };

  var setAnswer = function (newAnswer) {
    if (getDecimalPlaces(newAnswer) > 2) {
      answer = parseFloat(newAnswer.toFixed(2));
    }
    else {
      answer = newAnswer;
    }
  };

  var generateEquation = function () {
    var generateNumber = function () {
      return Math.ceil(Math.random() * 20);
    };
    var operandA = generateNumber();
    var operandB = generateNumber();
    var operatorIndex = Math.floor(Math.random() * 4);
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
      case 3: equation = operandA + ' / ' + operandB;
              setAnswer(operandA / operandB);
              break;
    }

    return equation;
  };

  var setCorrectChoice = function (choices) {
    correctChoice = Math.floor(Math.random() * 4);
    choices[correctChoice] = answer;
  };

  var generateChoices = function () {
    var decimalPlaces = getDecimalPlaces(answer);
    var generateChoice = function (updatedChoice) {
      var choice = updatedChoice || parseFloat((Math.random() * answer).toFixed(decimalPlaces));
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

  this.isChoiceCorrect = function (choice) {
    return choice === answer;
  };

  this.trivia = {
    equation: generateEquation(),
    choices: generateChoices()
  };
};

module.exports = Round;