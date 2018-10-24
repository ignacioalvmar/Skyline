function ReinitializeWidget(broker) {
  function render(data) {
    var targets = data.targets || ["full"];

    // targets.forEach(function(target) {
    //   clearZone(target);
    // });
    clearZone(data.quadrant);
  }
  broker.sub("reinitialize", render, broker.getChannel());
}

widgets.push({fn: ReinitializeWidget, channel: "CC"});
widgets.push({fn: ReinitializeWidget, channel: "HUD"});
widgets.push({fn: ReinitializeWidget, channel: "IP"});
widgets.push({fn: ReinitializeWidget, channel: "phone"});
widgets.push({fn: ReinitializeWidget, channel: "PASS"});

function ReinitializeAllWidget(broker) {
  function render(data) {
  	
  	broker.pub("reinitialize", {}, "PASS");
  	broker.pub("reinitialize", {}, "CC");
  	broker.pub("reinitialize", {}, "HUD");
  	broker.pub("reinitialize", {}, "phone");
  	broker.pub("reinitialize", {}, "IP");
  }
  broker.sub("reinitialize_all", render, broker.getChannel());
}

widgets.push({fn: ReinitializeAllWidget, channel: "CC"});
widgets.push({fn: ReinitializeAllWidget, channel: "HUD"});
widgets.push({fn: ReinitializeAllWidget, channel: "IP"});
widgets.push({fn: ReinitializeAllWidget, channel: "phone"});
widgets.push({fn: ReinitializeAllWidget, channel: "PASS"});