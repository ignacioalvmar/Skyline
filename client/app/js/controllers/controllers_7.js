(function() {

  var TIMERS = {
    CONFIRMATION_DURATION: 5000,
    HANGUP_DURATION: 2000

  };

  var controller = controllers.state7Controllers = function(broker) {
    registerHandlers(broker);

    broker.sub(StateEvents.TO_STATE_70, controller.toState70);
    broker.sub(StateEvents.TO_STATE_70b, controller.toState70b);
    broker.sub(StateEvents.TO_STATE_71, controller.toState71);
    broker.sub(StateEvents.TO_STATE_72, controller.toState72);
    broker.sub(StateEvents.TO_STATE_73a, controller.toState73a);    
    broker.sub(StateEvents.TO_STATE_73, controller.toState73);
    broker.sub(StateEvents.TO_STATE_74, controller.toState74);
    broker.sub(StateEvents.TO_STATE_75, controller.toState75);
    broker.sub(StateEvents.TO_STATE_76, controller.toState76);

  };

  function registerHandlers(broker) {
    controller.toState70 = function toState70(data) {
      // console.log("Transitioning to state 7.0: Incoming Call");
      broker.pub("reinitialize", {}, "CC");
      broker.pub("display_nav_map", {
                quadrant: 1,
                mapFolder: "MSF-taxi"
            }, "CC");

            broker.pub("play_spotify", {
                quadrant: 5
            }, "CC");

      var message_details = createHUDNotification(
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Phone.svg", iconClass: "icon-calling"}],
        [],
        {text: "Bree (503-456-7890)"}
      );
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");
      broker.pub("speech", {text: "Incoming call from Bree", keepMuted: true}, "CC");
    };

    controller.toState70b = function toState70b(data) {
      // console.log("Transitioning to state 7.0b: Answered phone");
      broker.pub("reinitialize", {}, "HUD");

      var message_details = createHUDNotification(
          [], [{
              url: "/img/bunker/avatar-passenger.jpg",
              iconClass: "avatar"
          },
          {url: "Icon-Phone-revised.png", iconClass: "icon-calling"},
           {
              url: "Icon-Listening.gif",
              iconClass: "icon-listening"
            // isVideo: true,
            // iconClass: "icon-listening",
            // url: "Icon-Listening.mp4"
          }], {
              text: ""
          },
          true
      );

      broker.pub("notify", {
          quadrant: 3,
          message_details: message_details
      }, "HUD");

      var speechText = "We need to reschedule Claire’s dance lesson. We have Wednesday and Thursday open.";
      broker.pub("speech", {text: speechText, voice: 2, nextState: StateEvents.TO_STATE_71, nextStateDelay: 2000, keepMuted: true}, "CC");
    };

    controller.toState71 = function toState71(data) {
      // console.log("Transitioning to state 7.1: Calendar Recommendation");
      broker.pub("calendar_event", {quadrant: 2, showLastWeek: true, day: "Wednesday", time: "3:00 p.m.", place_name: "Dance Studio", address: "200 B St",
        message: {
          icon: "Icon-Navigation-Arrow.svg",
          messageClass: "proximity",
          isEmphasized: true,
          text: "Close proximity"
        }
      }, "HUD");
    };

    controller.toState72 = function toState72(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
      broker.pub("calendar_event", {quadrant: 2, showLastWeek:false, day: "Wednesday", time: "3:00 p.m.", place_name: "Dance Studio", address: "200 B St",
        message: {
          icon: "Icon-Check.svg",
          messageClass: "event-success",
          isEmphasized: true,
          text: "Event successfully moved!"
        }
      }, "HUD");

      dispatchTimedEvent(StateEvents.TO_STATE_32, TIMERS.CONFIRMATION_DURATION, "CC", {purgeHUD: true});
    };

    controller.toState73a = function toState73a(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
     
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("play_incoming_call_conversation", {quadrant: 5}, "CC");
      broker.pub("show_hud_dinner_first", {quadrant: 3}, "HUD");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");

      //dispatchTimedEvent(StateEvents.TO_STATE_32, TIMERS.CONFIRMATION_DURATION, "CC", {purgeHUD: true});
    };

    controller.toState73 = function toState73(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
     
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("show_dinner_step_one", {quadrant: 1}, "CC");
      broker.pub("show_hud_dinner_second", {quadrant: 3}, "HUD");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");

      //dispatchTimedEvent(StateEvents.TO_STATE_32, TIMERS.CONFIRMATION_DURATION, "CC", {purgeHUD: true});
    };

    controller.toState74 = function toState74(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
     
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("show_dinner_step_two", {quadrant: 1}, "CC");
      broker.pub("show_hud_dinner_third", {quadrant: 3}, "HUD");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      //dispatchTimedEvent(StateEvents.TO_STATE_32, TIMERS.CONFIRMATION_DURATION, "CC", {purgeHUD: true});
    };

    controller.toState75 = function toState75(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
     
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("show_dinner_step_three", {quadrant: 1}, "CC");
      broker.pub("show_hud_dinner_fourth", {quadrant: 3}, "HUD");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");


      //dispatchTimedEvent(StateEvents.TO_STATE_32, TIMERS.CONFIRMATION_DURATION, "CC", {purgeHUD: true});
    };
    controller.toState76 = function toState76(data) {
      // console.log("Transitioning to state 7.2: Confirmation");
      broker.pub("reinitialize", {}, "HUD");
     
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("show_hud_dinner_fifth", {quadrant: 3}, "HUD");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");      
      //broker.pub(StateEvents.TO_STATE_33, {purgeHUD: true}); 


      dispatchTimedEvent(StateEvents.TO_STATE_33, TIMERS.HANGUP_DURATION);
    };
       

  }
})();
