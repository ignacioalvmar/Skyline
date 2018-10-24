/**
* ListenMQTT Widget for Skyline Platform 
* Author: Ignacio Alvarez @ ignacio.j.alvarez@intel.com
*/
function listenMQTTWidget(broker) {
	function render(data) {
    var socket = broker.getSocket();

    socket.emit('subscribe', { name: data.listenTopic });
    socket.on(data.listenTopic, function(message) {   
      socket.emit('subscribe', {name: data.triggerTopic});
      socket.emit('subscribe', { name: "clean" });
      console.log("Client is unsubscribing from TriggerTopic");
    });

	}
	broker.sub("listenMQTT", render, broker.getChannel());

}

widgets.push({fn: listenMQTTWidget, channel: "CC"});
widgets.push({fn: listenMQTTWidget, channel: "PASS"});
widgets.push({fn: listenMQTTWidget, channel: "HUD"});
widgets.push({fn: listenMQTTWidget, channel: "IP"});
widgets.push({fn: listenMQTTWidget, channel: "phone"});

