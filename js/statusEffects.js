var statusEffect = function(spec) {
  var that = {};

  that.name = spec.name;
  that.addLog = spec.addLog || null;
  that.canAct = !(spec.canAct === false);
  that.heatSink = spec.heatSink || 0;
  that.removeLog = spec.removeLog || null;
  that.shieldRecharge = spec.shieldRecharge || 0;
  that.speed = spec.speed || 0;

  that.update = spec.update || function (me) {};

  that.removeIf = spec.removeIf || function (me) {
    return false;
  };

  that.canTargetThem = spec.canITarget || function(me, them, move) {
    return true;
  };

  that.canTargetMe = spec.canTargetMe || function(me, them, move) {
    return true;
  };

  that.damageThem = spec.damageThem || function(me, them, move, shieldDamage, residualDamage) {
    return [shieldDamage, residualDamage];
  };

  that.damageMe = spec.damageMe || function(me, them, move, shieldDamage, residualDamage) {
    return [shieldDamage, residualDamage];
  };

  that.armourThem = spec.armourThem || function(me, them, move, effectiveArmour) {
    return effectiveArmour;
  };

  that.armourMe = spec.armourThem || function(me, them, move, effectiveArmour) {
    return effectiveArmour;
  };

  that.repairThem = spec.repairThem || function(me, them, move, amount) {
    return amount;
  };

  that.repairMe = spec.repairMe || function(me, them, move, amount) {
    return amount;
  }

  return that;
};

var duration = function(spec) {
  var that = {};

  that.restClear = spec.restClear || (spec.tick !== undefined);
  that.tick = spec.tick;

  that.combine = function (other) {
    let newSpec = {};
    newSpec.restClear = that.restClear && other.restClear;
    if (that.tick !== undefined && other.tick !== undefined) {
      newSpec.tick = Math.max(that.tick, other.tick);
    }

    return duration(newSpec);
  };

  return that;
}

// Can't act until heat completely dissapated
var overheated = statusEffect({
  name: "Overheated",
  canAct: false,
  removeIf: function (me) {
    return me.heat >= me.heatCapacity();
  },
  addLog: "{name} has overheated!",
  removeLog: "{name} has cooled down",
});

// Deal double damage
var empowered = statusEffect({
  name: "Empowered",
  damageThem: function(me, them, move, shieldDamage, residualDamage) {
    log.print("Damage doubled due to empower.")
    shieldDamage += move.damage;
    if (shieldDamage > them.shield) {
      return [them.shield, residualDamage + shieldDamage - them.shield];
    } else {
      return [shieldDamage, residualDamage];
    }
  },
});

// Recieve double damage
var vulnerable = statusEffect({
  name: "Vulnerable",
  damageMe: function(me, them, move, shieldDamage, residualDamage) {
    log.print("Damage doubled due to vulnerability.")
    shieldDamage += move.damage;
    if (shieldDamage > me.shield) {
      return [me.shield, residualDamage + shieldDamage - them.shield];
    } else {
      return [shieldDamage, residualDamage];
    }
  },
});

// Recieve double damage for fire
var fireVulnerability = statusEffect({
  name: "Vulnerable to fire",
  damageMe: function(me, them, move, shieldDamage, residualDamage) {
    if (move.type.isType(fireDamage)) {
      log.print("Damage doubled due to fire vulnerability.")
      shieldDamage += move.damage;
      if (shieldDamage > me.shield) {
        return [me.shield, residualDamage + shieldDamage - them.shield];
      }
    }
    return [shieldDamage, residualDamage];
  },
});
