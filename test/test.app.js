describe('app',function () {

  it('should broadcast trivia object when client connects', function (done) {
    var client = io.connect(global.socketURL, global.socketOptions);

    client.on('trivia', function (trivia) {
      trivia.should.be.a('object');
      trivia.question.should.be.a('string');
      trivia.answerChoices.should.be.a('object');
      Object.keys(trivia.answerChoices).length.should.equal(4);

      client.disconnect();
      done();
    });
  });
});