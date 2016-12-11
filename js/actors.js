var actor = function (spec) {
  var tick = 0, statusDurations = [], statusAddQueue = [], statusRemoveQueue = [];
  var that = {};
  that.name = spec.name;
  that.heat = spec.blueprint.heat;           // Transient
  that.integrity = spec.blueprint.integrity; // Persistent
  that.shield = spec.blueprint.shield;       // Transient
  that.statusEffects = [];
  that.supply = spec.blueprint.supply;       // Persistent
  
  that.act = function (world) {
    var time = spec.behaviour.run(that, world);
    that.advance(time);
    return that;
  };

  that.addStatusEffect = function (effect, duration) {
    statusAddQueue.push([effect, duration]);
  };
  
  that.advance = function (time) {
    tick += time;
    return that;
  };
  
  that.damage = function (amount, them, move) {
    if (that.isDestroyed()) {
      return that;
    }

    let shieldAmount = amount;
    let residualAmount = 0;
    if (shieldAmount > that.shield) {
      residualAmount = shieldAmount - that.shield;
      shieldAmount = that.shield;
    }

    for (let effect of them.statusEffects) {
      [shieldAmount, residualAmount] = effect.damageThem(them, that, move, shieldAmount, residualAmount)
    }

    [shieldAmount, residualAmount] = move.type.damage(them, that, move, shieldAmount, residualAmount)
    
    for (let effect of that.statusEffects) {
      [shieldAmount, residualAmount] = effect.damageMe(that, them, move, shieldAmount, residualAmount)
    }
   
    if (that.shield > 0) {
      that.shield = that.shield - shieldAmount;
    
      if (that.shield < 0) {
        log.print(that.name  + "'s shield depleted");
        that.shield = 0;
      } else {
        log.print(that.name + "'s shield reduced to " + parseFloat(that.shield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
      }
    }

    if (residualAmount > 0) {
      let armour = spec.blueprint.armour;
      for (let effect of them.statusEffects) {
        armour = effect.armourThem(them, that, move, armour);
      }
      armour = move.type.armour(them, that, move, armour);
      for (let effect of that.statusEffects) {
        armour = effect.armourMe(that, them, move, armour);
      }

      let newAmount = Math.max(0, residualAmount - armour);
      if (newAmount < residualAmount) {
        log.print(parseInt(amount - newAmount) + " damage absorbed by " + that.name + "'s armour");
        residualAmount = newAmount;
      }
      that.integrity -= residualAmount;
      if (that.isDestroyed()) {
        log.print(that.name + "'s hull destroyed");
      } else {
        log.print(that.name + "'s hull integrity reduced to " + parseFloat(that.integrity * 100.0 / spec.blueprint.integrity).toFixed(1) + "%");
      }
    }
    return that;
  };

  that.hasStatusEffect = function (effect) {
    return that.statusEffects.indexOf(effect) >= 0;
  }
  
  that.heatCapacity = function () {
    return spec.blueprint.heat;
  }

  that.heatSink = function () {
    let heatSink = spec.blueprint.heatSink;
    for (let effect of that.statusEffects) {
      heatSink += effect.heatSink;
    }
    return heatSink;
  };

  that.isDestroyed = function () {
    return that.integrity <= 0;
  };
  
  that.isReady = function (world) {
    for (let effect of that.statusEffects) {
      if (!effect.canAct) {
        return false;
      }
    }
    return tick <= world.tick && that.heat > 0 && that.integrity > 0;
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
  
  that.removeStatusEffect = function (effect) {
    statusRemoveQueue.push(effect);
  };

  that.rest = function () {
    tick = 0;
    that.heat = that.heatCapacity;
    that.shield = spec.blueprint.shield;
    for (let idx = 0; idx < that.statusEffects; idx++) {
      if (statusDurations[idx].restClear) {
        that.removeStatusEffect(that.statusEffects[idx]);
      }
    }
    return that;
  };
  
  that.shieldRecharge = function () {
    let shieldRecharge = spec.blueprint.shieldRecharge;
    for (let effect of that.statusEffects) {
      shieldRecharge += effect.shieldRecharge;
    }
    return shieldRecharge;
  };

  that.speed = function () {
    return spec.blueprint.speed;
  };
  
  that.update = function (tick) {
    if (!that.isDestroyed()) {
      if (that.heat <= 0) {
        that.addStatusEffect(overheated, duration({restClear: true}));
      }

      for (let idx = 0; idx < that.statusEffects.length; idx++) {
        let effect = that.statusEffects[idx];
        if (effect.removeIf(that) || (statusDurations[idx].tick !== undefined && tick >= statusDurations[idx].tick)) {
          that.removeStatusEffect(effect);
        }
      }

      effectQueues();

      that.heat = Math.min(that.heat + that.heatSink(), that.heatCapacity());

      for (let effect of that.statusEffects) {
        effect.update(that);
      }

      let newShield = Math.min(that.shield + that.shieldRecharge(), spec.blueprint.shield);
      if (newShield > that.shield) {
        log.print(that.name + "'s shield recharged to " + parseFloat(newShield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
        that.shield = newShield;
      }

      for (let effect of that.statusEffects) {
        effect.update(that);
      }
      effectQueues();
      spec.blueprint.update(that);
    }
    return that;
  };

  var effectQueues = function () {
    tags = {
      name: that.name,
    };

    for (let [effect, duration] of statusAddQueue) {
      let idx = that.statusEffects.indexOf(effect);
      if (idx < 0) {
        if (effect.addLog) {
          log.print(effect.addLog, tags);
        }
        that.statusEffects.push(effect);
        statusDurations.push(duration);
      } else {
        statusDurations[idx] = statusDurations[idx].combine(duration);
      }
    }
    statusAddQueue = [];

    for (let effect of statusRemoveQueue) {
      let idx = that.statusEffects.indexOf(effect);
      if (idx >= 0) {
        if (effect.removeLog) {
          log.print(effect.removeLog, tags);
        }
        that.statusEffects.splice(idx, 1);
      }
    }
    statusRemoveQueue = [];
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
