var sio = require('socket.io');
var ioEvents = function (server) {
  var io = sio.listen(server);

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

  io.sockets.on('connection', function (socket) {
    var trivia = require('./trivia');
    socket.emit('trivia', trivia);
  });
};

module.exports = ioEvents;