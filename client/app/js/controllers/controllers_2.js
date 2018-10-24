(function() {
  var TIMERS = {
    PASSENGER_COMFORT: 6000,//150000,
    SEAT_ANIMATION: 5000,
    SHOW_BEACON: 4000,
    SHOW_HOUSE_MAP: 5000
  };


  var controller = controllers.state2Controllers = function(broker) {
    registerHandlers(broker);

    broker.sub(StateEvents.TO_STATE_20, controller.toState20);
    broker.sub(StateEvents.TO_STATE_21, controller.toState21);
    broker.sub(StateEvents.TO_STATE_22, controller.toState22);
    broker.sub(StateEvents.TO_STATE_23, controller.toState23);
    broker.sub(StateEvents.TO_STATE_24, controller.toState24);
    broker.sub(StateEvents.TO_STATE_241, controller.toState241);
    broker.sub(StateEvents.TO_STATE_25, controller.toState25);
    broker.sub(StateEvents.TO_STATE_26aa, controller.toState26aa);      
    broker.sub(StateEvents.TO_STATE_26a, controller.toState26a);    
    broker.sub(StateEvents.TO_STATE_26, controller.toState26);
    broker.sub(StateEvents.TO_STATE_27, controller.toState27);
    broker.sub(StateEvents.TO_STATE_28, controller.toState28);
    broker.sub(StateEvents.TO_STATE_29, controller.toState29);

  };

  function registerHandlers(broker) {
    controller.toState20 = function toState20(data) {
      // console.log("Transitioning to state 2.0: Driver Authentication/Comfort");

      var users = [
        {role: "driver", temp: 70, seat: true}
      ];
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "phone");
      broker.pub("reinitialize", {}, "PASS");
     

      broker.pub("reinitialize", {}, "HUD");
  

      broker.pub("show_authenticated_user", {quadrant: 5, users:users}, "CC");
      broker.pub("show_loading_circle", {quadrant: 1}, "CC");
      var navbarItems = [
        {icon: "/img/bunker/Icon-Nav-Home.svg", itemClass: "icon-home" },
        {icon: "/img/bunker/Icon-Music.svg", itemClass: "icon-media" },
        {icon: "/img/bunker/Icon-Mobile-Phone.svg", itemClass: "icon-phone" },
        {icon: "/img/bunker/Icon-Settings.svg", itemClass: "icon-settings" }
      ];

      broker.pub("show_navbar", {slideOption: "show", navbarItems: navbarItems, quadrant: 6}, "CC");
      broker.pub("speech", {text: "Welcome, Driver. Your comfort preferences have been set."}, "CC");
    };

   controller.toState21 = function toState21(data) {
      // console.log("Transitioning to state 2.1: Passenger Authentication/Comfort");
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: true},
        {role: "passenger", temp: 68, key: "passenger", temperature_countdown: TIMERS.PASSENGER_COMFORT, animateSeat: true, seat:true}
      ];
      
      var navbarItems = [
        {icon: "/img/bunker/Icon-Nav-Home.svg", itemClass: "icon-home" },
        {icon: "/img/bunker/Icon-Music.svg", itemClass: "icon-media" },
        {icon: "/img/bunker/Icon-Mobile-Phone.svg", itemClass: "icon-phone" },
        {icon: "/img/bunker/Icon-Settings.svg", itemClass: "icon-settings" }
      ];

      broker.pub("show_navbar", {slideOption: "none", navbarItems: navbarItems, quadrant: 6}, "CC");
      broker.pub("show_passenger_welcome", {quadrant: 1}, "PASS");
      //broker.pub("show_passenger_reservations_initial", {quadrant: 1}, "PASS");
      broker.pub("show_initial_map", {quadrant: 1}, "CC");
      broker.pub("show_authenticated_user", {quadrant: 5, users: users, animation_duration: TIMERS.SEAT_ANIMATION}, "CC");
      broker.pub("speech", {text: "Welcome back passenger. Please take a minute to review your sharing settings."}, "CC");

      var message_details = createHUDNotification(
        [{url: 'avatar-passenger.jpg', iconClass: 'avatar'}],
        [
            {url: 'avatar-driver.jpg', iconClass: 'avatar'},
            {url: 'Icon-Privacy.svg', iconClass: ''},
            {url: 'Icon-Music-Library.svg', iconClass: ''},
            {url: 'Icon-Address-Book.svg', iconClass: ''},
            {url: 'Icon-Location.svg', iconClass: ''},
            {url: 'Icon-Calendar.svg', iconClass: 'de-emphasized'}

        ],
        {
          text: '"Passenger" authenticated.',
          icons: [
            {url:"Icon-Music-Library.svg"},
            {url:"Icon-Address-Book.svg"},
            {url:"Icon-Location.svg"}
          ]
        }
      );




      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");
      //dispatchTimedEvent(StateEvents.TO_STATE_22, TIMERS.SHOW_BEACON, "PASS");
    };

    controller.toState22 = function toState22(data) {
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
      var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];
      // console.log("Transitioning to state 2.2: Item Checklist");
      var driverItems = [
        {icon: "Icon-Beacon-Wallet", itemClasses: "icon-lg", copy: "Locating..."}
      ];

      var passengerItems = [
        {icon: "Icon-Sunglasses", itemClasses: "icon-sunglasses" },
        {icon: "Icon-Medicine", itemClasses: "" }
      ];
      var passengerSharing = [
        {icon: "Icon-Music-Library", itemClasses: "" },
        {icon: "Icon-Address-Book", itemClasses: "" },
        {icon: "Icon-Location", itemClasses: "" }
      ];
      var passengerConnectedDevices = [
        {icon: "avatar-passenger", itemClasses: "avatar", itemType: "jpg" },
        {icon: "Icon-Mobile-Phone-Check", itemClasses: "mobile-phone", itemType: "svg" }
      ];      
      
     
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_important_items", {quadrant: 1, items: driverItems, showRain: true}, "CC");
      broker.pub("show_authenticated_user", {quadrant: 5, users: users}, "CC");
      broker.pub("show_passenger_items", {quadrant:1, items: passengerItems, connected: passengerConnectedDevices, sharing: passengerSharing, temp: passTemp}, "PASS");
      //broker.pub("show_passenger_reservations_secondary", {quadrant: 1}, "PASS");
      var message_details = createHUDNotification(
        [{url: "Icon-Beacon-Wallet.svg", iconClass:"icon-beacon-wallet"}],
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Privacy.svg", iconClass:"icon-privacy"}],
        {text: "Reminder!"},
        true
      );

      
      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");// automatically progress to 2.3:

      broker.pub("speech", {text: "Driver, I have noticed your wallet is missing. I am locating and activating its beacon for you. Also Bree, today is a sunny day don't forget your sunglasses and allergy medication."}, "CC");
      //dispatchTimedEvent(StateEvents.TO_STATE_23, TIMERS.SHOW_BEACON, "CC");
    };

    controller.toState23 = function toState23(data) {
      // console.log("Transitioning to state 2.3: Missing Item Beacon", broker.getChannel());
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
      var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];
     
      var driverItems = [
        {icon: "Floorplan", itemClasses: "floor-plan", copy: ""}
      ];      
      var passengerItems = [
        {icon: "Icon-Sunglasses", itemClasses: "icon-sunglasses" },
        {icon: "Icon-Medicine", itemClasses: "" }
      ];
      var passengerSharing = [
        {icon: "Icon-Music-Library", itemClasses: "" },
        {icon: "Icon-Address-Book", itemClasses: "" },
        {icon: "Icon-Location", itemClasses: "" }
      ];
      var passengerConnectedDevices = [
        {icon: "avatar-passenger", itemClasses: "avatar", itemType: "jpg" },
        {icon: "Icon-Mobile-Phone-Check", itemClasses: "mobile-phone", itemType: "svg" }
      ];      
     
      broker.pub("show_important_items", {quadrant: 1, items: driverItems, showRain: false}, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_authenticated_user", {quadrant: 5, users: users}, "CC");    
      broker.pub("show_passenger_items", {quadrant:1, items: passengerItems, connected: passengerConnectedDevices, sharing: passengerSharing, temp: passTemp}, "PASS");


      var message_details = createHUDNotification(
        [{url: "Icon-Beacon.svg", iconClass:"icon-beacon-wallet"}],
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Privacy.svg", iconClass:"icon-privacy"}],
        {text: "Beacon Activated!"},
        true
      );

 
      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");


      //dispatchTimedEvent(StateEvents.TO_STATE_24, TIMERS.SHOW_HOUSE_MAP, "CC");

    };

    controller.toState24 = function toState24(data) {
      // console.log("Transitioning to state 2.4: Missing Iteam Beacon Map");
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      

      

      var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
    broker.pub("show_authenticated_user", {quadrant: 5, users: users}, "CC"); 
    //broker.pub("show_passenger_map", {quadrant: 1}, "CC");
    broker.pub("show_initial_map", {quadrant: 1}, "CC");  
    broker.pub("show_passenger_destination", {quadrant:1 }, "PASS");


    };

    controller.toState241 = function toState241(data) {
      // console.log("Transitioning to state 2.4: Missing Iteam Beacon Map");


    broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
    

      var message_details = createHUDNotification(
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}],
        [],
        {text: "New stop added"},
        true
      );




      
      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");
    };    

    controller.toState25 = function toState25(data) {
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
       console.log("Transitioning to state 2.5: Start Car");
             var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
     broker.pub("show_authenticated_user", {quadrant: 5, users: users}, "CC"); 
    broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
    broker.pub("show_start_car", {quadrant: 7}, "CC");  
    broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS"); 
      var message_details = createHUDNotification(
        [],
        [{url: "avatar-passenger.jpg", iconClass:"avatar"}, {url: "Icon-Privacy.svg", iconClass:"icon-privacy"}],
        {},
        true
      );

      broker.pub("notify", {quadrant: 3, message_details: message_details}, "HUD");

    };  
    controller.toState26aa = function toState26aa(data) {
      //begin the recorded conversation
      broker.pub("fade_audio_out",{keepMuted: true, quadrant: 5} , "CC");
      broker.pub("play_in_car_conversation",{quadrant: 5} , "CC");
      


    };        
    controller.toState26a = function toState26a(data) {
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
       console.log("Transitioning to state 2.6: Dinner step one");
             var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];

    
      broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
     
      // broker.pub("play_spotify", {
      //   quadrant: 5
      // }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS");
      broker.pub("show_passenger_reservations_listening", {quadrant: 1}, "PASS");
      broker.pub("show_hud_listening", {quadrant: 3}, "HUD");


    };      
    controller.toState26 = function toState26(data) {
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
       console.log("Transitioning to state 2.6: Dinner step one");
             var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];

    
    broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
   
      // broker.pub("play_spotify", {
      //   quadrant: 5
      // }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_passenger_authentication", {quadrant: 1}, "PASS");
      broker.pub("show_passenger_reservations_initial", {quadrant: 1}, "PASS");
      broker.pub("show_hud_listening", {quadrant: 3}, "HUD");

    };  
    controller.toState27 = function toState27(data) {
      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
      console.log("Transitioning to state 2.7: Dinner step two");
      var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];

      broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
   
      // broker.pub("play_spotify", {
      //   quadrant: 5
      // }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC"); 
      broker.pub("show_passenger_reservations_secondary", {quadrant: 1}, "PASS");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_hud_listening", {quadrant: 3}, "HUD");

    };   
    controller.toState28 = function toState28(data) {

      broker.pub("reinitialize", {}, "CC");
      broker.pub("reinitialize", {}, "PASS");
      broker.pub("reinitialize", {}, "HUD");
      
      console.log("Transitioning to state 2.8: Dinner step three");
      var passTemp = 68;
      var users = [
        {role: "driver", temp: 70, key: "driver", seat: false},
        {role: "passenger", temp: passTemp, key: "passenger", seat: false}
      ];
      broker.pub("show_passenger_map", {quadrant: 1}, "CC");  
   
      // broker.pub("play_spotify", {
      //   quadrant: 5
      // }, "CC");
      broker.pub("show_navbar", {slideOption: "none", quadrant: 6}, "CC");
      broker.pub("show_passenger_reservations_tertiary", {quadrant: 1}, "PASS");
      broker.pub("show_hud_listening", {quadrant: 3}, "HUD");

    }; 
    controller.toState29 = function toState29(data) {
      broker.pub("fade_conversation_out",{keepMuted: true, quadrant: 5} , "CC");
      broker.pub(StateEvents.TO_STATE_32, {purgeHUD: true});
    };                 
  }
})();