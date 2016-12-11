var condition = function (spec) {
  var that = {};

  that.check = function (that, world, target) {
    return true;
  };

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

var sortedTarget = function (spec) {
  var that = target(spec),
      super_all = that.all.bind(that);

  that.all = function (that, world) {
    let targets = super_all(that, world);

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
};

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
