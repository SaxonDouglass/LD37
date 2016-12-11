
var logger = function (spec) {
  var that = game.make.group();
  that.x = spec.x; that.y = spec.y;
    
  that.background = game.make.image(0, 0, "log");
  that.add(that.background);
  
  that.clamp = function () {
    if (that.text.height > that.background.height) {
      that.text.y = Math.min(
        Math.max(that.text.y, that.background.height - that.text.height), 0
      );
    } else {
      that.text.y = that.background.height - that.text.height;
    }
  };
  
  let style = {font: "16px monospace", fill: "#ffffff"};
  let contents = "";
  that.text = game.make.text(0, 0, contents, style);
  that.text.wordWrap = true;
  that.text.wordWrapWidth = that.background.width;
  that.text.inputEnabled = true;
  that.text.input.enableDrag();
  that.text.input.allowHorizontalDrag = false;
  that.text.events.onDragUpdate.add(that.clamp, that.text);
  that.add(that.text);
  that.clamp();
  let mask = game.add.graphics(0, 0);
  mask.beginFill(0xffffff);
  mask.drawRect(
    that.x, that.y,
    that.background.width, that.background.height
  );
  that.text.mask = mask;
  
  that.print = function (message, tags) {
    let str = String(message).replace(/{([^}]+)}/g, function(match, key) {
      if (tags && tags.hasOwnProperty(key)) {
        return tags[key];
      }
      if (key === "{") {
        return key;
      }
      return match;
    });
    if (contents.length > 0) contents += "\n";
    contents += str;
    contents = contents.replace(/(#[a-fA-F0-9]{6}){([^}]+)}/g, function(match, p0, p1, offset) {
      that.text.addColor(p0, offset);
      that.text.addColor("#ffffff", offset + p1.length);
      console.log(match + ", " + p0 + ", " + p1 + ", " + offset);
      return p1;
    });
    that.text.setText(contents);
    that.clamp();
  };
  return that;
};
var log = null;

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
        log.print(parseInt(amount - newAmount) + " damage absorbed by " + that.name + "'s #aaffcc{armour}");
        amount = newAmount;
      }
      that.integrity -= amount;
      that.shield = 0;
      log.print(that.name  + "'s shield depleted");
      if (that.isDestroyed()) {
        log.print(that.name + "'s hull destroyed");
      } else {
        log.print(that.name + "'s hull #ccffaa{integrity} reduced to " + parseFloat(that.integrity * 100.0 / spec.blueprint.integrity).toFixed(1) + "%");
      }
    } else if (amount > 0) {
      log.print(that.name + "'s #ccaaff{shield} reduced to " + parseFloat(that.shield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
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
      log.print(that.name + "'s #ccaaff{shield} recharged to " + parseFloat(that.shield * 100.0 / spec.blueprint.shield).toFixed(1) + "%");
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

var battleState = {
  create: function () {
    log = logger({x: game.width - 800, y: game.height - 288});
    game.add.existing(log);
    
    world.actors.push(robot({
      name: "Robot",
      behaviour: behaviour({
        triggers: [
          trigger({
            condition: condition({
              property: "integrity",
              value: 50,
              lessThan: true
            }),
            targets: target({
              allies: true,
            }),
            action: move({
              name: "Repair",
              description: "Repairs up to {repair} integrity damage.",
              heat: 10,
              log: "{me} repairs {target} for {repair} integrity",
              repair: 50,
              supply: 10,
              targeted: true,
              time: 2,
              validTarget: function (me, world, target) {
                return !target.isDestroyed() && target.integrity < target.maxIntegrity();
              },
            })
          }),
          trigger({
            condition: condition({
              property: "integrity",
              value: 0,
              lessThan: false
            }),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Punch",
              damage: 30,
              description: "Deals {damage} damage to target.",
              heat: 30,
              log: "{me} punches {target} for {damage} damage",
              targeted: true,
              supply: 1,
              time: 1,
            })
          }),
          
        ]
      }),
      blueprint: blueprint({
        integrity: 100,
        heat: 100,
        heatSink: 10,
        shield: 100,
        shieldRecharge: 10,
        supply: 100,
        armour: 5
      }),
    }));
    
    world.actors.push(monster({
      name: "Monster",
      behaviour: behaviour({
        triggers: [
          trigger({
            condition: condition({
              property: "integrity",
              value: 50,
              lessThan: true
            }),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Finisher",
              damage: 50,
              description: "Deals {damage} damage to target.",
              heat: 40,
              log: "{me} attacks {target} with a finishing move for {damage} damage",
              targeted: true,
              supply: 10,
              time: 1
            })
          }),
          trigger({
            condition: condition({
              property: "integrity",
              value: 0,
              lessThan: false
            }),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Claw",
              damage: 30,
              description: "Deals {damage} damage to target.",
              heat: 20,
              log: "{me} claws {target} for {damage} damage",
              targeted: true,
              supply: 1,
              time: 1,
            })
          })
        ]
      }),
      blueprint: blueprint({
        integrity: 100,
        heat: 100,
        heatSink: 10,
        shield: 100,
        shieldRecharge: 10,
        supply: 100,
        armour: 5
      }),
    }));
  },
  update: function () {
    while (world.tick < 10) {
      log.print("tick " + parseInt(world.tick));
      for (let actor of world.actors) {
        if (actor.isReady(world)) {
          actor.act(world);
        }
        actor.update();
      }
      world.tick++;
    }
  }
}
