/**
    Context Sensing Widget for Skyline Platform
    Author: Victor Palacios @ victor.h.palacios.rivera@intel.com
*/

function ContextSensingWidget(broker)
{
	function render(data)
	{
		var containerName = "contextSense";
	    var widgetDiv = $("<div id='contextSense'></div>");

	    $("#" + data.quadrant).empty().html(widgetDiv);

	    var stage = new Kinetic.Stage({
	        container: containerName,
	        width: 1200,
	        height: 1200
	    });

	    stage.add(textLayer);
	    frameText.setText(data.text ? data.text : '');
		frameText2.setText(data.text ? data.text : '');
	    textLayer.drawScene();

	    initContextSenseStream(data);
	}
	broker.sub("show_contextsense_widget", render, "CC");

	//var pictureLayer = new Kinetic.Layer();
  	var textLayer = new Kinetic.Layer();

    //Frame Text on top of Image
	var frameText = new Kinetic.Text({
	    x: 5,
	    y: 2,
	    text: '7',
	    fontSize: 18,
	    fontFamily: 'Lato_Light',
	    fill: "#ffff00",
	    align: 'left',
	    width: 1200
	});
	var frameText2 = new Kinetic.Text({
	    x: 5,
	    y: 35,
	    text: '7',
	    fontSize: 18,
	    fontFamily: 'Lato_Light',
	    fill: "#ffff00",
	    align: 'left',
	    width: 1200
	});

	textLayer.add(frameText);
	textLayer.add(frameText2);

	function initContextSenseStream(data)
	{
		// TODO: explore subscribing to contextsense/sdk/#
	    socket.emit('subscribe', { name: 'contextsense/sdk/Call' });
		socket.emit('subscribe', { name: 'contextsense/sdk/Battery' });
		socket.emit('subscribe', { name: 'contextsense/sdk/Activity' });
		socket.emit('subscribe', { name: 'contextsense/sdk/Position' });
		socket.emit('subscribe', { name: 'contextsense/sdk/Audio' });


		socket.on('contextsense/sdk/Call', function(message)
		{
			var oldtxt = frameText.getText();
			var t = "Caller: " + message.Caller;
			t += ", NotificationType " + message.NotificationType;
			t += ", ContactInfo " + message.ContactInfo;
			t += ", RingCount " + message.RingCount;
			t += ", MissedCount " + message.MissedCount;
			frameText2.setText(t);
            textLayer.drawScene();
        });
		socket.on('contextsense/sdk/Audio', function(message)
		{
			var t = "AudioType: " + message.AudioType;
			t += ", AudioProbability %" + message.AudioProbability;
			frameText2.setText(t);
            textLayer.drawScene();
        });
		socket.on('contextsense/sdk/Position', function(message)
		{
			var t = "Position: " + message.Position;
			frameText2.setText(t);
            textLayer.drawScene();
        });
		socket.on('contextsense/sdk/Battery', function(message)
		{
			//TODO
        });
		socket.on('contextsense/sdk/Activity', function(message)
		{
			var t = "Activity: " + message.Activity;
			t += ", ActivityProbability %" + message.ActivityProbability;
			frameText.setText(t);
            textLayer.drawScene();
        });
	}

    var socket = broker.getSocket();
    socket.on("removeContextSense", function(data) {
        $("#" + data.quadrant).empty();
    });

}
widgets.push({fn: ContextSensingWidget, channel: "CC"});
