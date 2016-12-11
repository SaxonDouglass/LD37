var game = new Phaser.Game(1920, 1080, Phaser.AUTO, "");

// TODO: Implement additional game states
game.state.add("load", loadState);
game.state.add("menu", menuState);
game.state.add("blueprint", blueprintState);
// game.state.add("behaviour", behaviourState);
game.state.add("battle", battleState);
// game.state.add("battleReport", battleReportState);
// game.state.add("campaignReport", campaignReportState);

var logger = {
  log: console.log.bind(console)
};

var blueprint = function (spec) {
  var that = {};
  
  that.integrity = spec.integrity;
  that.heat = spec.heat;
  that.heatSink = spec.heatSink;
  that.shield = spec.shield;
  that.shieldRecharge = spec.shieldRecharge;
  that.supply = spec.supply;
  that.armour = spec.armour;

  that.update = function () {
    return that;
  };

  return that;
};

var condition = function (spec) {
  var that = {};
  
  that.check = function (that, world, target) {
    if (spec.self === true) {
      return compare(that[spec.property], spec.value); 
    } else {
      return compare(target[spec.property], spec.value);
    }
  };
  
  var compare = function (a, b) {
    if (spec.lessThan === true) {
      return a < b;
    } else {
      return a >= b;
    }
  };
  
  return that;
}

var target = function (spec) {
  var that = {};
  
  that.all = function (that, world) {
    let targets = [];
    for (let actor of world.actors) {
      let allies = actor.isRobot() === that.isRobot();
      if (allies === spec.allies) {
        targets.push(actor); 
      }
    }
    return targets;
  };
  
  return that;
};

var action = function (spec, my) {
  my = my || {};
  
  var that = {};
  that.name = spec.name;
  
  that.targeted = !(spec.targeted === false);
  
  that.run = function (that, world, targets) {
    let time = null;
    for (let target of targets) {
      if (spec.amount) {
        if (my.run(that, target)) {
          time = spec.time;
        }
      }
    };
    if (time) {
      that.heat -= spec.heat || 0;
      if (spec.heat > 0) logger.log(that.name + "'s heat reduced to " + that.heat);
      that.supply -= spec.supply || 0;
      if (spec.supply > 0) logger.log(that.name + "'s supply reduced to " + that.supply);
    }
    return time;
  };
  
  return that;
};

var attack = function (spec, my) {
  my = my || {};
  
  my.run = function(that, target) {
    if (!that.isDestroyed()) {
      logger.log(that.name + " attacks " + target.name + " with " + spec.name + " for " + spec.amount + " damage.");
      target.damage(spec.amount);
      return true;
    }
    return false;
  };
  
  var that = action(spec, my);
  
  return that;
};

var repair = function (spec, my) {
  my = my || {};
  
  my.run = function(that, target) {
    let newIntegrity = Math.min(target.integrity + spec.amount, target.maxIntegrity());
    if (!that.isDestroyed() && newIntegrity > target.integrity) {
      logger.log(that.name + " repairs " + target.name + " with " + spec.name + " for " + spec.amount + " damage.");
      target.integrity = newIntegrity;
      return true;
    }
    return false;
  }
  
  var that = action(spec, my);
    
  return that;
};

var trigger = function (spec) {
  var that = {};
  
  that.evaluate = function (that, world) {
    let targets = spec.targets.all(that, world);
    for (let target of targets) {
      if (spec.condition.check(that, world, target)) {
        let time;
        if (spec.action.targeted) {
          time = spec.action.run(that, world, [target]);
        } else {
          time = spec.action.run(that, world, targets);
        }
        if (time !== null) {
          return time;
        }
      }
    }
    return null;
  };
  
  return that;
}

var behaviour = function (spec) {
  var that = {};
  
  that.run = function (that, world) {
    for (let trigger of spec.triggers) {
      var time = trigger.evaluate(that, world);
      if (time !== null) {
        return time;
      }
    }
    return null;
  };
  
  return that;
};

var actor = function (spec) {
  var tick = 0;
  var that = {};
  that.name = spec.name;
  that.integrity = spec.blueprint.integrity; // Persistent
  that.heat = spec.blueprint.heat;           // Transient
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

  that.rest = function () {
    tick = 0;
    that.heat = spec.blueprint.heat;
    that.shield = spec.blueprint.shield;
    return that;
  };
  
  that.speed = function () {
    return spec.blueprint.speed;
  };
  
  that.update = function () {
    if (!that.isDestroyed()) {
      that.heat = Math.min(that.heat + spec.blueprint.heatSink, spec.blueprint.heat);
      that.shield = Math.min(that.shield + spec.blueprint.shieldRecharge, spec.blueprint.shield);
      logger.log(that.name + "'s shield recharged to " + parseFloat(that.shield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
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

var world = {
  actors: [],
  tick: 0
};

game.state.start("load");
