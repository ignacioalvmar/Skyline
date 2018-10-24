(function() {
  var controller = controllers.state9Controllers = function(broker) {
    registerHandlers(broker);

    broker.sub(StateEvents.TO_STATE_90, controller.toState90);
  };

  function registerHandlers(broker) {
    controller.toState90 = function toState90(data) {
      // console.log("Transitioning to state 9.0: Mobile Attendee and Location Info");
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "HUD");
      broker.pub("phone_notification", {quadrant: "full", imageUrl: "Mobile-9.0.png"}, "phone");
    };
  }
})();