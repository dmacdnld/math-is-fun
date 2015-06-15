import React from 'react';
import _ from 'lodash';

import Player from './player';

class PlayerList extends React.Component {
  render() {
    const { players } = this.props;

    return (
      <ul id='player-list'>
        {
          _.map(players, (player) => {
            return <Player key={ player.name } player={ player } />;
          })
        }
      </ul>
    );
  }
};

export default PlayerList;
