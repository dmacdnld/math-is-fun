describe('io-events', function () {
  describe('when user connects', function () {
    it('should send trivia object', function (done) {
      var server = require('http').createServer(require('express')());
      require('../../libs/io-events')(server);
      server.listen(socketOptions.port);

      var client = sioc.connect(socketURL, socketOptions);

      client.on('trivia', function (trivia) {
        trivia.should
          .exist.and
          .be.an('object');

        client.disconnect();
        done();
      });
    });
  });
});