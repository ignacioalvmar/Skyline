/** 
    RealSense Widget for Skyline Platform
    Author: Ignacio Alvarez @ ignacio.j.alvarez@intel.com 
*/

function RealSenseDepthWidget(broker){
	function render(data){
		var containerName = "realSenseDepth";
        var widgetDiv = $("<div id='realSenseDepth'></div>");
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

        pictureLayer.drawScene();
        textLayer.drawScene();
       
        initDepthStream(data);
	}
	broker.sub("show_depth_widget", render, "CC");

	var pictureLayer = new Kinetic.Layer();
    var textLayer = new Kinetic.Layer();

    //Frame Text on top of Image
    var frameText = new Kinetic.Text({
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
    var camimage = new Image();
    camimage.onload = function(){
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
   
    function initDepthStream(data){

        socket.emit('subscribe', { name: 'cam/realsense' });
        socket.on('cam/realsense', function(message) {
                var frame = message.text;
                // var rgb = message.rgb;
                var depth = message.depth;
                frameText.setText(frame);
                camimage.src = depth;
                pictureLayer.drawScene();
                textLayer.drawScene();
            });

    }

    var socket = broker.getSocket();
    socket.on("removeRealSense", function(data) {
        $("#" + data.quadrant).empty();
    });

}
widgets.push({fn: RealSenseDepthWidget, channel: "CC"});