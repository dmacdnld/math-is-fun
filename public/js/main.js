(function () {
  "use strict";

  var socket = io.connect(window.location.hostname);
  var nodes = {
    equation: document.querySelector('#equation'),
    result: document.querySelector('#result'),
    forms: document.querySelectorAll('form'),
    buttonA: document.querySelector("#buttonA"),
    buttonB: document.querySelector("#buttonB"),
    buttonC: document.querySelector("#buttonC"),
    buttonD: document.querySelector("#buttonD")
  };
  var formsList = Array.prototype.slice.call(nodes.forms, 0);

  socket.on('trivia', function (trivia) {
    nodes.equation.textContent = trivia.equation;
    nodes.buttonA.textContent = trivia.choices[0];
    nodes.buttonB.textContent = trivia.choices[1];
    nodes.buttonC.textContent = trivia.choices[2];
    nodes.buttonD.textContent = trivia.choices[3];
  });

  formsList.forEach(function(form) {
    form.addEventListener('submit', function (event) {
      event.preventDefault();
    });
  });
})();