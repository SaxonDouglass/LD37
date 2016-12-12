
var blueprintState = {
  create: function () {
    // Robot tabs on left-side
    this.robots = [
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
    
    // Load components by slot
    let items = [];
    for (let s in world.slot) {
      if (world.slot.hasOwnProperty(s)) {
        items[s] = [];
        for (let c in world.components) {
          if (world.components.hasOwnProperty(c)) {
            if (world.components[c].slot == world.slot[s]) {
              items[s].push(world.components[c]);
            }
          }
        }
      }
    }
    
    // Parts panel top left (one for each robot)
    this.group_parts = [];
    for (let i = 0; i < 3; i++) {
      this.group_parts[i] = game.add.group();
      
      this.button_part_head = this.partSlot({
        x: 256, y: 0, image: "buttons_part_head",
        items: items.head, robot: i, slotIndex: 0
      });
      this.group_parts[i].add(this.button_part_head);
      
      this.button_part_torso = this.partSlot({
        x: 256, y: 256, image: "buttons_part_torso",
        items: items.torso, robot: i, slotIndex: 1
      });
      this.group_parts[i].add(this.button_part_torso);
      
      this.button_part_left_arm = this.partSlot({
        x: 512, y: 256, image: "buttons_part_left_arm",
        items: items.arm, robot: i, slotIndex: 2
      });
      this.group_parts[i].add(this.button_part_left_arm);
      
      this.button_part_right_arm = this.partSlot({
        x: 0, y: 256, image: "buttons_part_right_arm",
        items: items.arm, robot: i, slotIndex: 3
      });
      this.group_parts[i].add(this.button_part_right_arm);
      
      this.button_part_legs = this.partSlot({
        x: 256, y: 512, image: "buttons_part_legs",
        items: items.legs, robot: i, slotIndex: 4
      });
      this.group_parts[i].add(this.button_part_legs);
      
      this.button_part_accessory1 = this.partSlot({
        x: 0, y: 512, image: "buttons_part_accessory",
        items: items.accessory, robot: i, slotIndex: 5
      });
      this.group_parts[i].add(this.button_part_accessory1);
      
      this.button_part_accessory2 = this.partSlot({
        x: 512, y: 512, image: "buttons_part_accessory",
        items: items.accessory, robot: i, slotIndex: 6
      });
      this.group_parts[i].add(this.button_part_accessory2);
      
      this.group_parts[i].x = 256;
      this.group_parts[i].y = 128;
      
      this.group_parts[i].visible = i === 0;
    };
    
    // Statistics panel top right
    this.panel_stats = this.statsPanel({
      x: game.width - 512, y: 64,
      stats: [
        { name: "Integrity", tint: 0xCCFFAA, value: 100, cap: 150 },
        { name: "Armour", tint: 0xAAFFCC, value: 20, cap: 50 },
        { name: "Shield", tint: 0xCCAAFF, value: 70, cap: 100 },
        { name: "Shield recharge", tint: 0xAACCFF, value: 19, cap: 20 },
        { name: "Heat capacity", tint: 0xFFCCAA, value: 80, cap: 100 },
        { name: "Heat dissipation", tint: 0xFFAACC, value: 5, cap: 20 },
        { name: "Ammunition", tint: 0xAAAAAA, value: 95, cap: 100 },
      ]
    });
    
    // OK button bottom right
    this.button_ok = game.add.button(
      game.width - 224, game.height - 92, 'buttons_ok', function () {
        game.state.start("menu");
      }, this
    );
  },
  
  update: function () {
    
  },
  
  robotTab: function (spec) {
    that = game.make.button(
      0, 0, spec.image, function () {
        for (let i = 0; i < 3; i++) {
          this.group_tabs.children[i].alpha = i == spec.robotIndex ? 1.0 : 0.5;
          this.group_parts[i].visible = i == spec.robotIndex;
        }
      }, this
    );
    if (spec.robotIndex != 0) that.alpha = 0.5;
    
    return that;
  },
  
  partSlot: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
      this.selectionPanel({
        items: spec.items,
        robot: spec.robot,
        slotIndex: spec.slotIndex
      });
    };
    
    var that = game.make.button(spec.x, spec.y, spec.image,
      onClick, this
    );
    
    return that;
  },
  
  selectionItem: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
      this.robots[spec.robot].setComponent(spec.slotIndex, spec.item);
      spec.panel.destroy(true);
      this.group_parts.visible = true;
    };
    
    var that = game.make.button(0, 0, "buttons_part_selection",
      onClick, this
    );
    that.name = spec.item.name;
    that.description = spec.item.description;
    that.icon = game.make.image(16, 16, spec.item.icon);
    that.addChild(that.icon);
    
    let style = { font: "20px monospace", fill: "#FFFFFF" };
    that.text_name = game.make.text(160, 16, that.name, style);
    that.addChild(that.text_name);
    that.text_description = game.make.text(160, 48, that.description, style);
    that.addChild(that.text_description);
    
    return that;
  },
  
  selectionPanel: function (spec, my) {
    my = my || {};
    
    var that = game.add.group();
    
    this.group_parts.visible = false;
    
    for (let item of spec.items) {
      that.add(this.selectionItem({
        item: item,
        panel: that,
        robot: spec.robot,
        slotIndex: spec.slotIndex
      }));
    }
    that.align(1, -1, 768, 192, Phaser.CENTER);
    that.x = 224;
    that.y = 128;
    
    return that;
  },
  
  statsBar: function (spec, my) {
    my = my || {};
    
    var that = game.make.sprite(0, 0, "stats_bar_fill");

    that.value = spec.value;
    that.cap = spec.cap;
    that.cropRect = new Phaser.Rectangle(
      0, 0, that.width * (that.value / that.cap), that.height
    );
    that.crop(that.cropRect);
    that.tint = spec.tint;
    
    let frame = game.make.sprite(0, 0, "stats_bar_frame");
    that.addChild(frame);
    
    let style = { font: "20px monospace", fill: "#FFFFFF" };
    let label = game.make.text(0, -24, spec.name, style);
    that.addChild(label);
    
    return that;
  },
  
  statsPanel: function (spec, my) {
    my = my || {};
    
    var that = game.add.group();
    
    for (let stat of spec.stats) {
      stat.panel = that;
      that.add(this.statsBar(stat));
    }
    that.align(1, -1, 384, 64, Phaser.LEFT_TOP);
    that.x = spec.x;
    that.y = spec.y;
    
    return that;
  }
};
