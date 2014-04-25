var Game = require('../../libs/game');
var Round = require('../../libs/round');
var Player = require('../../libs/player');

describe('Game', function () {

  describe('#cycleRounds()', function () {
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
      sandbox.useFakeTimers(0, 'setInterval');
      stub1 = sandbox.stub();
      stub2 = sandbox.stub();

      done();
    });

    afterEach(function (done) {
      sandbox.restore();
      done();
    });

    it('should call first callback on an interval as many times as there are game rounds', function (done) {
      game.cycleRounds(stub1, stub2);

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
      game.cycleRounds(stub1, stub2, true);
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

    it('should call the second callback after the first callback call count is the same as the number of game rounds', function (done) {
      game.cycleRounds(stub1, stub2);

      for (var i = 0; i < intervalsLength; i++) {
        stub2.should.not.have.been.called;
        sandbox.clock.tick(ROUND_DURATION);
      }

      stub2.should.have.been.calledOnce;

      done();
    });

  });

    describe('#hasPlayerOfName()', function () {

      it('should return true if any player has the same name as the one passed in', function (done) {
        var game = new Game();
        var testName = 'Test Name';
        var otherName = 'Other Name'
        var player1 = new Player(testName);
        var player2 = new Player(otherName);

        game.addPlayer(player1);
        game.addPlayer(player2);

        game.hasPlayerOfName(testName).should.be.true;

        done();
      });

      it('should return false if no player has the same name as the one passed in', function (done) {
        var game = new Game();
        var testName = 'Test Name';
        var otherName1 = 'Other Name 1';
        var otherName2 = 'Other Name 2';
        var player1 = new Player(otherName1);
        var player2 = new Player(otherName2);

        game.addPlayer(player1);
        game.addPlayer(player2);

        game.hasPlayerOfName(testName).should.be.false;

        done();
      });

    });

    describe('#addPlayer()', function () {

      it('should add the passed in player to the game\'s player list', function (done) {
        var game = new Game();
        var player = new Player('Name');

        game.addPlayer(player);

        game.players.should.include(player);

        done();
      });

      it('should only add one player', function (done) {
        var game = new Game();
        var player = new Player('Name');
        var current = game.players.length;
        var expected = current + 1;
        var result = game.addPlayer(player);

        result.should.be.a('number');
        result.should.equal(expected);

        done();
      });

      it('should not add non-player values', function (done) {
        var game = new Game();
        var nonPlayer = {};
        var result = game.addPlayer(nonPlayer);

        should.equal(result, null);
        game.players.should.be.empty;

        done();
      });

    });

});