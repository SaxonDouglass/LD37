
var blueprintState = {
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
    
    // Selection pop-up panel
    this.group_selection = game.add.group();
    
    
    // Parts panel top left
    this.group_parts = game.add.group();
    
    this.button_part_head = this.partSlot({
      x: 256, y: 0, image: "buttons_part_head",
      items: [
        {
          name: "HeadTest1",
          description: "Hooby dooby",
          icon: "buttons_part_head"
        },
        {
          name: "HeadTest2",
          description: "YOLO #SWAG",
          icon: "buttons_part_head"
        },
        {
          name: "HeadTest3",
          description: "Styling!",
          icon: "buttons_part_head"
        }
      ]
    });
    this.group_parts.add(this.button_part_head);
    
    this.button_part_torso = this.partSlot({
      x: 256, y: 256, image: "buttons_part_torso",
      items: [
        {
          name: "TorsoTest1",
          description: "Hooby dooby",
          icon: "buttons_part_torso"
        },
        {
          name: "TorsoTest2",
          description: "YOLO #SWAG",
          icon: "buttons_part_torso"
        },
        {
          name: "TorsoTest3",
          description: "Styling!",
          icon: "buttons_part_torso"
        }
      ]
    });
    this.group_parts.add(this.button_part_torso);
    
    
    this.button_part_left_arm = this.partSlot({
      x: 512, y: 256, image: "buttons_part_left_arm",
      items: [
        {
          name: "LeftArmTest1",
          description: "Hooby dooby",
          icon: "buttons_part_left_arm"
        },
        {
          name: "LeftArmTest2",
          description: "YOLO #SWAG",
          icon: "buttons_part_left_arm"
        },
        {
          name: "LeftArmTest3",
          description: "Styling!",
          icon: "buttons_part_left_arm"
        }
      ]
    });
    this.group_parts.add(this.button_part_left_arm);
    
    this.button_part_right_arm = this.partSlot({
      x: 0, y: 256, image: "buttons_part_right_arm",
      items: [
        {
          name: "RightArmTest1",
          description: "Hooby dooby",
          icon: "buttons_part_right_arm"
        },
        {
          name: "RightArmTest2",
          description: "YOLO #SWAG",
          icon: "buttons_part_right_arm"
        },
        {
          name: "RightArmTest3",
          description: "Styling!",
          icon: "buttons_part_right_arm"
        }
      ]
    });
    this.group_parts.add(this.button_part_right_arm);
    
    this.button_part_legs = this.partSlot({
      x: 256, y: 512, image: "buttons_part_legs",
      items: [
        {
          name: "LegsTest1",
          description: "Hooby dooby",
          icon: "buttons_part_legs"
        },
        {
          name: "LegsTest2",
          description: "YOLO #SWAG",
          icon: "buttons_part_legs"
        },
        {
          name: "LegsTest3",
          description: "Styling!",
          icon: "buttons_part_legs"
        }
      ]
    });
    this.group_parts.add(this.button_part_legs);
    
    let accessory_items = [
      {
        name: "Acc1Test1",
        description: "Hooby dooby",
        icon: "buttons_part_accessory"
      },
      {
        name: "Acc2Test2",
        description: "YOLO #SWAG",
        icon: "buttons_part_accessory"
      },
      {
        name: "Acc3Test3",
        description: "Styling!",
        icon: "buttons_part_accessory"
      }
    ];
    
    this.button_part_accessory1 = this.partSlot({
      x: 0, y: 512, image: "buttons_part_accessory",
      items: accessory_items
    });
    this.group_parts.add(this.button_part_accessory1);
    
    this.button_part_accessory2 = this.partSlot({
      x: 512, y: 512, image: "buttons_part_accessory",
      items: accessory_items
    });
    this.group_parts.add(this.button_part_accessory2);
    
    this.group_parts.x = 256;
    this.group_parts.y = 128;
    
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
      game.width - 224, game.height - 92,
      'buttons_ok', this.onButtonOk, this
    );
  },
  
  update: function () {
    
  },
  
  onButtonOk: function () {
    game.state.start("menu");
  },
  
  onButtonTab: function () {
    game.state.start("menu");
  },
  
  partSlot: function (spec, my) {
    my = my || {};
    
    let onClick = function () {
      this.selectionPanel({
        items: spec.items
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
      // TODO: Make selection...
      spec.panel.destroy(true);
      this.group_parts.visible = true;
    };
    
    var that = game.make.button(0, 0, "buttons_part_selection",
      onClick, this
    );
    that.name = spec.name;
    that.description = spec.description;
    that.icon = game.make.image(16, 16, spec.icon);
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
      item.panel = that;
      that.add(this.selectionItem(item));
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
