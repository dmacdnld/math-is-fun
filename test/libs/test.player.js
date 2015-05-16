import _ from 'lodash';

import Player from '../../app/server/lib/player';
import { ROUND_POINTS, GUEST_NAME_PREFIX } from '../../app/shared/game-config';

describe('Player', () => {
  let player;
  let socketId;
  let name;

  beforeEach(() => {
    socketId = '123abc';
    name = 'Mathlete';
    player = Player.create(socketId, name);
  });

  describe('#awardPoints()', () => {

    it(`should add ${ ROUND_POINTS } points`, () => {
      const expected = player.points + ROUND_POINTS;

      Player.awardPoints(player);

      const actual = player.points;

      actual.should.equal(expected);
    });

  });

  describe('#resetPoints()', () => {

    it(`should set points to 0`, () => {
      const expected = 0;

      Player.awardPoints(player);
      Player.resetPoints(player);

      const actual = player.points;

      actual.should.equal(expected);
    });

  });

  describe('#create()', () => {

    describe('returns a player with #socketId and', () => {

      it('should set the passed in socketId', () => {
        player.socketId.should.equal(socketId);
      });

    });

    describe('returns a player with #name and', () => {

      describe('when a name is passed in', () => {

        it('should set #name as that value', () => {
          player.name.should.equal(name);
        });

      });

      describe('when no name is passed in', () => {

        it('should set #name with a guest name', () => {
          const guest = Player.create(socketId);

          guest.name.should.match(new RegExp(`^${ GUEST_NAME_PREFIX }`));
        });

      });

    });

    describe('returns a player with #points and', () => {

      it('should be set to 0', () => {
        player.points.should.equal(0);
      });

    });

    describe('returns a player with #toJSON() and', () => {
      let json;

      beforeEach(() => {
        json = player.toJSON();
      });

      describe('#toJSON()', () => {

        it('should return an object with only #name and #points', () => {
          const otherProperties = _.keys(_.omit(json, ['name', 'points']));
          otherProperties.should.have.length(0);
        });

        it('should return an object with player#name', () => {
          json.name.should.equal(player.name);
        });

        it('should return an object with player#points', () => {
          json.points.should.equal(player.points);
        });

      });

    });

  });

});
