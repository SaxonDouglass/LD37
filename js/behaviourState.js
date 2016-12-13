
var behaviourState = {
  create: function () {
    // Robot tabs on left-side
    this.robots = [
      world.behaviours.alpha,
      world.behaviours.epsilon,
      world.behaviours.omega
    ];
    
    this.blueprints = [
      world.blueprints.alpha,
      world.blueprints.epsilon,
      world.blueprints.omega
    ];
    
    this.group_tabs = game.add.group();
    this.group_tabs.add(this.robotTab({
      image: "buttons_tab_alpha", robotIndex: 0}));
    this.group_tabs.add(this.robotTab({
      image: "buttons_tab_epsilon", robotIndex: 1}));
    this.group_tabs.add(this.robotTab({
      image: "buttons_tab_omega", robotIndex: 2}));
    this.group_tabs.align(1, -1, 64, 270, Phaser.LEFT_CENTER);
    this.group_tabs.x = 16;
    this.group_tabs.y = (game.height - this.group_tabs.height) / 2;
    
    // Load conditions, moves and targets
    let conditions = [];
    for (let c in world.conditions) {
      if (world.conditions.hasOwnProperty(c)) {
        conditions.push(c);
      }
    }
    let moves = [];
    for (let m in world.moves) {
      if (world.moves.hasOwnProperty(m)) {
        moves.push(m);
      }
    }
    let targets = [];
    for (let t in world.targets) {
      if (world.targets.hasOwnProperty(t)) {
        targets.push(t);
      }
    }
  
    // Behaviour list center
    this.group_lists = [];
    for (let i = 0; i < 3; i++) {
      this.group_lists[i] = this.behaviourList({
        number: 7,
        conditions: conditions,
        moves: moves,
        targets: targets,
        robot: this.robots[i],
        blueprint: this.blueprints[i],
      });
      this.group_lists[i].visible = i === 0;
    }
    
    // OK button bottom right
    this.button_ok = game.add.button(
      game.width - 224, game.height - 92, 'buttons_ok', function () {
        game.state.start("menu");
      }, this
    );
  },
  
  robotTab: function (spec) {
    that = game.make.button(
      0, 0, spec.image, function () {
        for (let i = 0; i < 3; i++) {
          this.group_tabs.children[i].alpha = i == spec.robotIndex ? 1.0 : 0.5;
          this.group_lists[i].visible = i == spec.robotIndex;
        }
      }, this
    );
    if (spec.robotIndex != 0) that.alpha = 0.5;
    
    return that;
  },
  
  behaviourCondition: function (spec, my) {
    my = my || {};
    
    let update = function () {
      let x = world.conditions[spec.conditions[that.condition]];
      spec.trigger.condition = x;
      that.text.setText(x.name);
    };
    
    let onClick = function () {
      that.condition = (that.condition + 1) % spec.conditions.length;
      update();
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_condition",
      onClick, this
    );
    that.condition = spec.conditions.indexOf(spec.trigger.condition.id);
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(64, 16, "", style);
    that.addChild(that.text);
    
    update();
    
    return that;
  },
  
  behaviourAction: function (spec, my) {
    my = my || {};
    
    let update = function () {
      let x = world.moves[spec.moves[that.move]];
      spec.trigger.action = x;
      that.text.setText(x.name);
    };
    
    let onClick = function () {
      that.move = (that.move + 1) % spec.moves.length;
      while (!spec.blueprint.hasMove(world.moves[spec.moves[that.move]])) {
        that.move = (that.move + 1) % spec.moves.length;
      }
      update();
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_action",
      onClick, this
    );
    that.move = spec.moves.indexOf(spec.trigger.action.id);
    that.x = 384;
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(16, 16, that.name, style);
    that.addChild(that.text);
    
    update();
    
    return that;
  },
  
  behaviourTarget: function (spec, my) {
    my = my || {};
    
    let update = function () {
      let x = world.targets[spec.targets[that.target]];
      spec.trigger.targets = x;
      that.text.setText(x.name);
    };
    
    let onClick = function () {
      that.target = (that.target + 1) % spec.targets.length;
      update();
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_target",
      onClick, this
    );
    that.target = spec.targets.indexOf(spec.trigger.targets.id);
    that.x = 768;
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(16, 16, that.name, style);
    that.addChild(that.text);
    
    update();
    
    return that;
  },
  
  behaviourItem: function (spec, my) {
    my = my || {};
    
    // Access current trigger
    let trigger = spec.robot.triggers[spec.triggerIndex];
    
    var that = game.make.group();
    that.condition = this.behaviourCondition({
      conditions: spec.conditions,
      robot: spec.robot,
      blueprint: spec.blueprint,
      trigger: trigger,
    });
    that.add(that.condition);
    that.action = this.behaviourAction({
      moves: spec.moves,
      robot: spec.robot,
      blueprint: spec.blueprint,
      trigger: trigger,
    });
    that.add(that.action);
    that.target = this.behaviourTarget({
      targets: spec.targets,
      robot: spec.robot,
      blueprint: spec.blueprint,
      trigger: trigger,
    });
    that.add(that.target);
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(12, 16, spec.triggerIndex + 1, style);
    that.addChild(that.text);
    
    return that;
  },
  
  behaviourList: function (spec) {
    
    var that = game.add.group();
    
    for (let i = 0; i < spec.number; i++) {
      that.add(this.behaviourItem({
        triggerIndex: i,
        conditions: spec.conditions,
        moves: spec.moves,
        targets: spec.targets,
        robot: spec.robot,
        blueprint: spec.blueprint,
      }));
    }
    that.align(1, -1, 1152, 96, Phaser.CENTER);
    that.x = (game.width - that.width) / 2;
    that.y = (game.height - that.height) / 2;
    
    return that;
  },
  
};
