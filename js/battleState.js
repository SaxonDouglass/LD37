
var stat_bars;

var statBar = function (spec) {
  var that = game.make.sprite(0, 0, "stats_bar_fill");
  
  let maxWidth = that.width;
  let cropRect = new Phaser.Rectangle(0, 0, that.width, that.height);
  that.tint = spec.stat.tint;
  
  that.update = function () {
    let val = spec.actor[spec.stat.stat];
    cropRect.width = maxWidth * (val / spec.stat.cap);
    that.crop(cropRect);
  };
  
  let frame = game.make.sprite(0, 0, "stats_bar_frame");
  that.addChild(frame);
  
  let style = { font: "20px monospace", fill: "#FFFFFF" };
  let label = game.make.text(0, -24, spec.stat.name, style);
  that.addChild(label);
  
  return that;
};

var statsPanel = function (spec) {
  var that = game.add.group();
  
  let actor = world.actors[spec.actor];
  
  for (let stat of spec.stats) {
    that.add(statBar({
      stat: stat,
      actor: actor
    }));
  }
  that.align(-1, 1, 400, 64);
  
  let style = { font: "32px monospace", fill: "#FFFFFF" };
  let label = game.make.text(1600, -16, actor.name, style);
  that.addChild(label);
  
  that.update = function () {
    for (let child of that.children) {
      child.update();
    }
  };
  
  return that;
}

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
      return p1;
    });
    that.text.setText(contents);
    that.text.y = that.background.height - that.text.height;
  };
  return that;
};
var log = null;
var encounter, encounters, dungeonComplete = false;

var battleState = {
  create: function () {
    log = logger({x: game.width - 800, y: game.height - 288});
    game.add.existing(log);

    encounters = [
      { "goblin": 1, },
      { "goblin": 2, },
      { "gnoll": 1, },
      { "gnoll": 1, "goblin": 2, },
      { "ogre": 1, },
      { "gelatinouscube": 1, },
      { "troll": 1, "goblin": 1, },
      { "owlbear": 1, "gnoll": 1, },
      { "goblin": 3, "gnoll": 2, },
      { "dragon": 1, },
    ];

    encounter = -1;
    
    dungeonComplete = false;
    this.button_ok = null;

    // Setup robots
    let robots =[
      robot({
        name: "Alpha",
        behaviour: world.behaviours.alpha,
        blueprint: world.blueprints.alpha,
      }),
      
      robot({
        name: "Epsilon",
        behaviour: world.behaviours.epsilon,
        blueprint: world.blueprints.epsilon,
      }),
      
      robot({
        name: "Omega",
        behaviour: world.behaviours.omega,
        blueprint: world.blueprints.omega,
      })
    ];
    
    // Stat bars - created in encounter
    stat_bars = game.add.group();

    world.haveWon = function () {
      for (let actor of world.actors) {
        if (!actor.isRobot() && !actor.isDestroyed()) {
          return false;
        }
      }
      return true;
    };
    
    world.haveLost = function () {
      for (let actor of world.actors) {
        if (actor.isRobot() && !actor.isDestroyed()) {
          return false;
        }
      }
      return true;
    };

    world.loadNextEncounter = function (){
      world.actors = [];
      world.tick = 0
      for (let robot of robots) {
        robot.rest();
        world.actors.push(robot);
      }
      stat_bars.destroy(); stat_bars = game.add.group();
      stat_bars.x = 16; stat_bars.y = 64;
      
      encounter++;
      world.stats.encounterLast = encounter;
      if (encounter < encounters.length) {
        for (let property in encounters[encounter]) {
          if (encounters[encounter].hasOwnProperty(property)) {
            let n = encounters[encounter][property];
            let blueprint = world.blueprints[property];
            let behaviour = world.behaviours[property];
            if (n == 1) {
              log.print("There is one "+blueprint.name+" here");
              world.actors.push(monster({
                name: blueprint.name,
                behaviour: behaviour,
                blueprint: blueprint,
              }));
            } else if (n > 1) {
              log.print("There are "+n+" "+blueprint.name+"s here");
              for (let i = 1; i <= n; i++) {
                world.actors.push(monster({
                  name: blueprint.name + " " + i,
                  behaviour: behaviour,
                  blueprint: blueprint,
                }));
              }
            }
          }
        }
        
        // Create stat bars
        for (let actor in world.actors) {
          if (world.actors.hasOwnProperty(actor)) {
            stat_bars.add(statsPanel({
              actor: actor,
              stats: [
                {name: "Integrity", stat: "integrity", tint: 0xCCFFAA, cap: 150 },
                {name: "Shield", stat: "shield", tint: 0xCCAAFF, cap: 50 },
                {name: "Heat", stat: "heat", tint: 0xFFCCAA, cap: 100 },
                {name: "Supply", stat: "supply", tint: 0xAAAAAA, cap: 50 }
              ]
            }));
          }
        }
        stat_bars.align(1, -1, 1920, 64);
        
        return true;
      } else {
        log.print("You win!");
        return false;
      }
    };

    log.print("Robots enter the dungeon.");
    world.stats.encounterTotal = encounters.length;
    world.loadNextEncounter();
  },
  update: function () {
    // log.print("tick " + parseInt(world.tick));
    if (this.button_ok) {return;}
    
    for (let actor of world.actors) {
      if (actor.isReady(world)) {
        actor.act(world);
      }
      actor.update(world.tick);
    }
    world.tick++;
    
    for (let sp of stat_bars.children) {
      sp.update();
    }

    if (world.haveWon()) {
      log.print("Monsters defeated!");
      log.print("After resting briefly, the robots enter the next room")
      if(!world.loadNextEncounter()) {
        world.stats.win = true;
        dungeonComplete = true;
      }
    } 

    if (world.haveLost()) {
      log.print("Robots defeated!");
      
      world.stats.win = false;
      dungeonComplete = true;
    }

    if (world.tick > 500) {
      log.print("Robots ran out of power!");
      world.stats.win = false;
      dungeonComplete = true;
    }
    
    if (dungeonComplete) {
      // OK button bottom right
      this.button_ok = game.add.button(
        game.width - 224, game.height - 92, 'buttons_ok', function () {
          game.state.start("battleReport");
        }, this
      );
    }
  }
}
