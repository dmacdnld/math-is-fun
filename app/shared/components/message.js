import React from 'react';
import _ from 'lodash';

class Message extends React.Component {
  constructor() {
    super();
    this.state = {};
  }

  componentDidMount() {
    const { game } = this.props;
    const oneSecond = 1000;
    let timeUntilStart = game.timeUntilStart;

    this.setState({ timeUntilStart: timeUntilStart / oneSecond });

    const countdownInterval = setInterval(() => {
      timeUntilStart = timeUntilStart - oneSecond;

      if (timeUntilStart >= 0) {
        this.setState({ timeUntilStart: timeUntilStart / oneSecond });
      } else {
        clearInterval(countdownInterval);
      }
    }, oneSecond);
  }

  getNextGameMessage(timeUntilStart) {
    const secondPluralization = timeUntilStart > 1 ? 'seconds' : 'second';
    const countDownMessage = `Next game starting in ${ timeUntilStart } ${ secondPluralization }!`;
    const startingMessage = 'Next game starting now';

    return timeUntilStart > 0 ? countDownMessage : startingMessage;
  }

  getWinningMessage(winners) {
    let tyingPlayers;

    if (!winners) {
      return;
    } else if (!winners.length) {
      return 'No winners this game :(';
    } else if (winners.length === 1) {
      return `${ winners[0].name } wins with ${ winners[0].points } points!`;
    } else if (winners.length === 2) {
      tyingPlayers = _.pluck(winners, 'name').join(' and ');
    } else if (winners.length > 2) {
      tyingPlayers = _.reduce(winners, (memo, winner, index) => {
        if (index < winners.length - 2) return `${ memo } ${ winner.name },`;
        if (index < winners.length - 1) return `${ memo } ${ winner.name }, and`;
        return `${ memo } ${ winner.name }`;
      }, '');
    }

    return `${ tyingPlayers } tie with ${ winners[0].points } points!`;
  }

  render() {
    const nextGameMessage = this.getNextGameMessage(this.state.timeUntilStart);
    const winningMessage = this.getWinningMessage(this.props.game.winners);
    let component;

    if (winningMessage) {
      component = (
        <div id='game'>
          <h2>{ winningMessage }</h2>
          <div>{ nextGameMessage }</div>
        </div>
      )
    } else {
      component = (
        <div id='game'>
          <h2>{ nextGameMessage }</h2>
        </div>
      );
    }

    return component
  }
};

export default Message;
