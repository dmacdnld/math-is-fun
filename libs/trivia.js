var trivia = function (app) {
  var socket = require('socket.io');
  var io = socket.listen(app);

  io.configure('production', function(){
    io.enable('browser client minification');
    io.enable('browser client etag');
    io.enable('browser client gzip');
    io.set('log level', 1);

    io.set('transports', [
      'websocket',
      'htmlfile',
      'xhr-polling',
      'jsonp-polling'
    ]);
  });

  io.configure('development', function(){
    io.set('transports', ['websocket']);
  });

  var trivia = {
    question: "1+1",
    answerChoices: { a: 0, b: 1, c: 2, d: 3 }
  };

  io.sockets.on('connection', function (socket) {
    socket.emit('trivia', trivia);
  });
};

module.exports = trivia;