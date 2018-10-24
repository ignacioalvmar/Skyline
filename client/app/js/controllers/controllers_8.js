(function() {
    var controller = controllers.state8Controllers = function(broker) {
        registerHandlers(broker);

        broker.sub(StateEvents.TO_STATE_80, controller.toState80);
        broker.sub(StateEvents.TO_STATE_80b, controller.toState80b); // this is just to accelerate the timer!
        broker.sub(StateEvents.TO_STATE_81, controller.toState81);
    };

    function registerHandlers(broker) {
        controller.toState80 = function toState80(data) {
            // console.log("Transitioning to state 8.0: Attendee Location and Info", broker.getChannel());
            broker.pub("reinitialize", {}, "CC");
            broker.pub("reinitialize", {}, "HUD");
            broker.pub("reinitialize", {}, "PASS");
            broker.pub("show_dossier", {
                quadrant: 4,
                timeoutValue: 600000
            }, "CC");

            var message_details = createHUDNotification(
                [{
                    url: "Icon-Flag.svg",
                    iconClass: "icon"
                }], [], {
                    text: "Arrived early. Relevant information is available for you."
                }
            );
      var navbarItems = [
        {icon: "/img/bunker/Icon-Nav-Home.svg", itemClass: "icon-home" },
        {icon: "/img/bunker/Icon-Music.svg", itemClass: "icon-media" },
        {icon: "/img/bunker/Icon-missed-calls2.png", itemClass: "icon-phone" },
        {icon: "/img/bunker/Icon-Settings.svg", itemClass: "icon-settings" }
      ];

      broker.pub("show_navbar", {slideOption: "show", navbarItems: navbarItems, quadrant: 6}, "CC");            
            broker.getSocket().emit("consoleEvent", {eventName: "ignition_shutdown"});
             broker.pub("speech", {text: "You have arrived at your destination.", keepMuted: true}, "CC");
            broker.pub("notify", {
                quadrant: 3,
                message_details: message_details
            }, "HUD");
        };

        controller.toState80b = function toState80b(data) {
            // console.log("Transitioning to state 8.0b: Attendee Location and Info (accelerated)");
            broker.pub("reinitialize", {}, "CC");
            broker.pub("show_dossier", {
                quadrant: 4,
                timeoutValue: 60000
            }, "CC");

            var message_details = createHUDNotification(
                [{
                    url: "Icon-Flag.svg",
                    iconClass: "icon"
                }], [], {
                    text: "Arrived early. Relevant information is available for you."
                }
            );

            broker.pub("notify", {
                quadrant: 3,
                message_details: message_details,
            }, "HUD");
        };

        controller.toState81 = function toState81(data) {
            // console.log("Transitioning to state 8.1: Push to Smartphone");
            broker.pub("reinitialize", {}, "CC");
            broker.pub("reinitialize", {}, "HUD");
            broker.pub("show_phone_prompt", {
                quadrant: 4,
                timeoutValue: 60000
            }, "CC");
        };
    }


})();
