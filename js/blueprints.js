var blueprint = function (spec) {
  var that = {};
  
  that.armour = spec.armour;
  that.heat = spec.heat;
  that.heatSink = spec.heatSink;
  that.integrity = spec.integrity;
  that.shield = spec.shield;
  that.shieldRecharge = spec.shieldRecharge;
  that.speed = spec.speed;
  that.supply = spec.supply;

  that.update = function (robot) {
    return that;
  };

  return that;
};

var slot = function (spec) {
  var that = {};

  that.name = spec.name || "Generic slot";

  return that;
};

var chassis = function (spec) {
  var that = {};

  that.armour = spec.armour || 0;
  that.heat = spec.heat || 100;
  that.heatSink = spec.heatSink || 0;
  that.integrity = spec.integrity || 100;
  that.shield = spec.shield || 0;
  that.shieldRecharge = spec.shieldRecharge || 0;
  that.slots = spec.slots || [];
  that.speed = spec.speed || 0;
  that.supply = spec.supply || 0;

  return that;
};

var component = function (spec) {
  var that = {};

  that.armour = spec.armour || 0;
  that.heat = spec.heat || 0;
  that.heatSink = spec.heatSink || 0;
  that.integrity = spec.integrity || 0;
  that.moves = spec.moves || [];
  that.name = spec.name || "Generic component";
  that.description = spec.description || "Generic description";
  that.icon = spec.icon || "";
  that.shield = spec.shield || 0;
  that.shieldRecharge = spec.shieldRecharge || 0;
  that.slot = spec.slot;
  that.speed = spec.speed || 0;
  that.supply = spec.supply || 0;

  that.update = spec.update || function (robot) {
    return that;
  };

  return that;
};

var damageType = function (spec) {
  var that = {};

  that.name = spec.name;
  that.parentType = spec.parentType || null;

  that.armour = spec.armour || function(me, them, move, effectiveArmour) {
    return effectiveArmour;
  };

  that.damage = spec.damage || function(me, them, move, shieldDamage, residualDamage) {
    return [shieldDamage, residualDamage];
  };

  that.isType = function (type) {
    if (that === type) {
      return true
    } 
    if (!that.parentType) {
      return false
    }
    return that.parentType.isType(type)
  }

  return that;
}

var move = function (spec) {
  var validTarget, eachTarget, once, that = {};

  validTarget = spec.validTarget || function (me, world, target) {
    return !target.isDestroyed();
  };

  eachTarget = spec.eachTarget || function (me, world, target) {};
  once = spec.once || function (me, world, targets) {};

  that.id = spec.id;
  that.name = spec.name;
  that.description = spec.description;
  that.baseDamage = spec.damage || 0; 
  that.baseRepair = spec.reapir || 0; 
  that.targeted = !(spec.targeted === false);
  that.type = spec.type || physicalDamage;
  that.self = spec.self === true;
  
  that.run = function (me, world, targets) {
    if ((spec.supply || 0) > me.supply) {
      return null;
    }

    if (that.self && (targets.length !== 1 || targets[0] !== me)) {
      return null;
    }

    if (that.targeted && targets.length !== 1) {
      return null
    }

    let validTargets = [];
    for (let target of targets) {
      if (validTarget(me, world, target)) {
        let valid = true;
        for (let effect of me.statusEffects) {
          if (!effect.canTargetThem(me, target, that)) {
            valid = false;
            break
          }
        }
        if (!valid) continue;
        for (let effect of target.statusEffects) {
          if (!effect.canTargetMe(target, me, that)) {
            valid = false;
            break
          }
        }
        if (valid) validTargets.push(target);
      }
    }

    if (validTargets.length == 0) {
      return null;
    }

    tags = {
      me: me.name,
      target: validTargets[0].name,
      targets: [validTargets.slice(0, -1).join(', '), validTargets.slice(-1)[0]].join(validTargets.length < 2 ? '' : validTargets.length < 3 ? ' and ' : ', and '),
      name: spec.name,
      damage: spec.damage,
      repair: spec.repair,
    };

    log.print(spec.log, tags)
    for (let target of validTargets) {
      if (spec.damage) {
        target.damage(spec.damage, me, that);
      }
      if (spec.repair) {
        let repair = spec.repair;
        for (let effect of me.statusEffects) {
          repair = effect.repairThem(me, target, that, repair);
        }
        for (let effect of target.statusEffects) {
          repair = effect.repairMe(target, me, that, repair);
        }

        target.integrity = Math.min(target.integrity + repair, Math.max(target.integrity, target.maxIntegrity()));
      }
      eachTarget(me, world, target);
    }

    once(me, world, validTargets);

    me.heat -= spec.heat || 0;
    if (spec.heat && spec.heat > 0) log.print("{me}'s heat reduced to " + me.heat, tags);
    me.supply -= spec.supply || 0;
    if (spec.supply && spec.supply > 0) log.print("{me}'s supply reduced to " + me.supply, tags);

    log.print(spec.time);
    return spec.time;
  };
  
  return that;
};

var robotBlueprint = function (spec) {
  var that = blueprint(spec);

  that.armour = that.armour || spec.chassis.armour;
  that.components = new Array(spec.chassis.slots.length).fill(null);
  that.heat = that.heat || spec.chassis.heat;
  that.heatSink = that.heatSink || spec.chassis.heatSink;
  that.integrity = that.integrity || spec.chassis.integrity;
  that.shield = that.shield || spec.chassis.shield;
  that.shieldRecharge = that.shieldRecharge || spec.chassis.shieldRecharge;
  that.speed = spec.speed || spec.chassis.speed;
  that.supply = that.supply || spec.chassis.supply;
  
  that.setComponent = function (idx, component) {
    if (that.components[idx] != undefined &&
        that.components[idx].slot !== spec.chassis.slots[idx]) {
      console.warning("Incorrect slot for " + that.components[idx].name +
        " (requires " + that.components[idx].slot.name + ", not " +
        spec.chassis.slots[idx].name + "), skipping");
      return;
    }
    that.components[idx] = component;
    that.updateComponents();
  };

  that.update = function (robot) {
    for (let component of that.components) {
      if (component === null) {
        continue;
      }

      component.update(robot);
    }
    return that;
  }
  
  that.updateComponents = function () {
    for (let i = 0; i < spec.components.length; i++) {
      let component = spec.components[i];
      if (component === null) {
        continue
      }

      let slot = spec.chassis.slots[i];
      if (slot !== component.slot) {
        console.warning("Incorrect slot for " + component.name + " (requires " + component.slot.name + ", not " + slot.name + "), skipping")
        continue
      }

      that.components[i] = component;

      for (let move of component.moves) {
        that.moves.push(move);
      }

      that.armour += component.armour
      that.heat += component.heat
      that.heatSink += component.heatSink
      that.integrity += component.integrity
      that.shield += component.shield
      that.shieldRecharge += component.shieldRecharge
      that.speed += component.speed
      that.supply += component.supply
    }
  };
  
  that.updateComponents();

  return that;
};

var physicalDamage = damageType({
  name: "Physical",
});

var armourPiercingDamage = damageType({
  name: "Armour Piercing",
  parentType: physicalDamage,
  armour: function (me, them, move, effectiveArmour) {
    return Math.max(0, effectiveArmour - 10);
  },
});

var fireDamage = damageType({
  name: "Fire",
});

var laserDamage = damageType({
  name: "Laser",
});
