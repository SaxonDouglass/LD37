
let menuButton = function (spec) {
  var that = game.make.button(
    0, 0, "buttons_part_selection", function () {
      game.state.start(spec.state);
  }, this);
  let style = { font: "48px monospace", fill: "#FFFFFF" };
  let text = game.make.text(that.width / 2, that.height / 2, spec.name, style);
  text.anchor.set(0.5);
  that.addChild(text);
  return that;
};

var menuState = {
  create: function () {
    this.group_items = game.add.group();
    
    this.group_items.add(menuButton({
      name: "Blueprints", state: "blueprint"
    }));
    this.group_items.add(menuButton({
      name: "Behaviours", state: "behaviour"
    }));
    this.group_items.add(menuButton({
      name: "Battle", state: "battle"
    }));
    
    this.group_items.align(1, -1, 768, 192, Phaser.CENTER);
    this.group_items.x = (game.width - this.group_items.width) / 2;
    this.group_items.y = (game.height - this.group_items.height) / 2;
  }
};
