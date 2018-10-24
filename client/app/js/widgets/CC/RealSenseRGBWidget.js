/** 
    RealSense Widget for Skyline Platform
    Author: Ignacio Alvarez @ ignacio.j.alvarez@intel.com 
*/

function RealSenseRGBWidget(broker){
	function render(data){
		var containerName = "realSenseRGB";
        var widgetDiv = $("<div id='realSenseRGB'></div>");
        // var parentHeight = $("#" + data.quadrant).height();
        
        $("#" + data.quadrant).empty().html(widgetDiv);
        
        var stage = new Kinetic.Stage({
            container: containerName,
            width: 340,
            height: 200
        });

        stage.add(imageLayer);
        stage.add(framergbLayer);
        framergbText.setText(data.text ? data.text : '');

        imageLayer.drawScene();
        framergbLayer.drawScene();
       
        initRGBStream(data);
	}
	broker.sub("show_rgb_widget", render, "CC");

	var imageLayer = new Kinetic.Layer();
    var framergbLayer = new Kinetic.Layer();
    
    //Frame Text on top of Image
    var framergbText = new Kinetic.Text({
        x: 5,
        y: 2,
        text: '8',
        fontSize: 18,
        fontFamily: 'Lato_Light',
        fill: "#ffff00",
        align: 'left',
        width: 128
    });
    
    //Canvas for image display
    var rgbimage = new Image();
    rgbimage.onload = function(){
        var contImage = new Kinetic.Image({
            x: 0,
            y: 0,
            image: rgbimage,
            // width: 320,
            // height: 120
        });
        imageLayer.add(contImage);      
    };

    framergbLayer.add(framergbText);
    
    function initRGBStream(data){

        socket.emit('subscribe', { name: 'cam/realsense' });
        socket.on('cam/realsense', function(message) {
                var frame = message.text;
                var rgb = message.rgb;
                framergbText.setText("rgb "+frame);
                rgbimage.src = rgb;
                imageLayer.drawScene();
                framergbLayer.drawScene();
            });

    }

    var socket = broker.getSocket();
    socket.on("removeRealSense", function(data) {
        $("#" + data.quadrant).empty();
    });

}
widgets.push({fn: RealSenseRGBWidget, channel: "CC"});