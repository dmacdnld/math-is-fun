module.exports = function (id, name) {
  "use strict";

  this.id = id;
  this.name = name;
  this.points = 0;

  this.addPoints = function () {
    var ROUND_POINTS = 10;

    this.points += ROUND_POINTS;

    // Expose private variable for testing
    if (process.env.NODE_ENV === 'test') this.ROUND_POINTS = ROUND_POINTS;

    return this.points;
  }
};