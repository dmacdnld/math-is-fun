import { EventEmitter } from 'events';

import sinon from 'sinon';
import { expect } from 'chai';
import _ from 'lodash';

import Game from '../../app/server/lib/game';
import Round from '../../app/server/lib/round';
import Player from '../../app/server/lib/player';
import { ROUNDS_LENGTH, ROUND_DURATION, NEXT_GAME_DELAY, NEXT_ROUND_DELAY, GUEST_NAME_PREFIX, ROUND_POINTS } from '../../app/shared/game-config';

describe('Game', () => {
  const playerSocketId = '123abc';
  const playerName = 'Mathlete';
  let game;

  beforeEach(() => {
    game = Game.create();
  });

  describe('#create()', () => {

    describe('returns a game with #currentRound', () => {

      it('should be null', () => {
        expect(game.currentRound).to.be.null;
      });

    });

    describe('returns a game with #roundsTotal', () => {

      it(`should equal ${ ROUNDS_LENGTH }`, () => {
        game.roundsTotal.should.equal(ROUNDS_LENGTH);
      });

    });

    describe('returns a game with #rounds', () => {

      it('should be an empty array', () => {
        game.rounds.should
          .be.an('array').and
          .be.empty;
      });

    });

    describe('returns a game with #players', () => {

      it('should be an empty array', () => {
        game.players.should
          .be.an('array').and
          .be.empty;
      });

    });

    describe('returns a game with #timeouts', () => {

      it('should be an empty array', () => {
        game.timeouts.should
          .be.an('array').and
          .be.empty;
      });

    });

    describe('returns a game with #emitter', () => {

      it('should be an EventEmitter instance', () => {
        game.emitter.should.be.an.instanceof(EventEmitter);
      });

    });

    describe('returns a round with #toJSON() and', () => {
      let json, currentRound, roundsTotal, players, winners, timeUntilStart;

      describe('#toJSON()', () => {

        beforeEach(() => {
          game = Game.create();
          game.currentRound = Symbol('currentRound');
          game.roundsTotal = Symbol('roundsTotal');
          game.players = Symbol('players');
          game.winners = Symbol('winners');
          game.timeUntilStart = Symbol('timeUntilStart');
          json = game.toJSON();
        });

        // currentRound roundsTotal players winners timeUntilStart
        it('should return an object with only #currentRound, #roundsTotal, #players, #winners, #timeUntilStart', () => {
          const otherProperties = _.keys(_.omit(json, ['currentRound', 'roundsTotal', 'players', 'winners', 'timeUntilStart']));
          otherProperties.should.have.length(0);
        });

        describe('returns an object with #currentRound and', () => {

          it('should equal game#currentRound', () => {
            json.currentRound.should.equal(game.currentRound);
          });

        });

        describe('returns an object with #roundsTotal and', () => {

          it('should equal game#roundsTotal', () => {
            json.roundsTotal.should.equal(game.roundsTotal);
          });

        });

        describe('returns an object with #players and', () => {

          it('should equal game#players', () => {
            json.players.should.equal(game.players);
          });

        });

        describe('returns an object with #winners and', () => {

          it('should equal game#winners', () => {
            json.winners.should.equal(game.winners);
          });

        });

        describe('returns an object with #timeUntilStart and', () => {

          it('should equal game#timeUntilStart', () => {
            json.timeUntilStart.should.equal(game.timeUntilStart);
          });

        });

      });

    });

  });

  describe('#addPlayerToGame()', () => {

    describe('when the player submits a name already taken', () => {

      it('should emit a rejection event', (done) => {
        game.emitter.on('player:rejected', (socketId) => {
          socketId.should.equal(playerSocketId);
          done();
        });

        Game.addPlayerToGame(game, playerSocketId, playerName);
        Game.addPlayerToGame(game, playerSocketId, playerName);
      });

    });

    describe('when the player submits a name not taken', () => {

      it('should add the player to the game with name applied with', () => {
        Game.addPlayerToGame(game, playerSocketId, playerName);
        _.findWhere(game.players, { socketId: playerSocketId, name: playerName }).should.exist;
      });

    });

    describe('when the player submits no name', () => {

      it('should add the player to the game with a generated name', () => {
        Game.addPlayerToGame(game, playerSocketId);

        const addedPlayer = _.findWhere(game.players, { socketId: playerSocketId });
        addedPlayer.name.startsWith(GUEST_NAME_PREFIX);
      });

    });

    describe('when the player is added to the game and', () => {

      describe('when the game has already started', () => {

        it('should emit a player addition event', (done) => {
          game.emitter.on('player:added', (socketId, game) => {
            socketId.should.equal(playerSocketId);
            game.currentRound.timeLeft.should.exist;
            done();
          });
          game.currentRound = Round.create();

          expect(game.currentRound.timeLeft).to.be.undefined;
          Game.addPlayerToGame(game, playerSocketId);
        });

      });

      describe('when the game has not been started', () => {

        it('should start the game', () => {
          const spy = sinon.spy(Game, 'start');
          Game.addPlayerToGame(game, playerSocketId);
          spy.should.have.been.calledWithExactly(game);
        });

      });

    });

  });

  describe('#removePlayerFromGame()', () => {
    let player;

    beforeEach(() => {
      player = Player.create(playerSocketId);
    });

    it('should remove the player with the matching #socketId', () => {
      game.players.push();
      Game.removePlayerFromGame(game, playerSocketId);
      game.players.should.be.empty
    });

    describe('when there are no players remaining', () => {

      it('should end the game', () => {
        game.rounds.push(Round.create());
        game.currentRound = Round.create();
        Game.removePlayerFromGame(game, playerSocketId);
        game.rounds.should.be.empty;
        expect(game.currentRound).to.be.null;
      });

    });

    describe('when there are players remaining', () => {

      it('should emit a player removal event', (done) => {
        game.emitter.on('player:removed', (game) => {
          game.players.should.not.contain(player);
          done();
        });
        game.players.length = 1;
        Game.removePlayerFromGame(game, playerSocketId);
      });

    });

  });

  describe('#start()', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(Game, 'startNextRound');
    });

    afterEach(() => {
      stub.restore();
    });

    it(`should add ${ ROUNDS_LENGTH } rounds to #rounds`, () => {
      game.rounds.should.have.length(0);
      Game.start(game);
      game.rounds.should.have.length(ROUNDS_LENGTH);
    });

    it(`should delete #winners`, () => {
      game.winners = [Player.create()];
      Game.start(game);
      expect(game.winners).to.be.undefined;
    });

    it(`should delete #timeUntilStart`, () => {
      game.timeUntilStart = NEXT_GAME_DELAY;
      Game.start(game);
      expect(game.timeUntilStart).to.be.undefined;
    });

    it('should call #startNextRound()', () => {
      Game.start(game);
      stub.should.have.been.calledWithExactly(game);
    });

  });

  describe('#startNextRound()', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(Round, 'start');
    });

    afterEach(() => {
      stub.restore();
    });

    describe('when there are rounds to play', () => {
      let round;

      beforeEach(() => {
        round = Round.create();
        game.rounds.push(round);
      });

      it('should start the next round', () => {
        Game.startNextRound(game);
        stub.should.have.been.calledWithExactly(round);
      });

      it('should set #currentRound', () => {
        expect(game.currentRound).to.be.null;
        Game.startNextRound(game);
        game.currentRound.should.equal(round);
      });

      it('should emit a round start event', (done) => {
        game.emitter.on('round:started', (gameWithRoundStarted) => {
          gameWithRoundStarted.should.equal(game);
          done();
        });

        Game.startNextRound(game);
      });

      describe('when the round timer ends', () => {
        let sandbox, clock, stub;

        beforeEach(() => {
          sandbox = sinon.sandbox.create();
          clock = sandbox.useFakeTimers();
          stub = sandbox.stub(Game, 'endCurrentRound');
        });

        afterEach(() => {
          sandbox.restore();
        });

        it('should emit a round end event', () => {
          Game.startNextRound(game);
          clock.tick(ROUND_DURATION);
          stub.should.have.been.calledWithExactly(game);
        });

      });

    });

    describe('when there are no rounds left to play', () => {

      it('should do nothing', () => {
        Game.startNextRound(game);
        stub.should.not.have.been.called;
      });

    });

  });

  describe('#endCurrentRound()', () => {
    let sandbox, clock, stub, currentRound;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sandbox.useFakeTimers();
      currentRound = game.currentRound = Round.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should end the current round', () => {
      stub = sandbox.stub(Round, 'end');
      Game.endCurrentRound(game);
      stub.should.have.been.calledWithExactly(currentRound);
    });

    it('should end the current round', () => {
      stub = sandbox.stub(game.emitter, 'emit');
      Game.endCurrentRound(game);
      stub.should.have.been.calledWithExactly('round:ended', game);
    });

    it('should manage the timer', () => {
      const timeout = {};
      stub = sandbox.stub(global, 'clearTimeout');
      game.timeouts.push(timeout);
      Game.endCurrentRound(game);
      stub.should.have.been.calledWithExactly(timeout);
      game.timeouts.should
        .have.length(1).and
        .not.include(timeout);
    });

    describe('when the delay timer ends and', () => {

      describe('when there are rounds left to play', () => {

        beforeEach(() => {
          stub = sandbox.stub(Game, 'startNextRound');
          game.rounds.push(Round.create());
        });

        it('should start the next round', () => {
          Game.endCurrentRound(game);
          clock.tick(NEXT_ROUND_DELAY);
          stub.should.have.been.calledWithExactly(game);
        });

      });

      describe('when there are no rounds left to play', () => {

        beforeEach(() => {
          stub = sandbox.stub(Game, 'end');
          game.rounds = [];
        });

        it('should end the game', () => {
          Game.endCurrentRound(game);
          clock.tick(NEXT_ROUND_DELAY);
          stub.should.have.been.calledWithExactly(game);
        });

      });

    });

  });

  describe('#end()', () => {
    let sandbox, clock, stub;

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
      clock = sinon.useFakeTimers();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should clear the timer', () => {
      stub = sandbox.stub(_, 'each');
      game.timeouts.push(setTimeout(_.noop), setTimeout(_.noop), setTimeout(_.noop));
      Game.end(game);

      stub.should.have.been.calledWithExactly(game.timeouts, clearTimeout)
      game.timeouts.should.be.empty;
    });

    it('should reset points', () => {
      stub = sandbox.stub(Game, 'resetPoints');
      Game.end(game);

      stub.should.have.been.calledWithExactly(game.players);
    });

    it('should remove all rounds', () => {
      game.rounds.push(Round.create());
      Game.end(game);

      game.rounds.should.be.empty;
    });

    describe('if there are still players', () => {
      const players = [Player.create(), Player.create()];

      beforeEach(() => {
        game.players.push(...players);
      });

      it('should set #winners', () => {
        stub = sandbox.stub(Game, 'getWinners');
        stub.returns(players);
        Game.end(game);

        game.winners.should.deep.equal(players);
      });

      it('should emit a game end event', () => {
        stub = sandbox.stub(game.emitter, 'emit');
        Game.end(game);

        stub.should.have.been.calledWithExactly('game:ended', game);
      });

      it('should manage the timer', () => {
        const timeout = _.uniqueId();
        stub = sandbox.stub(global, 'setTimeout');
        stub.returns(timeout);
        Game.end(game);

        stub.should.have.been.calledWithExactly(Game.start, NEXT_GAME_DELAY, game);
        game.timeouts.should.include(timeout);
      });

    });

  });

  describe('#getPlayer()', () => {

    it('should return the player matching the passed in socket ID', () => {
      const socketId = _.uniqueId();
      const playerA = Player.create(socketId);
      const playerB = Player.create();
      const players = [playerA, playerB];

      game.players.push(...players);
      const result = Game.getPlayer(socketId, players);

      result.should.equal(playerA);
    });

    it('should return undefined when no player matches the passed in socket ID', () => {
      const socketId = _.uniqueId();
      const playerA = Player.create();
      const playerB = Player.create();
      const players = [playerA, playerB];

      game.players.push(...players);
      const result = Game.getPlayer(socketId, players);

      expect(result).to.be.undefined;
    });

  });

  describe('#haveAllPlayersAnswered()', () => {
    const playerA = Player.create(_.uniqueId());
    const playerB = Player.create(_.uniqueId());
    const playerC = Player.create(_.uniqueId());
    const playerD = Player.create(_.uniqueId());

    describe('when all players have answered', () => {

      describe('when players have left the game after answering', () => {

        it('should return true if all players answered', () => {
          const players = [playerA, playerB];
          const playersAnswered = [playerA, playerB, playerC, playerD];
          const result = Game.haveAllPlayersAnswered(players, playersAnswered);

          result.should.be.true;
        });

      });

      describe('when no players have left the game after answering', () => {

        it('should return true if players have since left the game', () => {
          const players = [playerA, playerB, playerC, playerD];
          const playersAnswered = [playerA, playerB, playerC, playerD];
          const result = Game.haveAllPlayersAnswered(players, playersAnswered);

          result.should.be.true;
        });

      });

    });

    describe('when not all players have answered', () => {

      it('should return false', () => {
          const players = [playerA, playerB, playerC, playerD];
          const playersAnswered = [playerA, playerB];
          const result = Game.haveAllPlayersAnswered(players, playersAnswered);

          result.should.be.false;
      });

    });

  });

  describe('#evaluateChosenAnswer()', () => {
    const getTimesPlayerAnsweredCount = () => _.where(playersAnswered, player).length;
    let player, playersAnswered;

    beforeEach(() => {
      player = Player.create(playerSocketId);
      game.players.push(player);
      game.currentRound = Round.create();
      playersAnswered = game.currentRound.playersAnswered;
    });

    describe('player already answered', () => {

      it('should not evaluate subsequent answer submissions', () => {
        game.currentRound.playersAnswered.push(player);

        getTimesPlayerAnsweredCount().should.equal(1);
        Game.evaluateChosenAnswer(game, player.socketId);
        getTimesPlayerAnsweredCount().should.equal(1);
      });

    });

    describe('round already ended', () => {

      it('should not evaluate subsequent answer submissions', () => {
        game.currentRound.timeLeft = 0;

        getTimesPlayerAnsweredCount().should.equal(0);
        Game.evaluateChosenAnswer(game, player.socketId);
        getTimesPlayerAnsweredCount().should.equal(0);
      });

    });

    describe('player has not answered and round has not ended', () => {
      let answer;

      beforeEach(() => {
        answer = game.currentRound.trivia.answer;
      });

      it('should record that the player chose an answer', () => {
        getTimesPlayerAnsweredCount().should.equal(0);
        Game.evaluateChosenAnswer(game, player.socketId);
        getTimesPlayerAnsweredCount().should.equal(1);
      });

      describe('and chosen answer is correct', () => {

        it('should award points to the player', () => {
          player.points.should.equal(0);
          Game.evaluateChosenAnswer(game, player.socketId, answer);
          player.points.should.equal(ROUND_POINTS);
        });

        it('should emit a round end event', (done) => {
          game.emitter.on('round:ended', (gameWithRoundEnded) => {
            gameWithRoundEnded.should.equal(game);
            done();
          });

          Game.evaluateChosenAnswer(game, player.socketId, answer);
        });

      });

      describe('and chosen answer is incorrect and', () => {
        let incorrectAnswer = answer + 1;

        describe('all players have answered', () => {

          it('should emit a round end event', (done) => {
            game.emitter.on('round:ended', (gameWithRoundEnded) => {
              gameWithRoundEnded.should.equal(game);
              done();
            });

            Game.evaluateChosenAnswer(game, player.socketId, incorrectAnswer);
          });

        });

        describe('not all players have answered', () => {

          beforeEach(() => {
            game.players.push(Player.create());
          });

          it('should emit a answer rejection event', (done) => {
            game.emitter.on('answer:rejected', (socketId, gameWithAnswerRejected) => {
              const gameWithRoundEnded = _.cloneDeep(game);
              Round.end(gameWithRoundEnded.currentRound);

              socketId.should.equal(player.socketId);
              gameWithAnswerRejected.should.deep.equal(gameWithRoundEnded);
              Round.hasEnded(game.currentRound).should.be.false;
              done();
            });

            Game.evaluateChosenAnswer(game, player.socketId, incorrectAnswer);
          });

        });

      });

    });

  });

  describe('#getWinners()', () => {

    describe('when one player has the most points', () => {

      it('should return the player with the most points', () => {
        const winner = { points: ROUND_POINTS };
        const loser = { points: 0 };
        const players = [winner, loser];
        const winners = Game.getWinners(players);

        winners.should
          .have.length(1);
      });

    });

    describe('when multiple players tie for the most points', () => {

      it('should return all players tying for the most points', () => {
        const playerName1 = playerName;
        const playerName2 = 'Mathematician';
        const playerName3 = 'EnglishMajor'
        const winnerA = { name: playerName1, points: ROUND_POINTS };
        const winnerB = { name: playerName2, points: ROUND_POINTS };
        const loser = { name: playerName3, points: 0 };
        const players = [winnerA, winnerB, loser];
        const winners = Game.getWinners(players);

        winners.should
          .have.length(2).and
          .include(winnerA).and
          .include(winnerB);
      });

    });

    describe('when all players have 0 points', () => {

      it('should return an empty array', () => {
        const players = [{ points: 0 }, { points: 0 }];
        const winners = Game.getWinners(players);

        winners.should
          .be.an('array').and
          .be.empty;
      });

    });

  });

  describe('#resetPoints()', () => {
    let stub;

    beforeEach(() => {
      stub = sinon.stub(_, 'each');
    });

    afterEach(() => {
      stub.restore();
    });

    it('should reset the points of all players', () => {
      const playerA = Player.create(_.uniqueId());
      const playerB = Player.create(_.uniqueId());
      const playerC = Player.create(_.uniqueId());
      const players = [playerA, playerB, playerC];
      Game.resetPoints(players);

      stub.should.have.been.calledWithExactly(players, Player.resetPoints);
    });

  });

});
