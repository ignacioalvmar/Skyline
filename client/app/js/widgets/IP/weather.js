function WeatherWidget(broker) {
    function render(data) {
        console.log("data");
        console.log(data);
        var containerName = "weather";
        var parentHeight = $("#" + data.quadrant).height();
        var widgetDiv = $("<div id='clock'></div>");
        $("#" + data.quadrant).empty().html(widgetDiv);

        // widgetDiv.css("padding-top", ((parentHeight - 256) / 2));
        widgetDiv.css("padding-top", ((parentHeight - 300) / 2));
        $("#" + data.quadrant).empty().html("<div id='weather'></div>");

        var stageHeight = 341;
        var stageWidth = 455;

        var stage = new Kinetic.Stage({
            container: containerName,
            width: stageWidth,
            height: stageHeight
        });

        //Layer for our background
        var background_layer = new Kinetic.Layer();
        stage.add(background_layer);

        var degreeText = new Kinetic.Text({
            x: 210,
            y: 128,
            text: data.temperature ? data.temperature + '\xB0' : "",
            fontSize: 84,
            fontFamily: 'Lato_Light',
            fill: '#ffffff'
        });


        var messageText = new Kinetic.Text({
            x: stageWidth /2,
            y: stageHeight - 96,
            text: data.message ? data.message : "",
            fontSize: 30,
            fontFamily: 'Lato_Black',
            fill: '#ffffff'
        });

        messageText.setOffset({ x: messageText.getWidth() / 2 });

        //Canvas background image
        var canvasBackgroundImage = new Image();
        canvasBackgroundImage.onload = function() {
            var backgroundImage = new Kinetic.Image({
                x: 0,
                y: 0,
                image: canvasBackgroundImage,
                width: stageWidth,
                height: stageHeight
            });
            background_layer.add(backgroundImage);
            background_layer.add(degreeText);
            background_layer.add(messageText);
            background_layer.draw();
        };
        canvasBackgroundImage.src = '/assets/images/weather/' + data.image + '.png';
    }
    broker.sub("showWeather", render, "IP");

}

widgets.push({fn: WeatherWidget, channel: "IP"});
