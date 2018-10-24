/**
    AppMon Widget for Skyline Platform
    Author: Victor Palacios @ victor.h.palacios.rivera@intel.com
*/

function AppMonWidget(broker)
{
	function render(data)
	{
		var containerName = "appMon";
	    var widgetDiv = $("<div id='appMon'></div>");
	    // var parentHeight = $("#" + data.quadrant).height();

	    $("#" + data.quadrant).empty().html(widgetDiv);

	    var stage = new Kinetic.Stage({
	        container: containerName,
	        width: 700,
	        height: 500
	    });

	    stage.add(pictureLayer);
	    stage.add(textLayer);
	    frameText.setText(data.text ? data.text : '');
		frameText2.setText(data.text ? data.text : '');

	    pictureLayer.drawScene();
	    textLayer.drawScene();

	    initAppMonStream(data);
	}

	broker.sub("show_appmon_widget", render, "CC");

	var pictureLayer = new Kinetic.Layer();
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
	    width: 200
	});
	var frameText2 = new Kinetic.Text({
	    x: 5,
	    y: 25,
	    text: '7',
	    fontSize: 18,
	    fontFamily: 'Lato_Light',
	    fill: "#ffff00",
	    align: 'left',
	    width: 500
	});

	//Canvas for image display
	var camimage = new Image();
	camimage.onload = function()
	{
	    var contImage = new Kinetic.Image({
	        x: 0,
	        y: 0,
	        image: camimage,
	        // width: 320,
	        // height: 120
	    });
	    pictureLayer.add(contImage);
	};

	textLayer.add(frameText);
	textLayer.add(frameText2);

	function initAppMonStream(data)
	{
	    socket.emit('subscribe', { name: 'contextsense/appmon/BATTERY_CHARGE' });
		socket.emit('subscribe', { name: 'contextsense/appmon/WIFIRADIO' });
	    socket.on('contextsense/appmon/BATTERY_CHARGE', function(message)
		{
			frameText.setText("Phone charging: " + message.isCharging);
            textLayer.drawScene();
        });
		socket.on('contextsense/appmon/WIFIRADIO', function(message)
		{
			var a_ssid = message["Available SSIDs"];
			var rssi = message["RSSI"];
			var link = message["Link Speed"];
			var c_ssid = message["Connected SSID"];
			frameText2.setText("Connected SSID: " + c_ssid + "\nRSSI:"+ rssi+ "\nlink:" + link+"\nAvailable SSIDs:" + a_ssid);
            textLayer.drawScene();
        });
	}

    var socket = broker.getSocket();
    socket.on("removeAppMon", function(data) {
        $("#" + data.quadrant).empty();
    });

}
widgets.push({fn: AppMonWidget, channel: "CC"});
