var http = require('http').Server;

var Game = require('../../libs/game');
var Round = require('../../libs/round');
var Player = require('../../libs/player');
var gameConfig = require('../../libs/game-config');

describe('Game', function () {
  var io, inResult, socket, game;

  beforeEach(function (done) {
    inResult = {
      emit: function () {}
    };
    io = {
      on: function (event, fn) {
        fn();
      },
      in: function () {
        return inResult;
      }
    };
    game = new Game(io);
    socket = {
      id: 1,
      emit: function () {},
      join: function () {},
      broadcast: {
        to: function () {
          return {
            emit: function () {}
          };
        }
      },
      on: function (event, fn) {
        fn();
      }
    };

    done();
  });

  describe('#init()', function () {

    it('should attach an event listener to the \'connection\' event', function () {
      var stub = sinon.stub(game.io, 'on');

      game.init();

      stub.should.have.been.calledWith('connection');
      stub.restore();
    });

  });

  // Game.prototype.handleConnection = function (socket) {
  //   socket.on('disconnect', this.handlePlayerRemoval.bind(this, socket));
  //   socket.on('player:applied', this.handlePlayerApplication.bind(this, socket));
  //   socket.on('choice:submitted', this.handleChoiceSubmission.bind(this, socket));
  // };

  describe('#handleConnection()', function () {
    var stub;

    beforeEach(function (done) {
      stub = sinon.stub(socket, 'on');

      done();
    });

    afterEach(function (done) {
      stub.restore();

      done();
    });

    it('should attach an even listener to the \'disconnect\' event', function () {
      game.handleConnection(socket);

      stub.should.have.been.calledWith('disconnect');
    });

    it('should attach an even listener to the \'player:applied\' event', function () {
      game.handleConnection(socket);

      stub.should.have.been.calledWith('player:applied');
    });

    it('should attach an even listener to the \'choice:submitted\' event', function () {
      game.handleConnection(socket);

      stub.should.have.been.calledWith('choice:submitted');
    });

  });

  describe('#generateRounds()', function () {

    it('should return an array of rounds', function () {
        var rounds = game.generateRounds();
        var actual = rounds.every(function (round) {
          return round instanceof Round;
        });

        actual.should.be.true;
    });

    it('should return an array of the correct length', function () {
        var rounds = game.generateRounds();
        var expected = gameConfig.roundsLength;
        var actual = rounds.length;

        actual.should.equal(expected);
    });

  });

  describe('#startRound()', function () {

    it('should assign the current round', function () {
      var expected = _.last(game.rounds);

      game.startRound();

      var actual = game.currentRound;

      actual.should.equal(expected);
    });

    it('should call currentRound#start()', function () {
      var currentRound = _.last(game.rounds);
      var stub = sinon.stub(currentRound, 'start');

      game.startRound();

      stub.should.have.been.called;
      stub.restore();
    });

    it('should emit a \'round:started\' event to the \'game\' room', function () {
      var stub = sinon.stub(game.io.in('game'), 'emit');

      game.startRound();

      stub.should.have.been.calledWithExactly('round:started', game.players, game.currentRound.trivia, game.currentRound.endTime);
      stub.restore();
    });

    it('should start the timer to call #endRound()', function () {
      var spy = sinon.spy(game.timer, 'start');
      var stub = sinon.stub(game, 'endRound');

      var ROUND_DURATION = gameConfig.roundDuration;
      var clock = sinon.useFakeTimers();

      game.startRound();
      clock.tick(ROUND_DURATION);

      spy.should.have.been.called;
      spy.firstCall.args[1].should.equal(ROUND_DURATION);
      stub.should.have.been.called;

      spy.restore();
      stub.restore();
      clock.restore();
    });

  });

  describe('#endRound()', function () {
    var answer = 1;

    beforeEach(function (done) {
      game.currentRound = { getAnswer: function () { return answer; } };
      done();
    });

    it('should call timer#stop()', function () {
      var stub = sinon.stub(game.timer, 'stop');

      game.endRound();

      stub.should.have.been.called;
      stub.restore();
    });

    it('should emit a \'round:ended\' event to the \'game\' room', function () {
      var stub = sinon.stub(game.io.in('game'), 'emit');

      game.endRound();

      stub.should.have.been.calledWithExactly('round:ended', game.players, answer);
      stub.restore();
    });

    it('should start a timer to start a new round if there are rounds left', function () {
      var spy = sinon.spy(game.timer, 'start');
      var stub = sinon.stub(game, 'startRound');

      var NEXT_ROUND_DELAY = gameConfig.nextRoundDelay;
      var clock = sinon.useFakeTimers();

      game.endRound();
      clock.tick(NEXT_ROUND_DELAY);

      spy.should.have.been.called;
      spy.firstCall.args[1].should.equal(NEXT_ROUND_DELAY);
      stub.should.have.been.called;

      spy.restore();
      stub.restore();
      clock.restore();
    });

    it('should start a timer to end the game if there are no rounds left', function () {
      var spy = sinon.spy(game.timer, 'start');
      var stub = sinon.stub(game, 'end');

      var NEXT_ROUND_DELAY = gameConfig.nextRoundDelay;
      var clock = sinon.useFakeTimers();

      game.rounds.length = 0;
      game.endRound();
      clock.tick(NEXT_ROUND_DELAY);

      spy.should.have.been.called;
      spy.firstCall.args[1].should.equal(NEXT_ROUND_DELAY);
      stub.should.have.been.called;

      spy.restore();
      stub.restore();
      clock.restore();
    });

  });

  describe('#end()', function () {

    it('should call timer#stop()', function () {
      var stub = sinon.stub(game.timer, 'stop');

      game.end();

      stub.should.have.been.called;
      stub.restore();
    });

    it('should emit a \'game:ended\' event to the \'game\' room', function () {
      var stub1 = sinon.stub(game.io.in('game'), 'emit');
      var stub2 = sinon.stub(game, 'getWinner');
      var winner = {};

      stub2.returns(winner);

      game.end();

      stub1.should.have.been.calledWithExactly('game:ended', winner);

      stub1.restore();
      stub2.restore();
    });

    it('should call #restart()', function () {
      var stub = sinon.stub(game, 'restart');

      game.end();

      stub.should.have.been.called;
      stub.restore();
    });

  });

  describe('#restart()', function () {

    it('should call #resetPoints()', function () {
      var stub = sinon.stub(game, 'resetPoints');

      game.restart();

      stub.should.have.been.called;
      stub.restore();
    });

    it('should set #rounds', function () {
      var stub = sinon.stub(game, 'generateRounds');
      var rounds = [];
      stub.returns(rounds);

      game.restart();

      game.rounds.should.equal(rounds);
      stub.restore();
    });

    it('should start a timer to start the next game', function () {
      var spy = sinon.spy(game.timer, 'start');
      var stub = sinon.stub(game, 'start');

      var NEXT_GAME_DELAY = gameConfig.nextGameDelay;
      var clock = sinon.useFakeTimers();

      game.restart();
      clock.tick(NEXT_GAME_DELAY);

      spy.should.have.been.called;
      spy.firstCall.args[1].should.equal(NEXT_GAME_DELAY);
      stub.should.have.been.called;

      spy.restore();
      stub.restore();
      clock.restore();
    });

  });

  describe('#hasPlayerOfName()', function () {
    var name = 'Name';

    beforeEach( function (done) {
      var player = { name: name };
      game.players = [player];

      done();
    });

    it('should return true if any player has the same name as the one passed in', function (done) {
      game.hasPlayerOfName(name).should.be.true;

      done();
    });

    it('should return false if no player has the same name as the one passed in', function (done) {
      game.hasPlayerOfName('OtherName').should.be.false;

      done();
    });

  });

  describe('#handlePlayerApplication()', function () {

    describe('name taken', function () {
      it('should emit a \'player:rejected\' event', function () {
        var stub1 = sinon.stub(socket, 'emit');
        var stub2 = sinon.stub(game, 'hasPlayerOfName');
        stub2.returns(true);

        game.handlePlayerApplication(socket);

        stub1.should.have.been.calledWithExactly('player:rejected');
        stub1.restore();
        stub2.restore();
      });
    });

    describe('name not taken', function () {
      var falseStub;

      beforeEach(function (done) {
        falseStub = sinon.stub(game, 'hasPlayerOfName');
        falseStub.returns(false);
        done();
      });

      afterEach(function (done) {
        falseStub.restore();
        done();
      });

      it('should call #addPlayer()', function () {
        var name = 'Name';
        var stub = sinon.stub(game, 'addPlayer');

        game.handlePlayerApplication(socket, name);

        stub.should.have.been.calledWithExactly(socket.id, name);
        stub.restore();
      });

      it('should call #start() when no game is in progress', function () {
        var stub = sinon.stub(game, 'start');

        game.currentRound = false;
        game.handlePlayerApplication(socket);

        stub.should.have.been.called;
        stub.restore();
      });

      it('should add the socket to the \'game\' room', function () {
        var stub = sinon.stub(socket, 'join');

        game.handlePlayerApplication(socket);

        stub.should.have.been.called;
        stub.restore();
      });

      it('should emit a \'player:joined\' event', function () {
        var players = [];
        var trivia = {};
        var endTime = '12:00:00';
        var spy = sinon.stub(socket, 'emit');
        game.players = players;
        game.currentRound = {
          trivia: trivia,
          endTime: endTime
        };

        game.handlePlayerApplication(socket);

        spy.should.have.been.calledWithExactly('player:joined', players, trivia, endTime);
        spy.restore();
      });

      it('should broadcast a \'player:joined\' event to the \'game\' room', function () {
        var players = [];
        var toValue = { emit: function () {} };
        var stub = sinon.stub(socket.broadcast, 'to');
        var spy = sinon.spy(toValue, 'emit');
        stub.returns(toValue);
        game.players = players;

        game.handlePlayerApplication(socket);

        spy.should.have.been.calledWithExactly('player:joined', players);
        stub.restore();
        spy.restore();
      });

    });

  });

  describe('#addPlayer()', function () {

    it('should increment the guests count when new player is a guest', function () {
      var expected = 1;

      game.addPlayer(1);
      var actual = game.guestsCount;

      actual.should.equal(expected);
    });

    it('should add a player to #players', function () {
      var id = 1;
      var name = 'Name';
      var addedPlayer;

      game.addPlayer(id, name);

      addedPlayer = game.players[0];

      addedPlayer.should
        .be.an.instanceof(Player);

      addedPlayer.should
        .have.a.property('id')
          .that.equals(id);

      addedPlayer.should
        .have.a.property('name')
          .that.equals(name);
    });

  });

  describe('.handlePlayerRemoval()', function () {
    it('should call #getPlayer()', function () {
      var stub = sinon.stub(game, 'getPlayer');

      game.handlePlayerRemoval(socket);

      stub.should.have.been.calledWithExactly(socket.id);
      stub.restore();
    });

    it('should short circuit if no player is found', function () {
      var stub = sinon.stub(game, 'removePlayer');

      game.handlePlayerRemoval(socket);

      stub.should.not.have.been.called;
      stub.restore();
    });

    it('should call #removePlayer if player is found', function () {
      var player = {};
      var stub1 = sinon.stub(game, 'getPlayer');
      var stub2 = sinon.stub(game, 'removePlayer');

      stub1.returns(player);
      game.handlePlayerRemoval(socket);

      stub2.should.have.been.calledWithExactly(player);
      stub1.restore();
      stub2.restore();
    });

    describe('players left', function () {
      var getPlayerStub;
      var removePlayerStub;

      beforeEach(function (done) {
        getPlayerStub = sinon.stub(game, 'getPlayer');
        getPlayerStub.returns(true);
        removePlayerStub = sinon.stub(game, 'removePlayer');
        game.players = [{}];

        done();
      });

      afterEach(function (done) {
        getPlayerStub.restore();
        removePlayerStub.restore();

        done();
      });

      it('should emit a \'player:left\' event to the \'game\' room', function () {
        var spy = sinon.spy(inResult, 'emit');

        game.handlePlayerRemoval(socket);

        spy.should.have.been.calledWithExactly('player:left', game.players);
        spy.restore();
      });
    });

    describe('no players left', function () {
      var getPlayerStub;
      var removePlayerStub;

      beforeEach(function (done) {
        getPlayerStub = sinon.stub(game, 'getPlayer');
        getPlayerStub.returns(true);
        removePlayerStub = sinon.stub(game, 'removePlayer');
        game.players = [];

        done();
      });

      afterEach(function (done) {
        getPlayerStub.restore();
        removePlayerStub.restore();

        done();
      });

      it('should call #end()', function () {
        var stub = sinon.stub(game, 'end');

        game.handlePlayerRemoval(socket);

        stub.should.have.been.called;
        stub.restore();
      });

    });

  });

  describe('#removePlayer()', function () {

    it('should remove the player from #players if player found', function () {
      var player = {};
      game.players = [{}, player];

      game.removePlayer(player);

      var index = game.players.indexOf(player);

      index.should.equal(-1);
    });

    it('should return null if player found', function () {
      var expected = null;
      var actual = game.removePlayer();

      should.equal(actual, expected);
    });

  });

  describe('#getPlayer()', function () {

    it('should return a player with a matching ID', function () {
      var id = 1;
      var player = { id: id };
      var expected = player;

      game.players = [player];

      var actual = game.getPlayer(id);

      actual.should.equal(expected);
    });

    it('should return undefined if no matching ID found', function () {
      var expected = undefined;

      game.players = [];

      var actual = game.getPlayer();

      should.equal(actual, expected);
    });

  });

  describe('#getWinner()', function () {

    it('should return null if no player has more than 0 points', function () {
      var expected = null;

      game.players = [{ points: 0 }];

      var actual = game.getWinner();

      should.equal(actual, expected);
    });

    it('should return the players with the most points if any have more than 0 points', function () {
      var playerA = { points: 30 };
      var playerB = { points: 30 };
      var expected = [playerA, playerB];

      game.players = [{ points: 20 }, playerA, playerB];

      var actual = game.getWinner();

      actual.should.eql(expected);
    });

  });

  describe('#resetPoints()', function () {

    it('should invoke player#resetPoints() for each player', function () {
      var stub = sinon.stub();

      game.players = [{ resetPoints: stub }, { resetPoints: stub }];
      game.resetPoints();

      stub.should.have.been.calledTwice;
    });

  });

  describe('#handleChoiceSubmission()', function () {

    describe('when round already answered', function () {

      it('should short circuit', function () {
        var currentRound = { hasPlayerAnswered: function () { return true; } };
        var stub = sinon.stub(game, 'trackPlayersAnswered');

        game.currentRound = currentRound;
        game.handleChoiceSubmission(socket);

        stub.should.not.have.been.called;
        stub.restore();
      });

    });

    describe('when round not answered', function () {

      it('should call #trackPlayersAnswered()', function () {
        var player = {};
        var currentRound = {
          hasPlayerAnswered: function () { return false; },
          isChoiceCorrect: function () {},
          getAnswer: function () {}
        };
        var stub1 = sinon.stub(game, 'getPlayer');
        var stub2 = sinon.stub(game, 'trackPlayersAnswered');

        stub1.returns(player);
        game.currentRound = currentRound;
        game.handleChoiceSubmission(socket);

        stub2.should.have.been.calledWithExactly(player);
        stub1.restore();
        stub2.restore();
      });

      describe('and when choice is correct', function () {

        it('should add points to the player', function () {
          var player = {
            addPoints: function () {}
          };
          var currentRound = {
            hasPlayerAnswered: function () { return false; },
            isChoiceCorrect: function () { return true; },
            getAnswer: function () {},
            playersAnswered: []
          };
          var stub1 = sinon.stub(game, 'getPlayer');
          var stub2 = sinon.stub(player, 'addPoints');

          stub1.returns(player);
          game.currentRound = currentRound;
          game.handleChoiceSubmission(socket);

          stub2.should.have.been.called;
          stub1.restore();
          stub2.restore();
        });

        it('should end the round', function () {
          var player = {
            addPoints: function () {}
          };
          var currentRound = {
            hasPlayerAnswered: function () { return false; },
            isChoiceCorrect: function () { return true; },
            getAnswer: function () {},
            playersAnswered: []
          };
          var stub1 = sinon.stub(game, 'getPlayer');
          var stub2 = sinon.stub(game, 'endRound');

          stub1.returns(player);
          game.currentRound = currentRound;
          game.handleChoiceSubmission(socket);

          stub2.should.have.been.called;
          stub1.restore();
          stub2.restore();
        });

      });

      describe('and when choice is incorrect', function () {
        var event = 'choice:rejected';
        var choice = 1;
        var answer = 2;

        it('should emit a \'choice:rejected\' event', function () {
          var currentRound = {
            hasPlayerAnswered: function () { return false; },
            isChoiceCorrect: function () { return false; },
            getAnswer: function () { return answer; },
            playersAnswered: []
          };
          var stub = sinon.stub(socket, 'emit');

          game.currentRound = currentRound;
          game.handleChoiceSubmission(socket, choice);

          stub.should.have.been.calledWithExactly(event, answer, choice);
          stub.restore();
        });

        describe('and when all players have answered', function () {

          it('should end the round', function () {
            var currentRound = {
              hasPlayerAnswered: function () { return false; },
              isChoiceCorrect: function () { return false; },
              getAnswer: function () { return answer; },
              playersAnswered: []
            };
            var stub1 = sinon.stub(game, 'haveAllPlayersAnswered');
            var stub2 = sinon.stub(game, 'endRound');

            stub1.returns(true);
            game.currentRound = currentRound;
            game.handleChoiceSubmission(socket, choice);

            stub1.should.have.been.called;
            stub1.restore();
            stub2.restore();
          });

        });

      });

    });

  });

  describe('#trackPlayersAnswered()', function () {

    it('should add the player to the list of players who answered', function () {
      var player = {};
      var currentRound = { playersAnswered: [] };
      var stub = sinon.stub(currentRound.playersAnswered, 'push');

      game.currentRound = currentRound;
      game.trackPlayersAnswered(player);

      stub.should.have.been.calledWithExactly(player);
      stub.restore();
    });

  });

  describe('#haveAllPlayersAnswered()', function () {

    it('should return true if all current players have answered', function () {
      var players = [{}, {}];
      var currentRound = { playersAnswered: players };

      game.players = players;
      game.currentRound = currentRound;
      var result = game.haveAllPlayersAnswered();

      result.should.be.true;
    });

    it('should return false if all current players have not answered', function () {
      var currentRound = { playersAnswered: [{}, {}] };

      game.players = [{}, {}, {}];
      game.currentRound = currentRound;
      var result = game.haveAllPlayersAnswered();

      result.should.be.false;
    });

  });

  /*
  Game.prototype.haveAllPlayersAnswered = function () {
    var playersAnswered = this.currentRound.playersAnswered;
    var currentPlayers = this.players;
    return _.isEqual(currentPlayers, _.intersection(currentPlayers, playersAnswered));
  };
  */

});