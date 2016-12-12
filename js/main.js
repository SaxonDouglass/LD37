var game = new Phaser.Game(1920, 1080, Phaser.AUTO, "");

var world = {
  actors: [],
  slot: {
    head: slot({ name: "Head" }),
    torso: slot({ name: "Torso" }),
    arm: slot({ name: "Arm" }),
    legs: slot({ name: "Legs" }),
    accessory: slot({ name: "Accessory" })
  },
  tick: 0
};

world.chassis = {
  basic: chassis({
    name: "Basic chassis",
    armor: 0,
    heat: 100,
    heatSink: 20,
    integrity: 100,
    shield: 50,
    shieldRecharge: 10,
    speed: 20,
    slots: [
      world.slot.head,
      world.slot.torso,
      world.slot.arm,
      world.slot.arm,
      world.slot.legs,
      world.slot.accessory,
      world.slot.accessory
    ],
    supply: 100,
  })
};

world.conditions = {
  any: condition({
    id: "any",
    name: "Any"
  }),
  
  integrityLT50: compareCondition({
    id: "integrityLT50",
    name: "Integrity < 50%",
    property: "integrity",
    value: 50,
    lessThan: true
  })
};

world.targets = {
  allyAny: target({
    id: "allyAny",
    name: "Ally: any",
    allies: true
  }),
  
  foeLeastIntegrity: sortedTarget({
    id: "foeLeastIntegrity",
    name: "Foe: least integrity",
    allies: false,
    property: "integrity",
    lowest: true,
  }),
};

world.moves = {
  bash: move({
    id: "bash",
    name: "Bash",
    damage: 20,
    description: "Deals {damage} damage to target.",
    heat: 20,
    log: "{me} punches {target} for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: physicalDamage,
  }),
  
  repair: move({
    id: "repair",
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
  
  finisher: move({
    id: "finisher",
    name: "Finisher",
    damage: 50,
    description: "Deals {damage} damage to target.",
    heat: 40,
    log: "{me} attacks {target} with a finishing move for {damage} damage",
    targeted: true,
    supply: 10,
    time: 1,
    type: armourPiercingDamage,
  }),
  
  claw: move({
    id: "claw",
    name: "Claw",
    damage: 30,
    description: "Deals {damage} damage to target.",
    heat: 20,
    log: "{me} claws {target} for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: physicalDamage,
  }),
  
  ventCoolant: move({
    id: "ventCoolant",
    name: "Vent coolant",
    description: "Cools self by 100 heat",
    heat: -100,
    log: "{me} vents coolant",
    self: true,
    time: 2,
  }),
  
  laserBlast: move({
    id: "laserBlast",
    name: "Laser blast",
    damage: 20,
    description: "Deals 20 damage to target.",
    heat: 10,
    log: "{me} fires a head-mounted laser blast at {target} for {damage} damage",
    targeted: true,
    time: 1,
    type: laserDamage,
  }),
  
  overchargeShields: move({
    id: "overchargeShields",
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
  
  slash: move({
    id: "slash",
    name: "Slash",
    damage: 30,
    description: "Deals {damage} damage to target.",
    log: "{me} hits {target} with a sword for {damage} damage",
    targeted: true,
    time: 2,
    type: physicalDamage,
  }),
  
  railgun: move({
    id: "railgun",
    name: "Railgun",
    damage: 50,
    description: "Deals {damage} damage to target.",
    heat: 30,
    log: "{me} shoots {target} with a railgun for {damage} damage",
    supply: 10,
    targeted: true,
    time: 2,
    type: armourPiercingDamage,
  }),
  
  burn: move({
    id: "burn",
    name: "Burn",
    damage: 20,
    description: "Deals {damage} damage to each target.",
    heat: 20,
    log: "{me} burns {targets} with a flamethrower for {damage} damage",
    supply: 10,
    targeted: false,
    time: 2,
    type: fireDamage,
  }),
  
  revive: move({
    id: "revive",
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
  
  refuel: move({
    id: "refuel",
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
  })
};

world.components = {
  coolingVents: component({
    name: "Cooling vents",
    description: "Keep your cool when others are losing theirs",
    icon: "buttons_part_head",
    heatSink: 10,
    moves: [world.moves.ventCoolant],
    slot: world.slot.head,
  }),
  
  headLaser: component({
    name: "Head mounted laser",
    description: "Where's the frickin' shark?",
    icon: "buttons_part_head",
    moves: [world.moves.laserBlast],
    slot: world.slot.head,
  }),
  
  fuelTank: component({
    name: "Fuel tank",
    description: "Now where are you going to keep your lighter?",
    icon: "buttons_part_torso",
    supply: 100,
    slot: world.slot.torso,
  }),

  shieldBooster: component({
    name: "Shield booster",
    description: "For those who take personal space very seriously.",
    icon: "buttons_part_torso",
    moves: [world.moves.overchargeShields],
    shield: 50,
    shieldRecharge: 10,
    slot: world.slot.torso,
  }),

  sword: component({
    name: "Sword",
    description: "Sharper than a new three-piece suit.",
    icon: "buttons_part_left_arm",
    moves: [world.moves.slash],
    slot: world.slot.arm,
  }),

  railgun:component({
    name: "Railgun",
    description: "Always keep a supply of skewers handy.",
    icon: "buttons_part_left_arm",
    moves: [world.moves.railgun],
    slot: world.slot.arm,
  }),

  flamethrower: component({
    name: "Flamethrower",
    description: "He asked you to keep his seat warm...",
    icon: "buttons_part_left_arm",
    moves: [world.moves.burn],
    slot: world.slot.arm,
  }),

  wrench: component({
    name: "Wrench",
    description: "All robots know to just Fonzie it.",
    icon: "buttons_part_left_arm",
    moves: [world.moves.repair, world.moves.revive],
    slot: world.slot.arm,
  }),

  fuelhose: component({
    name: "Fuel hose",
    description: "Or are you just glad to see me?",
    icon: "buttons_part_left_arm",
    moves: [world.moves.refuel],
    slot: world.slot.arm,
  })
};

world.blueprints = {
  alpha: robotBlueprint({
    chassis: world.chassis.basic,
    components: []
  }),
  epsilon: robotBlueprint({
    chassis: world.chassis.basic,
    components: []
  }),
  omega: robotBlueprint({
    chassis: world.chassis.basic,
    components: []
  }),
  monster: blueprint({
    integrity: 100,
    heat: 100,
    heatSink: 10,
    shield: 100,
    shieldRecharge: 10,
    supply: 100,
    armour: 5
  }),
};

world.behaviours = {};
let robot_names = ["alpha", "epsilon", "omega"];
for (let robot of robot_names) {
  let triggers = [];
  for (let i = 0; i < 7; i++) {
    triggers[i] = trigger({
      condition: world.conditions.any,
      action: world.moves.bash,
      targets: world.targets.foeLeastIntegrity
    });
  }
  world.behaviours[robot] = behaviour({ triggers: triggers });
}

game.state.add("load", loadState);
game.state.add("menu", menuState);
game.state.add("blueprint", blueprintState);
game.state.add("behaviour", behaviourState);
game.state.add("battle", battleState);
// game.state.add("battleReport", battleReportState);
// game.state.add("campaignReport", campaignReportState);

game.state.start("load");
