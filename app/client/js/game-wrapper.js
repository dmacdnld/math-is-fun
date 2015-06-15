import React from 'react';
import io from 'socket.io-client';

import Game from '../../shared/components/game';

const socket = io();

class GameWrapper extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentWillMount() {
    socket.on('player:rejected', () => {
      this.setState({ rejected: true });
    });

    socket.on('game:updated', (game) => {
      this.setState({ game: game });
    });
  }

  render() {
    const { rejected, game } = this.state;

    return (
      <Game
        rejected={ rejected }
        game={ game }
        emitPlayerApplication={ socket.emit.bind(socket, 'player:applied') }
        emitAnswerSubmission={ socket.emit.bind(socket, 'answer:submitted') }
      />
    );
  }
};

export default GameWrapper;
