(function() {
   var TIMERS = {
    AMBULANCE_CLEAR: 6000//150000,

  }; 
  var controller = controllers.state6Controllers = function(broker) {
    registerHandlers(broker);
    broker.sub(StateEvents.TO_STATE_60, controller.toState60);
    broker.sub(StateEvents.TO_STATE_61, controller.toState61);
    broker.sub(StateEvents.TO_STATE_62, controller.toState62);
    broker.sub(StateEvents.TO_STATE_63, controller.toState63);
  };

  function registerHandlers(broker) {
    controller.toState60 = function toState60(data) {
      // console.log("Transitioning to state 6.0: Notification and Media Mute");
      broker.pub("reinitialize", {
        targets: [1, 5]
      }, "CC");

      broker.pub("notify", {
        quadrant: 4,
        icon: "Icon-Audio-Mute",
        timeoutValue: 7000,
        //nextState: StateEvents.TO_STATE_32,
        clearHUDOnTransition: false,
        classes: "icon-mute"
      }, "CC");

      broker.pub("hud_ambulance", {}, "HUD");


      setTimeout(function() {
        broker.pub("speech", {
          text: "Please clear the roadway for an approaching emergency vehicle.",
          keepMuted: true}, "CC");
      }, 1000);

    };

    controller.toState61 = function toState61(data) {
      broker.pub("pullover_proximity", {proximity: "Close", distance: 100}, "HUD");
    };

    controller.toState62 = function toState62(data) {
      broker.pub("pullover_proximity", {proximity: "Location", distance: 0}, "HUD");
    };
    controller.toState63 = function toState63(data) {
      broker.pub("reinitialize", {}, "HUD");
      broker.pub("reinitialize", {}, "CC");
      var message_details = createHUDNotification(
        [], [], {
          text: "Safe to proceed"
        },
        true
      );
      
      broker.pub("notify", {
        quadrant: 3,
        message_details: message_details
      }, "HUD");   

      setTimeout(function() {
        broker.pub("speech", {
          text: "It is safe to proceed. Take precaution when re-entering the road way."
        }, "CC");
      }, 1000);    

      // dispatchTimedEvent(StateEvents.TO_STATE_33, TIMERS.AMBULANCE_CLEAR, "CC");
    };

  }
})();