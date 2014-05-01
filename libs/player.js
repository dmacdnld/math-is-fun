module.exports = function (id, name) {
  "use strict";

  if (name === '') {
    name = 'guest_' + id;
  }

  this.id = id;
  this.name = name;
  this.points = 0;
  this.ROUND_POINTS = 10;

  this.addPoints = function () {
    return this.points += this.ROUND_POINTS;
  };

  this.resetPoints = function () {
    return this.points = 0;
  };
};