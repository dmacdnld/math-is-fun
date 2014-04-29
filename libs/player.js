module.exports = function (id, name) {
  "use strict";

  this.id = id;
  this.name = name;

  var points = 0;
  var ROUND_POINTS = 10;

  if (process.env.NODE_ENV === 'test') {
    this.points = points;
    this.ROUND_POINTS = ROUND_POINTS;
  }

  this.addPoints = function () {
    return points += ROUND_POINTS;
  };

  this.resetPoints = function () {
    return points = 0;
  };
};