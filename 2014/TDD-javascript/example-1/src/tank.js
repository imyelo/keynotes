var DIRECTIONS = ['north', 'east', 'south', 'west'];
var _ = require('lodash');

var Tank = function () {
  this.x = 0;
  this.y = 0;
  this._direction = 0;
  return this;
};
Tank.prototype.reset = function () {
  this.x = 0;
  this.y = 0;
  this._direction = 0;
  return this;
};

Tank.prototype.turn = function (direct) {
  var index = _.indexOf(DIRECTIONS, direct);
  if (index > -1) {
    this._direction = index;
  }
  return this;
};

Tank.prototype.forward = function (step) {
  step = step || 1;
  if (this._direction === 0) {
    this.y += step;
  }
  if (this._direction === 1) {
    this.x += step;
  }
  if (this._direction === 2) {
    this.y -= step;
  }
  if (this._direction === 3) {
    this.x -= step;
  }
  return this;
};

Tank.prototype.direction = function () {
  return DIRECTIONS[this._direction];
};

Tank.prototype.back = function (step) {
  step = step || 1;
  return this.forward(-step);
};

module.exports = Tank;
