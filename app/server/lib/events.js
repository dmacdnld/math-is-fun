import _ from 'lodash';
import { EventEmitter } from 'events';

import Game from './game';

const Events = {
  init(io) {
    const game = Game.create();

    io.on('connection', _.partial(Events.handleConnection, io, game));

    game.emitter.on('player:rejected', _.partial(Events.handlePlayerRejection, io));
    game.emitter.on('player:added', _.partial(Events.handlePlayerAddition, io));
    game.emitter.on('player:removed', _.partial(Events.handleGameUpdate, io));
    game.emitter.on('answer:rejected', _.partial(Events.handleAnswerRejection, io));
    game.emitter.on('round:started', _.partial(Events.handleGameUpdate, io));
    game.emitter.on('round:ended', _.partial(Events.handleGameUpdate, io));
    game.emitter.on('game:ended', _.partial(Events.handleGameUpdate, io));
  },

  handleConnection(io, game, socket) {
    socket.on('disconnect', _.partial(Game.removePlayerFromGame, game, socket.id));
    socket.on('player:applied', _.partial(Game.addPlayerToGame, game, socket.id));
    socket.on('answer:submitted', _.partial(Game.evaluateChosenAnswer, game, socket.id));
  },

  getSocketById(io, socketId) {
    return io.sockets.connected[socketId];
  },

  getSocketsInGame(io) {
    return io.sockets.in('game');
  },

  addSocketToGame(socket) {
    socket.join('game');
  },

  emitGameUpdate(sockets, game) {
    sockets.emit('game:updated', game);
  },

  emitPlayerRejection(socket) {
    socket.emit('player:rejected');
  },

  handlePlayerRejection(io, socketId) {
    Events.emitPlayerRejection(Events.getSocketById(io, socketId));
  },

  handlePlayerAddition(io, socketId, game) {
    Events.addSocketToGame(Events.getSocketById(io, socketId));
    Events.emitGameUpdate(Events.getSocketsInGame(io), game);
  },

  handleAnswerRejection(io, socketId, game) {
    Events.emitGameUpdate(Events.getSocketById(io, socketId), game);
  },

  handleGameUpdate(io, game) {
    Events.emitGameUpdate(Events.getSocketsInGame(io), game);
  }
};

export default Events;
