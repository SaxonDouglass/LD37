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
  log: function (message, tags) {
    console.log(String(message).replace(/{([^}]+)}/g, function(match, key) {
      if (tags && tags.hasOwnProperty(key)) {
        return tags[key];
      }
      if (key === "{") {
        return key;
      }
      return match;
    }));
  },
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
