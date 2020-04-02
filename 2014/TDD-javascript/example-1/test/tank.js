var chai = require('chai');
var expect = chai.expect;
var Tank = require('..');

describe('tank', function () {
  it('could turn', function () {
    var tank = new Tank();
    expect(tank).to.have.property('turn');
  });
  it('could forward', function () {
    var tank = new Tank();
    expect(tank).to.have.property('forward');
  });
  it('could get direction', function () {
    var tank = new Tank();
    expect(tank).to.have.property('direction');
  });
});

describe('tank', function () {
  var tank = new Tank();
  afterEach(function () {
    tank.reset();
  });
  describe('.turn(west).direction()', function () {
    it('should be west', function () {
      tank.turn('west');
      expect(tank.direction()).to.be.equal('west');
    });
  });
  describe('.forward()', function () {
    it('should be at (0,1)', function () {
      tank.forward();
      expect(tank.x).to.be.equal(0);
      expect(tank.y).to.be.equal(1);
    });
  });
  describe('.back(5)', function () {
    it('should be at (0,-5)', function () {
      tank.back(5);
      expect(tank.x).to.be.equal(0);
      expect(tank.y).to.be.equal(-5);
    });
  });
  describe('.back()', function () {
    it('should be at (0,-1)', function () {
      tank.back();
      expect(tank.x).to.be.equal(0);
      expect(tank.y).to.be.equal(-1);
    });
  });
});