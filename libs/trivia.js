var trivia = function () {
  var answer, correctChoice;

  return {
    getDecimalPlaces: function (number) {
      var result= /^-?[0-9]+\.([0-9]+)$/.exec(number);
      return result === null ? 0 : result[1].length;
    },

    getAnswer: function () {
      return answer;
    },

    setAnswer: function (answer) {
      if (this.getDecimalPlaces(answer) > 2) {
        answer = parseFloat(answer.toFixed(2));
      }
      else {
        answer = answer;
      }
    },

    generateEquation: function () {
      var generateRandomNumber = function () {
        return Math.ceil(Math.random() * 20);
      };
      var operandA = generateRandomNumber();
      var operandB = generateRandomNumber();
      var operatorIndex = Math.floor(Math.random() * 4);
      var equation;

      switch (operatorIndex) {
        case 0: equation = operandA + ' + ' + operandB;
                this.setAnswer(operandA + operandB);
                break;
        case 1: equation = operandA + ' - ' + operandB;
                this.setAnswer(operandA - operandB);
                break;
        case 2: equation = operandA + ' * ' + operandB;
                this.setAnswer(operandA * operandB);
                break;
        case 3: equation = operandA + ' / ' + operandB;
                this.setAnswer(operandA / operandB);
                break;
      }

      return equation;
    },

    getCorrectChoice: function () {
      return correctChoice;
    },

    setCorrectChoice: function (choices) {
      correctChoice = Math.floor(Math.random() * 4);

      choices[correctChoice] = this.getAnswer();
    },

    generateChoices: function () {
      var answer = this.getAnswer();
      var decimalPlaces = this.getDecimalPlaces(answer);
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

      this.setCorrectChoice(choices);

      for (var i = 0, length = 4; i < length; i++) {
        if (i === correctChoice) continue;

        choices[i] = generateChoice();
      }

      return choices;
    },

    generateTrivia: function () {
      var equation = this.generateEquation();
      var choices = this.generateChoices();
      var trivia = { equation: equation, choices: choices };

      return trivia;
    }
  }
}();

module.exports = trivia;