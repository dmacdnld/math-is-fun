module.exports = function (id, name, guestsCount) {
  "use strict";

  if (name === '') {
    name = 'guest' + (guestsCount + 1);
    this.isGuest = true;
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