
var loadState = {
  preload: function () {
    game.scale.pageAlignHorizontally = true;
    game.scale.parentIsWindow = true;
    game.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
    
    game.load.image("log", "assets/log.png");
    game.load.image("stats_bar_fill", "assets/stats_bar_fill.png");
    game.load.image("stats_bar_frame", "assets/stats_bar_frame.png");
    
    game.load.image("buttons_ok", "assets/buttons/ok.png");
    game.load.image("buttons_behaviour_condition", "assets/buttons/behaviour_condition.png");
    game.load.image("buttons_behaviour_action", "assets/buttons/behaviour_action.png");
    game.load.image("buttons_behaviour_target", "assets/buttons/behaviour_target.png");
    game.load.image("buttons_part_head", "assets/buttons/part_head.png");
    game.load.image("buttons_part_torso", "assets/buttons/part_torso.png");
    game.load.image("buttons_part_left_arm", "assets/buttons/part_left_arm.png");
    game.load.image("buttons_part_right_arm", "assets/buttons/part_right_arm.png");
    game.load.image("buttons_part_legs", "assets/buttons/part_legs.png");
    game.load.image("buttons_part_accessory", "assets/buttons/part_accessory.png");
    game.load.image("buttons_part_selection", "assets/buttons/part_selection.png");
    game.load.image("buttons_tab_alpha", "assets/buttons/tab_alpha.png");
    game.load.image("buttons_tab_epsilon", "assets/buttons/tab_epsilon.png");
    game.load.image("buttons_tab_omega", "assets/buttons/tab_omega.png");
  },
  
  create: function () {
    game.state.start("menu");
  }
};
