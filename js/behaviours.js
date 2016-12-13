var condition = function (spec) {
  var that = {};

  that.check = function (that, world, target) {
    return true;
  };
  that.id = spec.id;
  that.name = spec.name || "Generic condition";

  return that;
};

var compareCondition = function (spec) {
  var that = condition(spec);

  that.check = function (me, world, target) {
    if (spec.self === true) {
      return compare(me[spec.property], spec.value); 
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
};

var statusCondition = function (spec) {
  var that = condition(spec);

  that.check = function (me, world, target) {
    let statuses;
    if (spec.self === true) {
      statuses = me.statuses
    } else {
      statuses = target.statuses
    }

    let hasStatus = statuses.indexOf(spec.status) === -1;
    return hasStatus === !(spec.present === false)
  };
  
  return that;
};

var target = function (spec) {
  var that = {};
  
  that.all = function (me, world) {
    let targets = [];
    for (let actor of world.actors) {
      let allies = actor.isRobot() === me.isRobot();
      if (allies === spec.allies) {
        targets.push(actor); 
      }
    }
    return targets;
  };
  that.id = spec.id;
  that.name = spec.name || "Generic target";
  
  return that;
};

var sortedTarget = function (spec) {
  var that = target(spec),
      super_all = that.all.bind(that);

  that.all = function (me, world) {
    let targets = super_all(me, world);

    targets.sort(compare);

    return targets;
  };

  var compare = function(a, b) {
    if (spec.lowest === true) {
      return a[spec.property] - b[spec.property];
    } else {
      return b[spec.property] - a[spec.property];
    }
  }

  return that;
};

var trigger = function (spec) {
  var that = {};
  that.condition = spec.condition;
  that.action = spec.action;
  that.targets = spec.targets;
  
  that.evaluate = function (me, world) {
    let targets = that.targets.all(me, world);
    for (let target of targets) {
      if (that.condition.check(me, world, target)) {
        let time;
        if (that.action.targeted) {
          time = that.action.run(me, world, [target]);
        } else {
          time = that.action.run(me, world, targets);
        }
        if (time !== null) {
          return time;
        }
      }
    }
    return null;
  };
  
  return that;
};

var behaviour = function (spec) {
  var that = {};
  that.triggers = spec.triggers;
  
  that.run = function (me, world) {
    for (let trigger of that.triggers) {
      var time = trigger.evaluate(me, world);
      if (time !== null) {
        return time;
      }
    }
    return null;
  };
  
  return that;
};
