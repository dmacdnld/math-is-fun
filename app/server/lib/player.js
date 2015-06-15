import _ from 'lodash';
import { ROUND_POINTS, GUEST_NAME_PREFIX } from '../../shared/game-config';

const Player = {
  awardPoints(player) {
    player.points = player.points + ROUND_POINTS;
  },

  resetPoints(player) {
    player.points = 0;
  },

  create(socketId, name = _.uniqueId(GUEST_NAME_PREFIX)) {
    const player = {
      socketId,
      name,
      points: 0,
      toJSON() {
        return _.pick(player, 'name', 'points');
      }
    };

    return player;
  }
}

export default Player;
