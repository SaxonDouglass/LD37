
var behaviourState = {
  create: function () {
    // Robot tabs on left-side
    this.group_tabs = game.add.group();
    
    this.button_tab_alpha = game.make.button(
      0, 0,
      'buttons_tab_alpha', this.onButtonTab, this
    );
    this.group_tabs.add(this.button_tab_alpha);
    
    this.button_tab_epsilon = game.make.button(
      0, 0,
      'buttons_tab_epsilon', this.onButtonTab, this
    );
    this.group_tabs.add(this.button_tab_epsilon);
    
    this.button_tab_omega = game.make.button(
      0, 0,
      'buttons_tab_omega', this.onButtonTab, this
    );
    this.group_tabs.add(this.button_tab_omega);
    
    this.group_tabs.align(1, -1, 64, 270, Phaser.LEFT_CENTER);
    this.group_tabs.x = 16;
    this.group_tabs.y = (game.height - this.group_tabs.height) / 2;
  
    // Behaviour list center
    this.behaviour_list = this.behaviourList({
      number: 7
    });
    
    // OK button bottom right
    this.button_ok = game.add.button(
      game.width - 224, game.height - 92, 'buttons_ok', function () {
        game.state.start("menu");
      }, this
    );
  },
  
  behaviourCondition: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_condition",
      onClick, this
    );
    that.name = spec.name;
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(64, 16, that.name, style);
    that.addChild(that.text);
    
    return that;
  },
  
  behaviourAction: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_action",
      onClick, this
    );
    that.name = spec.name;
    that.x = 384;
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(16, 16, that.name, style);
    that.addChild(that.text);
    
    return that;
  },
  
  behaviourTarget: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
    };
    
    var that = game.make.button(0, 0, "buttons_behaviour_target",
      onClick, this
    );
    that.name = spec.name;
    that.x = 768;
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(16, 16, that.name, style);
    that.addChild(that.text);
    
    return that;
  },
  
  behaviourItem: function (spec, my) {
    my = my || {};
    
    var that = game.make.group();
    that.condition = this.behaviourCondition({name: "Condition"});
    that.add(that.condition);
    that.action = this.behaviourAction({name: "Action"});
    that.add(that.action);
    that.target = this.behaviourTarget({name: "Target"});
    that.add(that.target);
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    that.text = game.make.text(12, 16, spec.index, style);
    that.addChild(that.text);
    
    return that;
  },
  
  behaviourList: function (spec) {
    
    var that = game.add.group();
    
    for (let i = 1; i <= spec.number; i++) {
      that.add(this.behaviourItem({index: i}));
    }
    that.align(1, -1, 1152, 96, Phaser.CENTER);
    that.x = (game.width - that.width) / 2;
    that.y = (game.height - that.height) / 2;
    
    return that;
  },
  
};
