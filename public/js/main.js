(function () {
  "use strict";

  var socket = io.connect('http://localhost');
  var nodes = {
    question: document.querySelector('#question'),
    result: document.querySelector('#result'),
    forms: document.querySelectorAll('form'),
    buttonA: document.querySelector("#buttonA"),
    buttonB: document.querySelector("#buttonB"),
    buttonC: document.querySelector("#buttonC"),
    buttonD: document.querySelector("#buttonD")
  };
  var formsList = Array.prototype.slice.call(nodes.forms, 0);

  socket.on('trivia', function (trivia) {
    nodes.question.textContent = trivia.question;
    nodes.buttonA.textContent = trivia.answerChoices.a;
    nodes.buttonB.textContent = trivia.answerChoices.b;
    nodes.buttonC.textContent = trivia.answerChoices.c;
    nodes.buttonD.textContent = trivia.answerChoices.d;
  });

  formsList.forEach(function(form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });
})();