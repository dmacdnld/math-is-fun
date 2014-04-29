var Game = require('../../libs/game');
var Round = require('../../libs/round');
var Player = require('../../libs/player');

describe('Game', function () {

  describe('#startRound()', function () {
    var game;
    var ROUNDS_LENGTH;
    var ROUND_DURATION;
    var intervalsLength;
    var sandbox;
    var stub1;
    var stub2;

    beforeEach(function (done) {
      game = new Game();
      ROUNDS_LENGTH = game.ROUNDS_LENGTH;
      ROUND_DURATION = game.ROUND_DURATION;
      intervalsLength = ROUNDS_LENGTH + 1;

      sandbox = sinon.sandbox.create();
      sandbox.useFakeTimers(0, 'setTimeout');
      stub1 = sandbox.stub();
      stub2 = sandbox.stub();

      done();
    });

    afterEach(function (done) {
      sandbox.restore();
      done();
    });

    it('should call first callback on an interval as many times as there are game rounds', function (done) {
      game.startRound(stub1, stub2);

      for (var i = 0; i < intervalsLength; i++) {
        stub1.should.have.callCount(i);
        sandbox.clock.tick(ROUND_DURATION);
        if (i < ROUNDS_LENGTH) {
          stub1.should.have.callCount(i + 1);
        }
      }

      stub1.should.have.callCount(ROUNDS_LENGTH);

      done();
    });

    it('should call the first callback immediately if told to and then call it on an interval until the total call count is the same as the number of game rounds', function (done) {
      game.startRound(stub1, stub2, true);
      sandbox.clock.tick(1);
      stub1.should.have.been.called;

      for (var i = 1; i < intervalsLength; i++) {
        stub1.should.have.callCount(i);
        sandbox.clock.tick(ROUND_DURATION);
        if (i < ROUNDS_LENGTH) {
          stub1.should.have.callCount(i + 1);
        }
      }

      stub1.should.have.callCount(ROUNDS_LENGTH);

      done();
    });

    it('should store the current round as each round starts', function (done) {
      var lastRound = game.currentRound;

      game.startRound(stub1, stub2);

      should.equal(lastRound, undefined);

      for (var i = 0; i < intervalsLength; i++) {
        sandbox.clock.tick(ROUND_DURATION);
        if (i < ROUNDS_LENGTH) {
          game.currentRound.should.be.an.instanceof(Round);
          game.currentRound.should.not.equal(lastRound);
          lastRound = game.currentRound;
        }
      }

      done();
    });

    it('should call the second callback after the first callback call count is the same as the number of game rounds', function (done) {
      game.startRound(stub1, stub2);

      for (var i = 0; i < intervalsLength; i++) {
        stub2.should.not.have.been.called;
        sandbox.clock.tick(ROUND_DURATION);
      }

      stub2.should.have.been.calledOnce;

      done();
    });

  });

  describe('#hasPlayerOfName()', function () {
    var game;
    var name1;
    var name2;
    var name3;
    var player1;
    var player2;
    var player3;

    beforeEach(function (done) {
      game = new Game();
      name1 = 'Name 1';
      name2 = 'Name 2';
      player1 = new Player(1, name1);
      player2 = new Player(2, name2);

      game.players.push(player1, player2);

      done();
    });

    it('should return true if any player has the same name as the one passed in', function (done) {
      game.hasPlayerOfName(name1).should.be.true;

      done();
    });

    it('should return false if no player has the same name as the one passed in', function (done) {
      game.hasPlayerOfName('').should.be.false;

      done();
    });

  });

  describe('#addPlayer()', function () {
    var game;
    var player;

    beforeEach(function (done) {
      game = new Game();
      player = new Player(1, 'Name');

      done();
    });

    it('should add the passed in player to the game\'s player list', function (done) {
      game.addPlayer(player);

      game.players.should.include(player);

      done();
    });

    it('should only add one player', function (done) {
      var current = game.players.length;
      var expected = current + 1;
      var result = game.addPlayer(player);

      result.should.be.a('number');
      result.should.equal(expected);

      done();
    });

    it('should not add non-player values', function (done) {
      var result = game.addPlayer();

      should.equal(result, null);
      game.players.should.be.empty;

      done();
    });

  });

  describe('#removePlayer()', function () {
    var game;
    var player1;
    var player2;
    var player3;

    beforeEach(function (done) {
      game = new Game();
      player1 = new Player(1, 'One');
      player2 = new Player(2, 'Two');
      player3 = new Player(3, 'Three');

      game.players.push(player1, player2, player3);

      done();
    });

    it('should remove the passed in player from the game\'s player list', function (done) {
      game.removePlayer(player1);
      game.players.should.not.include(player1);

      done();
    });

    it('should only remove one player', function (done) {
      game.removePlayer(player1);
      game.players.length.should.equal(2);

      done();
    });

    it('should return null if player not found', function (done) {
      var result = game.removePlayer();
      should.equal(result, null);

      done();
    });

  });

});