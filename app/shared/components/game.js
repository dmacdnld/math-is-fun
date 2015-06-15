import React from 'react';

import JoinForm from '../../shared/components/join-form';
import Message from '../../shared/components/message';
import Round from '../../shared/components/round';
import PlayerList from '../../shared/components/player-list';

class Game extends React.Component {
  render() {
    const { rejected, game, emitPlayerApplication, emitAnswerSubmission } = this.props;
    let component;

    if (rejected || !game) {
      component = (
        <JoinForm
          emitPlayerApplication={ emitPlayerApplication }
          rejected={ rejected }
        />
      );
    }
    else if (!game.currentRound) {
      component = (
        <Message
          game={ game }
        />
      );
    } else {
      const { currentRound: { trivia, timeLeft, roundNumber }, players, roundsTotal } = game;

      component = (
        <div id='game'>
          <Round
            emitAnswerSubmission={ emitAnswerSubmission }
            trivia={ trivia }
            timeLeft={ timeLeft }
            roundNumber={ roundNumber }
            roundsTotal={ roundsTotal }
          />
          <div id='player-section'>
            <h2>Players</h2>
            <PlayerList players={ players } />
          </div>
        </div>
      );
    }

    return component;
  }
};

export default Game;
