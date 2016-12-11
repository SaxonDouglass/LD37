
var battleState = {
  create: function () {
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
    while (world.tick < 20) {
      logger.log("tick " + parseInt(world.tick));
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
