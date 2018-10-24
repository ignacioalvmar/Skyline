(function() {
  var controller = controllers.state3Controllers = function(broker) {
    registerHandlers(broker);

    broker.sub(StateEvents.TO_STATE_30, controller.toState30);
    broker.sub(StateEvents.TO_STATE_31, controller.toState31);
    broker.sub(StateEvents.TO_STATE_32, controller.toState32);
    broker.sub(StateEvents.TO_STATE_33, controller.toState33);
  };

  function registerHandlers(broker) {
    controller.toState30 = function toState30(data) {


      // console.log("Transitioning to state 3.0: Navigation");
      
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");

      broker.pub("display_nav_map", {
        quadrant: 1,
        route: "favorite"
      }, "CC");

      setTimeout(function() {
        console.log("Zooming out!");
        broker.pub("zoom_out", {
          duration: 8000
        }, "CC");
      }, 100);

      broker.pub("show_route", {
        quadrant: 5,
        icon: "Icon-Circle-Heart",
        route_name: "Favorite Route",
        expected_time: "14",
        eco_level: "8"
      }, "CC");

      var message_details = createHUDNotification(
        [{
          url: "Icon-Flag.svg",
          iconClass: "icon"
        }], [{
          url: "avatar-passenger.jpg",
          iconClass: "avatar"
        }, {
          url: "Icon-Privacy.svg",
          iconClass: "icon-privacy"
        }], {
          text: "Navigation route queued up and ready to go."
        },
        true
      );
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("notify", {
        quadrant: 3,
        message_details: message_details
      }, "HUD");
      broker.pub("speech", {
        text: "I have selected the optimal route to our destination."
      }, "CC");
    };

    controller.toState31 = function toState31(data) {
      // console.log("Transitioning to state 3.1: Shared Media");
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      broker.pub("fade_audio_out", {}, "CC");
       
      broker.pub("show_spotify", {
        quadrant: 4,
        timeoutValue: 30000
      }, "CC");

      // var message_details = createHUDNotification(
      //   [{
      //     url: "Icon-Traffic-Light.svg",
      //     iconClass: "icon"
      //   }], [{
      //     url: "avatar-passenger.jpg",
      //     iconClass: "avatar"
      //   }, {
      //     url: "Icon-Privacy.svg",
      //     iconClass: "icon-privacy"
      //   }], {
      //     text: "Green light in: 0:38"
      //   },
      //   true
      // );
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS"); 
      // broker.pub("notify", {
      //   quadrant: 3,
      //   message_details: message_details
      // }, "HUD");
    };

    controller.toState32 = function toState32(data) {
      // console.log("Transitioning to state 3.2: Shared Media 2");
      if (data.purgeHUD) {
        broker.pub("reinitialize", {}, "HUD");
      }
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");

      broker.pub("display_nav_map", {
        quadrant: 1
      }, "CC");

      broker.pub("play_spotify", {
        quadrant: 5
      }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS");
      broker.pub("fade_audio_in", {}, "CC");

      var message_details = createHUDNotification(
        [],
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Privacy.svg", iconClass:"icon-privacy"}],
        {},
        true
      );

      broker.pub("notify", {
        quadrant: 3,
        message_details: message_details
      }, "HUD");

    };
    controller.toState33 = function toState33(data) {
      console.log("Transitioning to state 3.2: Shared Media 2");
      if (data.purgeHUD) {
        broker.pub("reinitialize", {}, "HUD");
      }
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");

      broker.pub("display_nav_map", {
        quadrant: 1
      }, "CC");

      broker.pub("play_spotify", {
        quadrant: 5
      }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      //broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS");
      broker.pub("fade_audio_in", {}, "CC");

      // var message_details = createHUDNotification(
      //   [],
      //   [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Privacy.svg", iconClass:"icon-privacy"}],
      //   {},
      //   true
      // );

      // broker.pub("notify", {
      //   quadrant: 3,
      //   message_details: message_details
      // }, "HUD");

    };    
  }

})();
