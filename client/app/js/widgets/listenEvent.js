/**
* ListenEvent Widget for Skyline Platform
* Author: Ignacio Alvarez @ ignacio.j.alvarez@intel.com
*/
function listenEventWidget(broker) {
	function render(data) {
    var socket = broker.getSocket();

    socket.emit('subscribe', { name: data.listenTopic });
    socket.on(data.listenTopic, function(message) {
      socket.emit('subscribe', {name: data.triggerTopic});
      socket.emit('subscribe', { name: "clean" });
      console.log("Client is unsubscribing from TriggerTopic");
    });

	}
	broker.sub("listenEvent", render, broker.getChannel());

}

widgets.push({fn: listenEventWidget, channel: "CC"});
widgets.push({fn: listenEventWidget, channel: "PASS"});
widgets.push({fn: listenEventWidget, channel: "HUD"});
widgets.push({fn: listenEventWidget, channel: "IP"});
widgets.push({fn: listenEventWidget, channel: "phone"});
