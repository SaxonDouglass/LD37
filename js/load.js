
var loadState = {
  preload: function () {
    game.scale.pageAlignHorizontally = true;
    game.scale.parentIsWindow = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
  },
  
  create: function () {
    game.state.start("menu");
  }
};
