var server = function (app) {
  var http = require('http');
  var server = http.createServer(app);

  return server;
};

module.exports = server;