function DistanceWidget(broker) {
    function render(data) {
        
        var containerName = "tripDistance";
        var widgetDiv = $("<div id='tripDistance'></div>");
        var parentHeight = $("#" + data.quadrant).height();
        
        $("#" + data.quadrant).empty().html(widgetDiv);
        widgetDiv.css("padding-top", ((parentHeight - 256) / 2));
        
        var stage = new Kinetic.Stage({
            container: containerName,
            width: 256,
            height: 256
        });

        stage.add(headerLayer);
        numberText.setText(data.distance ? data.distance : '');
        headerLayer.drawScene();

        initTimeToDestination(data);
    }
     broker.sub("showTripDistance", render, "IP");

    var headerLayer = new Kinetic.Layer();
    
    var infoText = new Kinetic.Text({
        x: 0,
        y: 202,
        text: 'TO DESTINATION',
        fontSize: 30,
        fontFamily: 'Lato_Black',
        fill: 'white',
        align: 'center',
        width: 256
    });

    var numberText = new Kinetic.Text({
        x: 0,
        y: 84,
        text: '8',
        fontSize: 84,
        fontFamily: 'Lato_Light',
        fill: "#36C2F0",
        align: 'center',
        width: 128
    });

    var mileText = new Kinetic.Text({
        x: 120,
        y: 84,
        text: 'MI',
        fontSize: 84,
        fontFamily: 'Lato_Light',
        fill: 'white',
        width: 128,
        align: 'center'
    });

    headerLayer.add(numberText);
    headerLayer.add(mileText);
    headerLayer.add(infoText);



    function initTimeToDestination(data){
        socket.emit('subscribe', { name: 'car/telemetry' });

        socket.on('car/telemetry', function(message) {
            var miles = message.progress.remainingMiles/1;
            var milesRounded = miles > 1 ? Math.floor(miles) : miles;
            numberText.setText(miles);
            headerLayer.drawScene();
        });
    }
    var socket = broker.getSocket();
    socket.on("removeTripDistance", function(data) {
        $("#" + data.quadrant).empty();
    });
    
}
widgets.push({fn: DistanceWidget, channel: "IP"});