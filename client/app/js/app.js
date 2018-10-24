var widgets = []; // holds all widget definitions
var pendingTransitionTimeout;
var dispatchTimedEvent;


function initPubsub(socket, consoleName) {
  return {
    pub: function broadcast(topic, payload, channel) {
      payload.console = channel;
      console.log("Publishing event: ", topic, payload.console);
      socket.emit("consoleEvent", {eventName: "demo." + topic, message: payload});
    },
    sub: function subscribe(topic, handler, channel) {
      // this way if a widget is trying to subscribe to CC events in the HUD app it won't even go through.
      if (!channel || (channel === consoleName)) {
        var payload = {
          name: "demo." + topic
        };

        if (channel) {
          payload.console = channel;
        }

        socket.emit('subscribe', payload);
        socket.on("demo." + topic, function(data) {
          
          // If this is a state transition event, make sure there isn't another state tranisition waiting on
          // a timeout to fire. This way if you click specifically into some state you won't be redirected
          // by an old timeout when you don't expect to be.
          if (StateEvents.isStateEvent(topic)) {
            if (pendingTransitionTimeout) {
              clearTimeout(pendingTransitionTimeout);
            }
          }

          handler(data);
        });
      }
    },
    getSocket: function() {
      return socket;
    },
    getChannel: function() {
      return consoleName;
    }
  };
}

function clearZone(id) {
  if (!React) { return; }
  if (id === "full") {
    [1, 2, 3, 4, 5, 6, 7].forEach(function(id) {
      React.unmountComponentAtNode(document.getElementById(id));
    });
    $("#full").empty().html('<section class="zone z1" id="1"></section><section class="zone z2" id="2"></section><section class="zone z3" id="3"></section><section class="zone z4" id="4"></section><section class="zone z2-z3" id="5"></section><section class="zone z5" id="6"></section><section class="zone z6" id="7"></section>');
  } else {

    React.unmountComponentAtNode(document.getElementById(id));
    $("#" + id).empty();
    $("#" + id).css('pointer-events', '');
  }
}

var init = function(consoleName) {
  var host = window.location.host;
  console.log("Initializing Console " + consoleName + " from host " + host);
  var mySocket = window.mySocket = io.connect('http://' + host);
  var broker = window.broker = initPubsub(mySocket, consoleName);

  var reverseStateLookup = {};

  _(StateEvents).forEach(function(topic, key) {
    reverseStateLookup[topic] = key;
  });

  StateEvents.isStateEvent = function(topic) {
    return !!reverseStateLookup[topic];
  };

  

  mySocket.on("connect", function() {
    widgets.forEach(function(widget) {
      if (widget.channel === consoleName) {
        widget.fn(broker);
      }
    });

    if (consoleName === "IP") {
      // broker.pub("initSpeedometer", {quadrant: 1}, "IP");
      // broker.pub("showClock", {quadrant: 3}, "IP");
    }
  });



};
