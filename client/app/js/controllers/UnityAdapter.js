/*
  Certain events from the unity runtime are broadcast signifying state transitions, but those events
  are not broadcast into our "demo" namespace. This adapter listens to those events and rebroadcasts them
  into their proper namespaced counterparts.
*/

function UnityAdapter(broker) {
  var socket = broker.getSocket();
  socket.emit('subscribe', {name: "scenario/event"});

  var adapter = {
    "to3.1": StateEvents.TO_STATE_31,
    "to4.0": StateEvents.TO_STATE_40,
    "to5.0": StateEvents.TO_STATE_50,
    "to6.0": StateEvents.TO_STATE_60,
    "to6.1": StateEvents.TO_STATE_61,
    "to6.2": StateEvents.TO_STATE_62,
    "to7.0": StateEvents.TO_STATE_70,
    "to8.0": StateEvents.TO_STATE_80,
    "phoneButton": StateEvents.PHONE_BUTTON,
    "ambulance_passed": StateEvents.TO_STATE_33
  };

  socket.on("scenario/event", function(data) {
    console.log("Scenario event from unity: ", data);
    var payload = {};
    var rebroadcast = adapter[data.id];
    if (rebroadcast) {
      if (data.id === "ambulance_passed") {
        console.log("That ambulance past, and you should never see this again.");
        delete adapter["ambulance_passed"];
        payload.purgeHUD = true;
      }

      if (data.id === "phoneButton") {
        console.log("PHONE BUTTON PRESSED!");
      }

      broker.pub(rebroadcast, payload);
    }
  });
}

widgets.push({fn: UnityAdapter, channel: "controller"});