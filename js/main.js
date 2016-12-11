var game = new Phaser.Game(1920, 1080, Phaser.AUTO, "");

// TODO: Implement additional game states
game.state.add("load", loadState);
game.state.add("menu", menuState);
game.state.add("blueprint", blueprintState);
// game.state.add("behaviour", behaviourState);
game.state.add("battle", battleState);
// game.state.add("battleReport", battleReportState);
// game.state.add("campaignReport", campaignReportState);

var logger = {
  log: function (message, tags) {
    console.log(String(message).replace(/{([^}]+)}/g, function(match, key) {
      if (tags && tags.hasOwnProperty(key)) {
        return tags[key];
      }
      if (key === "{") {
        return key;
      }
      return match;
    }));
  },
};

var world = {
  actors: [],
  tick: 0
};

game.state.start("load");
