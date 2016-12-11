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

var move = function (spec) {
  var validTarget, eachTarget, once, that = {};

  validTarget = spec.validTarget || function (me, world, target) {
    return !target.isDestroyed();
  };

  eachTarget = spec.eachTarget || function (me, world, target) {};
  once = spec.once || function (me, world, targets) {};

  that.name = spec.name;
  that.description = spec.description;
  that.baseDamage = spec.damage || 0; 
  that.baseRepair = spec.reapir || 0; 
  that.targeted = !(spec.targeted === false);
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

  that.update = function (robot) {
    for (let component of components) {
      if (component === null) {
        continue;
      }

      component.update(robot);
    }
    return that;
  }

  return that;
};

var head = slot({
  name: "Head",
});

var arm = slot({
  name: "Arm",
});

var torso = slot({
  name: "Torso",
});

var lightChassis = chassis({
  name: "Light chassis",
  armor: 0,
  heat: 100,
  heatSink: 20,
  integrity: 100,
  shield: 50,
  shieldRecharge: 10,
  speed: 20,
  slots: [head, arm, arm, torso],
  supply: 100,
});

var heavyChassis = chassis({
  name: "Heavy chassis",
  armor: 1,
  heat: 100,
  heatSink: 5,
  integrity: 150,
  shield: 50,
  shieldRecharge: 10,
  speed: 5,
  slots: [head, arm, torso],
  supply: 150,
});

var coolingVents = component({
  name: "Cooling vents",
  heatSink: 10,
  moves: [
    move({
      name: "Vent coolant",
      description: "Cools self by 100 heat",
      heat: -100,
      log: "{me} vents coolant",
      self: true,
      time: 2,
    }),
  ],
  slot: head,
});

var headLaser = component({
  name: "Head mounted laser",
  moves: [
    move({
      name: "Laser blast",
      damage: 20,
      description: "Deals 20 damage to target.",
      heat: 10,
      log: "{me} fires a head-mounted laser blast at {target} for {damage} damage",
      targeted: true,
      time: 1,
    }),
  ],
  slot: head,
});

var fuelTank = component({
  name: "Fuel tank",
  supply: 100,
  slot: torso,
});

var shieldBooster = component({
  name: "Shield booster",
  moves: [
    move({
      name: "Overcharge shields",
      description: "Increases current shields by 50. Can go above max shields.",
      heat: 50,
      log: "{me} overcharges its shields",
      once: function (me, world, targets) {
        me.shield += 50;
      },
      self: true,
      time: 2,
    }),
  ],
  shield: 50,
  shieldRecharge: 10,
  slot: torso,
});

var sword = component({
  name: "Sword",
  moves: [
    move({
      name: "Slash",
      damage: 30,
      description: "Deals {damage} damage to target.",
      log: "{me} hits {target} with a sword for {damage} damage",
      targeted: true,
      time: 2,
    }),
  ],
  slot: arm,
});

var railgun = component({
  name: "Railgun",
  moves: [
    move({
      name: "Railgun",
      damage: 50,
      description: "Deals {damage} damage to target.",
      heat: 30,
      log: "{me} shoots {target} with a railgun for {damage} damage",
      supply: 10,
      targeted: true,
      time: 2,
    }),
  ],
  slot: arm,
});

var flamethrower = component({
  name: "Flamethrower",
  moves: [
    move({
      name: "Burn",
      damage: 20,
      description: "Deals {damage} damage to each target.",
      heat: 20,
      log: "{me} burns {targets} with a flamethrower for {damage} damage",
      supply: 10,
      targeted: false,
      time: 2,
    }),
  ],
  slot: arm,
});

var wrench = component({
  name: "Wrench",
  moves: [
    move({
      name: "Revive",
      description: "Revives a destroyed robot with 50 integrity.",
      eachTarget: function (me, world, target) {
        target.integrity = 50;
      },
      heat: 50,
      log: "{me} revives {target} with 50 integrity",
      supply: 50,
      targeted: true,
      time: 3,
      validTarget: function (me, world, target) {
        return target.isDestroyed();
      },
    }),
    move({
      name: "Repair",
      description: "Repairs up to {repair} integrity damage.",
      heat: 30,
      log: "{me} repairs {target} for {repair} integrity",
      repair: 30,
      supply: 10,
      targeted: true,
      time: 1,
      validTarget: function (me, world, target) {
        return !target.isDestroyed && target.integrity < target.maxIntegrity();
      },
    }),
  ],
  slot: arm,
});

var fuelhose = component({
  name: "Fuel hose",
  moves: [
    move({
      name: "Refuel",
      description: "Transfers up to 50 supply.",
      eachTarget: function (me, world, target) {
        target.supply = min(target.supply + 50, target.maxSupply());
      },
      heat: 30,
      log: "{me} refuels {target}, transferring 50 supply",
      supply: 50,
      targeted: true,
      time: 1,
    }),
  ],
  slot: arm,
});
