(function() {
  var controller = controllers.state5Controllers = function(broker) {
    registerHandlers(broker);
    broker.sub(StateEvents.TO_STATE_50, controller.toState50);
  };

  function registerHandlers(broker) {
    controller.toState50 = function toState50(data) {
      // console.log("Transitioning to state 5.0: Reroute");
      broker.pub("reinitialize", {}, "CC");
       broker.pub("reinitialize", {}, "PASS");
      broker.pub("display_nav_map", {quadrant: 1, route: "choice", zoomOut: true}, "CC");
      broker.pub("show_reroute", {quadrant: 5}, "CC");

      broker.pub("show_hud_route_change", {quadrant: 3}, "HUD");
    };
  }
})();
