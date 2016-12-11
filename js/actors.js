var actor = function (spec) {
  var tick = 0;
  var that = {};
  that.name = spec.name;
  that.heat = spec.blueprint.heat;           // Transient
  that.integrity = spec.blueprint.integrity; // Persistent
  that.overheated = false;
  that.shield = spec.blueprint.shield;       // Transient
  that.supply = spec.blueprint.supply;       // Persistent
  
  that.act = function (world) {
    var time = spec.behaviour.run(that, world);
    that.advance(time);
    return that;
  };
  
  that.advance = function (time) {
    tick += time;
    return that;
  };
  
  that.damage = function (amount) {
    if (that.isDestroyed()) {
      return that;
    }
    
    that.shield -= amount;
    
    if (that.shield < 0) {
      amount = -that.shield;
      newAmount = Math.max(0, amount - spec.blueprint.armour);
      if (newAmount < amount) {
        logger.log(parseInt(amount - newAmount) + " damage absorbed by " + that.name + "'s armour");
        amount = newAmount;
      }
      that.integrity -= amount;
      that.shield = 0;
      logger.log(that.name  + "'s shield depleted");
      if (that.isDestroyed()) {
        logger.log(that.name + "'s hull destroyed");
      } else {
        logger.log(that.name + "'s hull integrity reduced to " + parseFloat(that.integrity * 100.0 / spec.blueprint.integrity).toFixed(1) + "%");
      }
    } else if (amount > 0) {
      logger.log(that.name + "'s shield reduced to " + parseFloat(that.shield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
    }

    return that;
  };
  
  that.isDestroyed = function () {
    return that.integrity <= 0;
  };
  
  that.isReady = function (world) {
    return !that.overheated && tick <= world.tick && that.heat > 0 && that.integrity > 0;
  };
  
  that.isRobot = function () {
    return spec.robot === true;
  };
  
  that.maxIntegrity = function () {
    return spec.blueprint.integrity;
  };
  
  that.maxSupply = function () {
    return spec.blueprint.supply;
  };

  that.rest = function () {
    tick = 0;
    that.heat = spec.blueprint.heat;
    that.shield = spec.blueprint.shield;
    that.overheated = false;
    return that;
  };
  
  that.speed = function () {
    return spec.blueprint.speed;
  };
  
  that.update = function () {
    if (!that.isDestroyed()) {
      if (!that.overheated && that.heat <= 0) {
        logger.log(that.name + " has overheated.");
        that.overheated = true;
      }

      that.heat = Math.min(that.heat + spec.blueprint.heatSink, spec.blueprint.heat);

      if (that.overheated &&that.heat >= spec.blueprint.heat) {
        logger.log(that.name + " has cooled down.");
        that.overheated = false;
      }

      let newShield = Math.min(that.shield + spec.blueprint.shieldRecharge, spec.blueprint.shield);
      if (newShield > that.shield) {
        logger.log(that.name + "'s shield recharged to " + parseFloat(newShield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
        that.shield = newShield;
      }
      spec.blueprint.update(that);
    }
    return that;
  };
  
  return that;
};

var robot = function (spec) {
  spec.robot = true;
  var that = actor(spec);
  return that;
};

var monster = function (spec) {
  spec.robot = false;
  var that = actor(spec);
  return that;
};
