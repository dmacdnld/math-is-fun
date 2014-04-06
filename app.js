var app = function () {
  var express = require('express');
  var socket = require('socket.io');

  var app = express();

  // routing
  require('./libs/routes').config(app, __dirname);

  var server = require('./server')(app);
  var trivia = require('./libs/trivia')(server);

  var port = process.env.PORT || 5000;
  server.listen(port);

  return app;
}();

module.exports = app;