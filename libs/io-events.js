var sio = require('socket.io');
var User = require('./user');
var Round = require('./round');
var users = [];

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
    socket.on('user:applied', function (username) {
      var id = socket.id;
      var nameTaken = users.some(function (user) {
        return user.name === username;
      });

      if (nameTaken) {
        io.sockets.socket(id).emit('user:invalid');
      } else {
        io.sockets.socket(id).emit('user:joined', new Round().trivia);
      }
    });
  });
};

module.exports = ioEvents;