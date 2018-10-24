var SpeedometerWidget = function(broker) {
    var speedoWidget = function(socket, consoleName) {

        var speedLayer = new Kinetic.Layer();
        var bgLayer = new Kinetic.Layer();
        var topLayer = new Kinetic.Layer();
        var radius = 80;
        var speedBallRadius = radius * 1.1;
        var speedReference = 50; //speed at which pointer is vertical

        var speedLimitCircleRadius = radius / 3;
        var originX = 130;
        var originY = 120;

        var speedLimitCircle = new Kinetic.Circle({
            x: originX,
            y: originY,
            radius: speedLimitCircleRadius,
            fill: 'white',
            stroke: 'white',
            strokeWidth: 1
        });

        var mphText = new Kinetic.Text({
            x: originX - 24,
            y: originY + 30,
            text : 'MPH',
            fontSize: 18,
            fontFamily: 'Lato_Light',
            fill: 'white'
        });

        var speedLine = new Kinetic.Line({
            points: [originX, originY, originX - speedBallRadius, originY],
            stroke: "#58c1e2",
            strokeWidth: 4,
            lineCap: 'square',
            lineJoin: 'round'
        });

        var speedBall = new Kinetic.Circle({
            x: originX - speedBallRadius,
            y: originY,
            radius: speedLimitCircleRadius / 3,
            fill: "#58c1e2",
            stroke: "#58c1e2",
            strokeWidth: 1
        });

        var speedTextPosOffset = 10;
        var speedText = new Kinetic.Text({
            x: originX - speedTextPosOffset - speedBallRadius,
            y: originY - speedTextPosOffset,
            text: '',
            fontSize: 18,
            fontFamily: 'Lato_Light',
            fill: '#ffffff'
        });

        var speedLimitLine = new Kinetic.Line({
            points: [originX, originY, originX - radius, originY],
            stroke: 'white',
            strokeWidth: 4,
            lineCap: 'square',
            lineJoin: 'round'
        });

        var speedLimitText = new Kinetic.Text({
            x: originX - 18,
            y: originY - 15,
            text: "0",
            fontSize: 30,
            fontFamily: 'Lato_Light',
            fill: '#7F7F7F'
        });

        //speedometer
        speedLayer.add(speedLine);
        speedLayer.add(speedBall);
        speedLayer.add(speedText);
        bgLayer.add(speedLimitLine);

        topLayer.add(speedLimitCircle);
        topLayer.add(speedLimitText);
        topLayer.add(mphText);

        var speedLines = [];

        for (var i = 0; i < (speedReference * 2.0); i++) {
            var phase = 0.5 * Math.PI * (i / speedReference);
            speedLines[i] = new Kinetic.Line({
                points: [originX, originY, originX - (Math.cos(phase) * radius), originY - (Math.sin(phase) * radius)],
                stroke: 'white',
                strokeWidth: 1,
                lineCap: 'square',
                lineJoin: 'round'
            });
            speedLines[i].hide();
            bgLayer.add(speedLines[i]);
        }

        function initTelemetryHandler() {
            socket.on('car/telemetry', function(data) {

                //data = data.value ? jQuery.parseJSON(data.value) : data;
                var speedLimit = 45;
                var speed = data.speedMPH;

                //speedLimitText.setText(Math.floor(speedLimit));

                if (speed > speedReference * 2 || speed < 0) {
                    speed = 0.0;
                }

                for (var j = 0; j < speedReference * 2.0; j++) {
                    var line = speedLines[j];
                    if (j < speed) {
                        line.show();
                        if (speed > speedLimit && j > speedLimit) {
                            //blue
                            line.setStroke("#58c1e2");
                        } else {
                            //white
                            line.setStroke('white');
                        }
                    } else {
                        line.hide();
                    }
                }

                drawSpeedometer(speed, speedLimit);

            });
        }


        if (broker.getChannel() === "IP") {
            broker.sub("initSpeedometer", function(data) {
                var containerName = "speedometer";
                $("#" + data.quadrant).empty().html("<div id='speedometer'></div>");
                var parentHeight = $("#" + data.quadrant).height();

                var stage = new Kinetic.Stage({
                    container: containerName,
                    width: 256,
                    height: 400,
                    offsetY: -((parentHeight - 300) / 2)
                });

                stage.add(bgLayer);
                stage.add(speedLayer);
                stage.add(topLayer);

                socket.emit('subscribe', { console: consoleName, name: 'removeSpeedometer' });
                socket.emit('subscribe', { name: "car/telemetry" });
                initTelemetryHandler();
            }, "IP");

            socket.on("removeSpeedometer", function(data) {
                $("#" + data.quadrant).empty();
            });
        }

        function drawSpeedometer(speed, speedLimit) {
            var speedPhase = 0.5 * Math.PI * (speed / speedReference);
            var speedLimitPhase = 0.5 * Math.PI * (speedLimit / speedReference);

            speedLimitLine.getPoints()[1].x = originX - (Math.cos(speedLimitPhase) * radius);
            speedLimitLine.getPoints()[1].y = originY - (Math.sin(speedLimitPhase) * radius);

            speedLine.getPoints()[1].x = originX - (Math.cos(speedPhase) * speedBallRadius);
            speedLine.getPoints()[1].y = originY - (Math.sin(speedPhase) * speedBallRadius);

            speedBall.setX(originX - (Math.cos(speedPhase) * speedBallRadius));
            speedBall.setY(originY - (Math.sin(speedPhase) * speedBallRadius));

            speedText.setX(originX - (Math.cos(speedPhase) * speedBallRadius) - speedTextPosOffset);
            speedText.setY(originY - (Math.sin(speedPhase) * speedBallRadius) - speedTextPosOffset);

            speedLimitText.setText(speed < 10 ? ' ' + Math.floor(speed) : Math.floor(speed));
            //speedLimitText.setText(Math.floor(speedLimit));

            speedLayer.drawScene();
            bgLayer.drawScene();
            topLayer.drawScene();
        }
    };

    speedoWidget(broker.getSocket(), broker.getChannel());
};

widgets.push({fn: SpeedometerWidget, channel: "IP"});
