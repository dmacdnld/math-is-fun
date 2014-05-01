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

  it('should create a guest name when instantiated with no name', function (done) {
    var player = new Player(2, '', 0);
    var expected = 'guest1';
    var actual = player.name;

    actual.should.equal.expected;

    done();
  });

  it('should have 0 points when instantiated', function (done) {
    player.points.should.equal(0);
    done();
  });

  describe('#addPoints', function () {

    it('should add points', function (done) {
      var expected = player.points + player.ROUND_POINTS;
      var actual = player.addPoints();

      actual.should.equal(expected);

      done();
    });

  });

  describe('#resetPoints', function () {

    it('should reset points', function (done) {
      var expected = 0;
      var actual;

      player.addPoints();
      actual = player.resetPoints();

      actual.should.equal(expected);

      done();
    });

  });

});