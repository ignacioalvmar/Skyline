var controllers = {};
function stateControllers(broker) {

  dispatchTimedEvent = function (topic, time, channel, payload) {
    if (pendingTransitionTimeout) {
      clearTimeout(pendingTransitionTimeout);
    }

    pendingTransitionTimeout = setTimeout(function() { broker.pub(topic, payload || {});}, time);
  };

  controllers.state1Controllers(broker);
  controllers.state2Controllers(broker);
  controllers.state3Controllers(broker);
  controllers.state4Controllers(broker);
  controllers.state5Controllers(broker);
  controllers.state6Controllers(broker);
  controllers.state7Controllers(broker);
  controllers.state8Controllers(broker);
  controllers.state9Controllers(broker);

  broker.sub(StateEvents.INIT, function() {
    broker.pub("speech", {text:"Reinitializing scenario.", keepMuted: true}, "CC");
    broker.pub("reinitialize", {}, "HUD");
    broker.pub("reinitialize", {}, "CC");
    broker.pub("reinitialize", {}, "phone");
    broker.pub("reinitialize", {}, "PASS");
    
    
  });
}

widgets.push({fn: stateControllers, channel: "controller"});