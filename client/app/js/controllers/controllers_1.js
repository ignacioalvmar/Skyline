/**
  A note on the organization of these controllers:
    1) There are 9 controller files, each one for one high-level state within the demo.
    2) Each controller function is defined as a member of the global "controllers" object.
    3) Within the self-execution function that wraps the controller function, it's aliased to the variable 'controller'
    4) The controller object also gets field for transition functions (toStateXX) - these are kept as pure functions
        to make it easier to test them, rather than including them within the lexical scope of the controller function,
        though I cheated and put 'sock' into the local scope of this closure.

    5) The workflow here is: the main controller function listens to state transition events on the socket. Each of these
        events gets bound to a transition function as a handler, and specific instructions to the various widgets are
        dispatched as events from within these these handlers.

    This provides a degree of indirection - the widgets aren't directly responding to events generated by Unity or
    by the utility application that steps the demo through its various states. Instead, those events are captured
    by these controllers and then interpreted in whatever way makes the most sense.

    The basic idea will be that these transition functions dispatch specific events which are then consumed by the
    widgets in the application. Since the widgets are basically simple React functions that draw templates to the screen,
    these transition functions should generally include all data that needs to be injected into the react templates.
*/

(function() {
  var controller = controllers.state1Controllers = function(broker) {
    registerHandlers(broker);
    broker.sub(StateEvents.TO_STATE_10, controller.toState10);
    broker.sub(StateEvents.TO_STATE_11, controller.toState11);
    broker.sub(StateEvents.TO_STATE_12, controller.toState12);
    broker.sub(StateEvents.TO_STATE_13, controller.toState13);
  };

  function registerHandlers(broker) {
    controller.toState10 = function toState10(data) {
       console.log("Transitioning to state 1.0: Mobile Notification");
      broker.pub("phone_notification", {quadrant: "full", imageUrl: "Mobile-1.0-revised.png", nextState: "11"}, "phone");
    };

    controller.toState11 = function toState11(data) {
      // console.log("Transitioning to state 1.1: Mobile App Settings");
      broker.pub("phone_notification", {quadrant: "full", imageUrl: "Mobile-1.2.png", nextState: "12"}, "phone");
    };
    controller.toState12 = function toState12(data) {
      // console.log("Transitioning to state 1.1: Mobile App Settings");
      broker.pub("phone_notification", {quadrant: "full", imageUrl: "Mobile-1.3.png", nextState: "13"}, "phone");
    };
    controller.toState13 = function toState13(data) {
      // console.log("Transitioning to state 1.1: Mobile App Settings");
      broker.pub("phone_notification", {quadrant: "full", imageUrl: "Mobile-1.4.png", nextState: "clear"}, "phone");
    };        
  }
})();