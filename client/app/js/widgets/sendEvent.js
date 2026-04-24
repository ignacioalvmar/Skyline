function sendEventWidget(broker) {
  function render(data) {

      var s = broker.getSocket();

      s.emit("doPublish", data);
  }

  broker.sub("doPublish", render, broker.getChannel());
}

widgets.push({fn: sendEventWidget, channel: "CC"});
widgets.push({fn: sendEventWidget, channel: "HUD"});
widgets.push({fn: sendEventWidget, channel: "IP"});
widgets.push({fn: sendEventWidget, channel: "phone"});
widgets.push({fn: sendEventWidget, channel: "PASS"});
