var Player = require('../../libs/player');

describe('Player',function () {
  var player;
  var id;
  var name;

  beforeEach(function (done) {
    id = 1;
    name = 'Name';
    player = new Player(id, name);

    done();
  });

  it('should set the passed in ID when instantiated', function (done) {
    player.id.should.equal(id);
    done();
  });

  it('should set the passed in name when instantiated', function (done) {
    player.name.should.equal(name);
    done();
  });

  it('should have 0 points when instantiated', function (done) {
    player.points.should.equal(0);
    done();
  });

  describe('#addPoints', function () {

    it('should add points', function (done) {
      var player = new Player();
      var expected = player.points + player.ROUND_POINTS;
      var actual = player.addPoints();

      actual.should.equal(expected);

      done();
    });

  });

});