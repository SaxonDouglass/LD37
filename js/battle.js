
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
            action: repair({
              name: "Repair",
              amount: 50,
              heat: 10,
              supply: 10,
              time: 2
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
            action: attack({
              name: "Punch",
              amount: 30,
              heat: 30,
              supply: 1,
              time: 1
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
            action: attack({
              name: "Finisher",
              amount: 50,
              heat: 40,
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
            action: attack({
              name: "Claw",
              amount: 30,
              heat: 20,
              supply: 1,
              time: 1
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
