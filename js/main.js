var game = new Phaser.Game(1920, 1080, Phaser.AUTO, "");

// TODO: Implement additional game states
game.state.add("load", loadState);
game.state.add("menu", menuState);
game.state.add("blueprint", blueprintState);
// game.state.add("behaviour", behaviourState);
game.state.add("battle", battleState);
// game.state.add("battleReport", battleReportState);
// game.state.add("campaignReport", campaignReportState);

game.state.start("load");
