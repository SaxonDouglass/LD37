
var battleReportState = {
  create: function () {
    let victoryString;
    if (world.stats.win) {
      victoryString = "Your robots defeated the dragon and returned home safely.";
    } else {
      victoryString = "Your robots survived "+world.stats.encounterLast+" of "+world.stats.encounterTotal+" encounters.";
    }
    
    let style = { font: "32px monospace", fill: "#FFFFFF" };
    this.victoryLabel = game.add.text(0, 0, victoryString, style);
    this.victoryLabel.x = (game.width - this.victoryLabel.width) / 2;
    this.victoryLabel.y = (game.height - this.victoryLabel.height) / 2;
    
    // OK button bottom right
    this.button_ok = game.add.button(
      game.width - 224, game.height - 92, 'buttons_ok', function () {
        game.state.start("menu");
      }, this
    );
  }
};
