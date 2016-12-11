
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
    console.log(str)
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
            condition: compareCondition({
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
            condition: condition({}),
            targets: sortedTarget({
              allies: false,
              property: "integrity",
              lowest: true,
            }),
            action: move({
              name: "Punch",
              damage: 50,
              description: "Deals {damage} damage to target.",
              heat: 30,
              log: "{me} punches {target} for {damage} damage",
              targeted: true,
              supply: 1,
              time: 1,
              type: physicalDamage,
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
            condition: compareCondition({
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
              time: 1,
              type: armourPiercingDamage,
            })
          }),
          trigger({
            condition: condition({}),
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
              type: physicalDamage,
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
    
    world.actors.push(monster({
      name: "Monster 2",
      behaviour: behaviour({
        triggers: [
          trigger({
            condition: compareCondition({
              property: "integrity",
              value: 50,
              lessThan: true
            }),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Finisher",
              damage: 5,
              description: "Deals {damage} damage to target.",
              heat: 40,
              log: "{me} attacks {target} with a finishing move for {damage} damage",
              targeted: true,
              supply: 10,
              time: 1,
              type: armourPiercingDamage,
            })
          }),
          trigger({
            condition: condition({}),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Claw",
              damage: 3,
              description: "Deals {damage} damage to target.",
              heat: 20,
              log: "{me} claws {target} for {damage} damage",
              targeted: true,
              supply: 1,
              time: 1,
              type: physicalDamage,
            })
          })
        ]
      }),
      blueprint: blueprint({
        integrity: 10,
        heat: 100,
        heatSink: 10,
        shield: 100,
        shieldRecharge: 10,
        supply: 100,
        armour: 5
      }),
    }));
    
    world.actors.push(monster({
      name: "Monster 3",
      behaviour: behaviour({
        triggers: [
          trigger({
            condition: compareCondition({
              property: "integrity",
              value: 50,
              lessThan: true
            }),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Finisher",
              damage: 5,
              description: "Deals {damage} damage to target.",
              heat: 40,
              log: "{me} attacks {target} with a finishing move for {damage} damage",
              targeted: true,
              supply: 10,
              time: 1,
              type: armourPiercingDamage,
            })
          }),
          trigger({
            condition: condition({}),
            targets: target({
              allies: false,
            }),
            action: move({
              name: "Claw",
              damage: 3,
              description: "Deals {damage} damage to target.",
              heat: 20,
              log: "{me} claws {target} for {damage} damage",
              targeted: true,
              supply: 1,
              time: 1,
              type: physicalDamage,
            })
          })
        ]
      }),
      blueprint: blueprint({
        integrity: 20,
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
        actor.update(world.tick);
      }
      world.tick++;
    }
  }
}
