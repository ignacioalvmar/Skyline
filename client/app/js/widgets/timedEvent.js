function TimedEventWidget(broker) {
  function render(data) {
    
    if (!(data.eventToFire && data.time)) { return; }
    if (isNaN(data.time)) { return; }

    var milliseconds = parseInt(data.time);
    setTimeout(function(){
      var s = broker.getSocket();
      var d = {};
      var da = {
        event_name: data.eventToFire,
        data: d
      };
      s.emit('subscriptionEventFromAdmin',da);
    }, milliseconds);    

  }

  broker.sub("setTimer", render, broker.getChannel());
}

widgets.push({fn: TimedEventWidget, channel: "CC"});
widgets.push({fn: TimedEventWidget, channel: "HUD"});
widgets.push({fn: TimedEventWidget, channel: "IP"});
widgets.push({fn: TimedEventWidget, channel: "phone"});
widgets.push({fn: TimedEventWidget, channel: "PASS"});