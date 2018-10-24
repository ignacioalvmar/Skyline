function sendMQTTWidget(broker) {
  function render(data) {
    
      var s = broker.getSocket();

      s.emit("doSendMQTT", data);
  }

  broker.sub("doSendMQTT", render, broker.getChannel());
}

widgets.push({fn: sendMQTTWidget, channel: "CC"});
widgets.push({fn: sendMQTTWidget, channel: "HUD"});
widgets.push({fn: sendMQTTWidget, channel: "IP"});
widgets.push({fn: sendMQTTWidget, channel: "phone"});
widgets.push({fn: sendMQTTWidget, channel: "PASS"});