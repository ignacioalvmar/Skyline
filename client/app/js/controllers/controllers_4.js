(function() {
    var controller = controllers.state4Controllers = function(broker) {
        registerHandlers(broker);

        broker.sub(StateEvents.TO_STATE_40, controller.toState40);
        broker.sub(StateEvents.TO_STATE_41, controller.toState41);
        broker.sub(StateEvents.TO_STATE_42, controller.toState42);
    };

    function registerHandlers(broker) {
        controller.toState40 = function toState40(data) {
            // console.log("Transitioning to state 4.0: Privacy/Media Settings");
            broker.pub("reinitialize", {}, "CC");
            broker.pub("reinitialize", {}, "PASS");
            broker.pub("reinitialize", {}, "HUD");
            broker.pub("speech", {text: "Privacy settings disabled."}, "CC");
            broker.pub("display_nav_map", {
                quadrant: 1
            }, "CC");

            broker.pub("play_spotify", {
                quadrant: 5
            }, "CC");
            broker.pub("show_passenger_dropoff", {
                quadrant: 1
            }, "PASS");    
            broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");   
            
        };
        controller.toState41 = function toState41(data) {
            // console.log("Transitioning to state 4.0: Privacy/Media Settings");
            broker.pub("reinitialize", {}, "CC");
            broker.pub("reinitialize", {}, "PASS");
            broker.pub("reinitialize", {}, "HUD");
            
            broker.pub("show_phone_battery", {
                quadrant: 4
            }, "CC");

          var message_details = createHUDNotification(
            [{
              url: "Icon-Mobile-Phone-Low-Battery.svg",
              iconClass: "icon-common"
            }], [], {
              text: "Low Battery"
            },
            true
          );
          
          broker.pub("notify", {
            quadrant: 3,
            message_details: message_details
          }, "HUD");         
            
        };   
        controller.toState42 = function toState42(data) {
            // console.log("Transitioning to state 4.0: Privacy/Media Settings");
            broker.pub("reinitialize", {}, "CC");
            broker.pub("reinitialize", {}, "PASS");
            broker.pub("reinitialize", {}, "HUD");
            broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
            broker.pub("show_media_settings", {
                quadrant: 4,
                timeoutValue: 100000
            }, "CC");

          var message_details = createHUDNotification(
            [{
              url: "Icon-Podcast.svg",
              iconClass: "icon-common"
            }], [], {
              text: "Change media? Podcast: Serial."
            },
            true
          );
          
          broker.pub("notify", {
            quadrant: 3,
            message_details: message_details
          }, "HUD"); 
      };

    }
})();
