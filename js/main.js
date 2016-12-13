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
  stats: {
    win: false,
    encounterLast: -1,
    encounterTotal: -1
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
  
  myHeatGT90: compareCondition({
    id: "myHeatGT90",
    name: "Self Heat > 90",
    property: "heat",
    value: 90,
    lessThan: false,
    self: true,
  }),
  
  myHeatGT50: compareCondition({
    id: "myHeatGT50",
    name: "Self Heat > 50",
    property: "heat",
    value: 50,
    lessThan: false,
    self: true,
  }),
  
  integrityLT50: compareCondition({
    id: "integrityLT50",
    name: "Integrity < 50",
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
  
  foeAny: target({
    id: "foeAny",
    name: "Foe: any",
    allies: false
  }),
  
  foeLeastIntegrity: sortedTarget({
    id: "foeLeastIntegrity",
    name: "Foe: least integrity",
    allies: false,
    property: "integrity",
    lowest: true,
  }),
  
  foeMostIntegrity: sortedTarget({
    id: "foeMostIntegrity",
    name: "Foe: most integrity",
    allies: false,
    property: "integrity",
    lowest: false,
  }),
};

world.moves = {
  bash: move({
    id: "bash",
    name: "Bash",
    damage: 5,
    description: "Deals {damage} kinetic damage to target.",
    heat: 0,
    log: "{me} bashes {target} for {damage} damage",
    targeted: true,
    supply: 0,
    time: 1,
    type: kineticDamage,
  }),
  
  slash: move({
    id: "slash",
    name: "Slash",
    damage: 10,
    description: "Deals {damage} kinetic damage to target.",
    heat: 10,
    log: "{me} slashes {target} with energy blade for {damage} damage",
    targeted: true,
    supply: 0,
    time: 1,
    type: kineticDamage,
  }),
  
  chainGun: move({
    id: "chainGun",
    name: "Chain gun",
    damage: 20,
    description: "Deals {damage} kinetic damage to target.",
    heat: 10,
    log: "{me} shoots {target} with chain gun for {damage} damage",
    targeted: true,
    supply: 2,
    time: 1,
    type: kineticDamage,
  }),
  
  railGun: move({
    id: "railGun",
    name: "Rail gun",
    damage: 40,
    description: "Deals {damage} kinetic damage to target.",
    heat: 60,
    log: "{me} shoots {target} with rail gun for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: kineticDamage,
  }),
  
  laserCannon: move({
    id: "laserCannon",
    name: "Laser cannon",
    damage: 20,
    description: "Deals {damage} electromagnetic damage to target.",
    heat: 50,
    log: "{me} shoots {target} with laser cannon for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: electromagneticDamage,
  }),
  
  flamethrower: move({
    id: "flamethrower",
    name: "Flamethrower",
    damage: 20,
    description: "Deals {damage} thermal damage to target.",
    heat: 40,
    log: "{me} shoots {target} with laser cannon for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: thermalDamage,
  }),
  
  acidSoaker: move({
    id: "acidSoaker",
    name: "Acid soaker",
    damage: 20,
    description: "Deals {damage} chemical damage to target.",
    heat: 30,
    log: "{me} shoots {target} with acid soaker for {damage} damage",
    targeted: true,
    supply: 1,
    time: 1,
    type: chemicalDamage,
  }),
  
  repair: move({
    id: "repair",
    name: "Repair",
    description: "Repairs up to {repair} integrity damage.",
    heat: 30,
    log: "{me} repairs {target} for {repair} integrity",
    repair: 50,
    supply: 5,
    targeted: true,
    time: 1,
    validTarget: function (me, world, target) {
      return !target.isDestroyed && target.integrity < target.maxIntegrity();
    },
  }),
  
  overcharge: move({
    id: "overcharge",
    name: "Overcharge",
    description: "Increases current shields by 50, even beyond maximum.",
    heat: 50,
    supply: 1,
    log: "{me} overcharges its shields",
    once: function (me, world, targets) {
      me.shield += 50;
    },
    self: true,
    time: 1,
  }),
  
  analyze: move({
    id: "analyze",
    name: "Analyze",
    description: "Analyze the battlefield for improved performance.",
    heat: 30,
    log: "{me} analyzes and becomes empowered",
    supply: 0,
    once: function (me, world, targets) {
      me.addStatusEffect(empowered, 2);
    },
    targeted: false,
    validTarget: function (me, world, target) {
      return !me.hasStatusEffect(empowered);
    },
    self: true,
    time: 1,
  }),
  
  rocket: move({
    id: "rocket",
    name: "Rocket",
    damage: 10,
    description: "Deals {damage} kinetic damage to target.",
    heat: 20,
    log: "{me} rockets into {target} for {damage} damage",
    targeted: true,
    supply: 0,
    time: 1,
    type: kineticDamage,
  }),
  
  /*ventCoolant: move({
    id: "ventCoolant",
    name: "Vent coolant",
    description: "Cools self by 100 heat",
    heat: -100,
    log: "{me} vents coolant",
    self: true,
    time: 2,
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
  }),*/
  
  resupply: move({
    id: "resupply",
    name: "Resupply",
    description: "Scavenge for supply.",
    heat: 0,
    log: "{me} resupplies and gains 1 supply",
    supply: -1,
    targeted: false,
    time: 1,
  })
};

world.components = {
  armouredHead: component({
    name: "Armoured head",
    description: "Keeps your CPU intact",
    integrity: 20,
    armour: 5,
    heat: 20,
    icon: "buttons_part_head",
    slot: world.slot.head,
  }),
  
  ventedHead: component({
    name: "Vented head",
    description: "Keep a cool head!",
    integrity: 10,
    heat: 20,
    heatSink: 10,
    icon: "buttons_part_head",
    slot: world.slot.head,
  }),
  
  tacticalHead: component({
    name: "Tactical head",
    description: "Analzye the battlefield",
    integrity: 10,
    heat: 10,
    moves: [world.moves.analyze],
    icon: "buttons_part_head",
    slot: world.slot.head,
  }),
  
  lightTorso: component({
    name: "Light torso",
    description: "Light and nimble",
    icon: "buttons_part_torso",
    integrity: 40,
    armour: 0,
    heat: 40,
    heatSink: 20,
    supply: 20,
    speed: 100,
    slot: world.slot.torso,
  }),
  
  heavyTorso: component({
    name: "Heavy torso",
    description: "Heavy but well-padded",
    icon: "buttons_part_torso",
    integrity: 50,
    armour: 10,
    heat: 50,
    heatSink: 10,
    supply: 20,
    speed: 0,
    slot: world.slot.torso,
  }),
  
  ventedTorso: component({
    name: "Vented torso",
    description: "Keeps you cool, but unprotected",
    icon: "buttons_part_torso",
    integrity: 30,
    armour: 0,
    heat: 60,
    heatSink: 30,
    supply: 20,
    speed: 60,
    slot: world.slot.torso,
  }),
  
  supportTorso: component({
    name: "Support torso",
    description: "Carry plenty of supply",
    icon: "buttons_part_torso",
    integrity: 40,
    armour: 0,
    heat: 30,
    heatSink: 20,
    supply: 40,
    speed: 30,
    slot: world.slot.torso,
  }),
  
  energyBlade: component({
    name: "Energy blade",
    description: "Sharper than a new three-piece suit.",
    icon: "buttons_part_left_arm",
    moves: [world.moves.slash],
    slot: world.slot.arm,
  }),
  
  chainGun: component({
    name: "Chain gun",
    description: "Bring plenty of ammo!",
    icon: "buttons_part_left_arm",
    moves: [world.moves.chainGun],
    slot: world.slot.arm,
  }),
  
  railGun: component({
    name: "Rail gun",
    description: "Generates a lot of heat...",
    icon: "buttons_part_left_arm",
    moves: [world.moves.railGun],
    slot: world.slot.arm,
  }),
  
  laserCannon: component({
    name: "Laser cannon",
    description: "Good against shields",
    icon: "buttons_part_left_arm",
    moves: [world.moves.laserCannon],
    slot: world.slot.arm,
  }),
  
  flamethrower: component({
    name: "Flamethrower",
    description: "Keep them nice and toasty",
    icon: "buttons_part_left_arm",
    moves: [world.moves.flamethrower],
    slot: world.slot.arm,
  }),
  
  acidSoaker: component({
    name: "Acid soaker",
    description: "Gets more than just the stains out",
    icon: "buttons_part_left_arm",
    moves: [world.moves.acidSoaker],
    slot: world.slot.arm,
  }),
  
  repairArm: component({
    name: "Repair arm",
    description: "Don't leave it at home!",
    icon: "buttons_part_left_arm",
    moves: [world.moves.repair],
    slot: world.slot.arm,
  }),
  
  shieldArm: component({
    name: "Shield arm",
    description: "For those who take personal space very seriously.",
    icon: "buttons_part_left_arm",
    moves: [world.moves.overcharge],
    shield: 40,
    shieldRecharge: 10,
    slot: world.slot.arm,
  }),
  
  armouredLegs: component({
    name: "Armoured legs",
    description: "Don't take an arrow to the knee",
    integrity: 20,
    armour: 5,
    heat: 20,
    icon: "buttons_part_legs",
    slot: world.slot.legs,
  }),
  
  ventedLegs: component({
    name: "Vented legs",
    description: "Nice and breezy, like a kilt",
    integrity: 10,
    heat: 20,
    heatSink: 10,
    icon: "buttons_part_legs",
    slot: world.slot.legs,
  }),
  
  rocketLegs: component({
    name: "Rocket legs",
    description: "Hands full? Just rocket in to them!",
    integrity: 20,
    heat: 10,
    moves: [world.moves.rocket],
    icon: "buttons_part_legs",
    slot: world.slot.legs,
  }),

  armouredPlating: component({
    name: "Armoured plating",
    description: "Heavy, but durable",
    armour: 5,
    icon: "buttons_part_accessory",
    slot: world.slot.accessory,
  }),
  
  thickPlating: component({
    name: "Thick plating",
    description: "Might not be all that's thick",
    integrity: 20,
    icon: "buttons_part_accessory",
    slot: world.slot.accessory,
  }),
  
  shieldBooster: component({
    name: "Shield booster",
    description: "Works alone, but try combining it",
    shield: 10,
    shieldRecharge: 5,
    icon: "buttons_part_accessory",
    slot: world.slot.accessory,
  }),
  
  ammoBox: component({
    name: "Ammo box",
    description: "Holds bullets and spare parts",
    supply: 20,
    icon: "buttons_part_accessory",
    slot: world.slot.accessory,
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

world.blueprints.goblin = blueprint({
    name: "60BL1N",
    integrity: 50,
    heat: 50,
    heatSink: 5,
});
world.behaviours.goblin = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "goblin-stab",
        name: "Stab",
        damage: 10,
        description: "Deals {damage} damage to target.",
        log: "{me} stabs {target} with its dagger for {damage} damage",
        targeted: true,
        time: 1,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.gnoll = blueprint({
    name: "6N0LL",
    integrity: 100,
    heat: 50,
    heatSink: 5,
});
world.behaviours.gnoll = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "gnoll-stab",
        name: "Stab",
        damage: 40,
        description: "Deals {damage} damage to target.",
        log: "{me} stabs {target} with its spear for {damage} damage",
        targeted: true,
        time: 2,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.ogre = blueprint({
    name: "06R3",
    integrity: 150,
    heat: 50,
    heatSink: 5,
});
world.behaviours.ogre = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "ogre-club",
        name: "Club",
        damage: 60,
        description: "Deals {damage} damage to target.",
        log: "{me} clubs {target} for {damage} damage",
        targeted: true,
        time: 2,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.owlbear = blueprint({
    name: "0WLB34R",
    integrity: 150,
    armour: 5,
    heat: 60,
    heatSink: 20,
});
world.behaviours.owlbear = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.myHeatGT50,
      action: move({
        id: "owlbear-bite",
        name: "Bite",
        damage: 50,
        heat: 50,
        description: "Deals {damage} damage to target.",
        log: "{me} bites {target} for {damage} damage",
        targeted: true,
        time: 1,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "owlbear-claw",
        name: "Claw",
        damage: 20,
        description: "Deals {damage} damage to target.",
        log: "{me} claws {target} for {damage} damage",
        targeted: true,
        time: 1,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.troll = blueprint({
    name: "7R0LL",
    integrity: 50,
    shield: 100,
    shieldRecharge: 20,
    heat: 50,
    heatSink: 5,
});
world.behaviours.troll = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "troll-club",
        name: "Club",
        damage: 60,
        description: "Deals {damage} damage to target.",
        log: "{me} clubs {target} for {damage} damage",
        targeted: true,
        time: 3,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.gelatinouscube = blueprint({
    name: "63L471N0US CUB3",
    integrity: 150,
    heat: 60,
    heatSink: 5,
});
world.behaviours.gelatinouscube = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.myHeatGT50,
      action: move({
        id: "gelatinouscube-absorb",
        name: "Absorb",
        eachTarget: function (me, world, target) {
          target.addStatusEffect(statusEffect({
            name: "Absorbed",
            removeLog: "{me} escapes from " + me.name,
            canAct: false,
            update: function (target) {
              m = move({
                name: "Acid burn",
                description: "Deals {damage} acid damage",
                targeted: true,
                damage: 5,
                time: 0,
                type: chemicalDamage,
              });
              target.damage(m.damage, me, m);
            },
            removeIf: function (target) {
              return me.isDestroyed();
            },
          }), duration({ticks: world.ticks + 10}))
        },
        heat: 50,
        description: "Incapacitates target for 10 ticks and deals 5 acid damage per tick.",
        log: "{me} absorbs {target}, inacpacitating them",
        targeted: true,
        time: 3,
      }),
      targets: world.targets.foeMostIntegrity,
    }),
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "gelatinouscube-pseudopod",
        name: "Pseudopod",
        damage: 10,
        description: "Deals {damage} acid damage to target.",
        log: "{me} strikes {target} for {damage} acid damage",
        targeted: true,
        time: 2,
        type: chemicalDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});

world.blueprints.dragon = blueprint({
    name: "DR4G0N",
    integrity: 150,
    shield: 50,
    recharge: 10,
    armour: 10,
    heat: 100,
    heatSink: 10,
});
world.behaviours.dragon = behaviour({
  triggers: [
    trigger({
      condition: world.conditions.myHeatGT90,
      action: move({
        id: "dragon-fire",
        name: "Fire breathing",
        damage: 60,
        heat: 90,
        description: "Deals {damage} damage to all targets.",
        log: "{me} breathes fire on {targets} for {damage} damage",
        targeted: false,
        time: 3,
        type: thermalDamage,
      }),
      targets: world.targets.foeAny,
    }),
    trigger({
      condition: world.conditions.any,
      action: move({
        id: "dragon-bite",
        name: "Bite",
        damage: 30,
        description: "Deals {damage} damage to target.",
        log: "{me} bites {target} for {damage} damage",
        targeted: true,
        time: 1,
        type: kineticDamage,
      }),
      targets: world.targets.foeLeastIntegrity,
    }),
  ],
});


game.state.add("load", loadState);
game.state.add("menu", menuState);
game.state.add("blueprint", blueprintState);
game.state.add("behaviour", behaviourState);
game.state.add("battle", battleState);
game.state.add("battleReport", battleReportState);

game.state.start("load");
