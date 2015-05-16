import { EventEmitter } from 'events';

import _ from 'lodash';

import Round from './round';
import Player from './player';
import { ROUNDS_LENGTH, ROUND_DURATION, NEXT_GAME_DELAY, NEXT_ROUND_DELAY } from '../../shared/game-config';

const generateRounds = () => {
  const rounds = [];

  for (let i = 1; i <= ROUNDS_LENGTH; i++) {
    rounds.push(Round.create({ roundNumber: i }));
  }

  return rounds;
};

const Game = {
  create() {
    const game = {
      currentRound: null,
      roundsTotal: ROUNDS_LENGTH,
      rounds: [],
      players: [],
      timeouts: [],
      emitter: Object.create(EventEmitter.prototype),
      toJSON: () => {
        return _.pick(game, 'currentRound', 'roundsTotal', 'players', 'winners', 'timeUntilStart');
      }
    };

    return game;
  },

  addPlayerToGame(game, socketId, name) {
    const { currentRound, players } = game;
    const nameTaken = _.some(players, 'name', name);

    if (nameTaken) {
      game.emitter.emit('player:rejected', socketId);
    } else {
      name = name === "" ? undefined : name;
      const player = Player.create(socketId, name);
      players.push(player);

      if (currentRound) {
        Round.setTimeLeft(currentRound);
        game.emitter.emit('player:added', socketId, game);
      } else {
        game.emitter.emit('player:added', socketId, game);
        Game.start(game);
      }
    }
  },

  removePlayerFromGame(game, socketId) {
    const { players } = game;
    const player = Game.getPlayer(socketId, players);

    _.remove(players, player);

    if (game.players.length) {
      game.emitter.emit('player:removed', game);
    } else {
      Game.end(game);
    }
  },

  start(game) {
    const rounds = generateRounds();
    game.rounds.push(...rounds);
    delete game.winners;
    delete game.timeUntilStart;
    Game.startNextRound(game);
  },

  startNextRound(game) {
    const { rounds } = game;

    if (!rounds.length) return;

    const currentRound = rounds.shift();
    Round.start(currentRound);
    game.currentRound = currentRound;
    game.emitter.emit('round:started', game);

    const timeout = setTimeout(Game.endCurrentRound, ROUND_DURATION, game);
    game.timeouts.push(timeout);
  },

  endCurrentRound(game) {
    const { currentRound, timeouts } = game;
    const callback = game.rounds.length ? Game.startNextRound : Game.end;

    Round.end(currentRound);
    game.emitter.emit('round:ended', game);

    clearTimeout(timeouts.pop());
    const timeout = setTimeout(callback, NEXT_ROUND_DELAY, game);
    timeouts.push(timeout);
  },

  end(game) {
    const { players } = game;
    const winners = Game.getWinners(players);
    _.each(game.timeouts, clearTimeout);
    Game.resetPoints(players);
    game.rounds.length = 0;
    game.timeouts.length = 0;
    game.currentRound = null;
    if (players.length) {
      game.winners = winners;
      game.timeUntilStart = NEXT_GAME_DELAY;
      game.emitter.emit('game:ended', game);

      const timeout = setTimeout(Game.start, NEXT_GAME_DELAY, game);
      game.timeouts.push(timeout);
    }
  },

  getPlayer(socketId, players) {
    return _.findWhere(players, { socketId: socketId });
  },

  haveAllPlayersAnswered(players, playersAnswered) {
    return _.every(players, (player) => _.contains(playersAnswered, player));
  },

  evaluateChosenAnswer(game, socketId, chosenAnswer) {
    const { currentRound, players } = game;
    const player = Game.getPlayer(socketId, players);
    const playerAlreadyAnswered = Round.hasPlayerAnswered(currentRound, player);
    const roundAlreadyEnded = Round.hasEnded(currentRound);

    if (playerAlreadyAnswered || roundAlreadyEnded) return;

    currentRound.playersAnswered.push(player);

    const chosenAnswerIsCorrect = Round.isChosenAnswerCorrect(currentRound, chosenAnswer);

    if (chosenAnswerIsCorrect) {
      Player.awardPoints(player);
      Game.endCurrentRound(game);
    } else {
      const allPlayersAnswered = Game.haveAllPlayersAnswered(players, currentRound.playersAnswered);

      if (allPlayersAnswered) {
        Game.endCurrentRound(game);
      } else {
        const gameWithRoundEnded = _.cloneDeep(game);
        Round.end(gameWithRoundEnded.currentRound);
        game.emitter.emit('answer:rejected', socketId, gameWithRoundEnded);
      }
    }
  },

  getWinners(players) {
    const mostPoints = _.max(_.pluck(players, 'points'));

    if (mostPoints === 0) return [];

    // TODO: figure out why cloning isn't working !?!?
    // return _.deepClone(_.where(players, { points: mostPoints }));
    return _.map(_.where(players, { points: mostPoints }), (player) => {
      const { name, points } = player;
      return {
        name,
        points
      };
    });
  },

  resetPoints(players) {
    _.each(players, Player.resetPoints);
  }
}

export default Game;
