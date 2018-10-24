var InitHalfMoonSpeedometerWidget = function (socket, consoleName) {
    var HalfmoonSpeedometerWidget = function(socket, consoleName) {
        socket.emit('subscribe', { console: consoleName, name: 'initHalfMoonSpeedometer' });

        var speedTextPosOffset = 27;
        var speedReference = 50; //speed at which pointer is vertical
        var layer = new Kinetic.Layer();
        var speedLayer = new Kinetic.Layer();
        var stageHeight = 341;
        var stageWidth = 455;
        var radius = 140;
        var speedLines = [];
        var speedBallRadius = radius * 1.2;
        var startingPhase = 0.5 * Math.PI * (speedReference/2);
        var x1 = stageWidth / 2;
        var y1 = stageHeight;
        var x2 = (stageWidth / 2) + (Math.cos(startingPhase) * speedBallRadius);
        var y2 = stageHeight - (Math.sin(startingPhase) * speedBallRadius);
        var initialSpeed = 0;
        var circleLayer = new Kinetic.Layer();
        var textLayer = new Kinetic.Layer();
        var countDownOrigin = { x: stageWidth/2, y: stageHeight/2, radius: 80 };

        var currentSpeed = 0; //current car speed from telemetry updates
        var showingCountdown = false;

        var countDownCircle = new Kinetic.Circle({
            x: countDownOrigin.x,
            y: countDownOrigin.y,
            radius: countDownOrigin.radius,
            fill: 'black',
            stroke: 'white',
            strokeWidth: 4
        });

        var countDownText = new Kinetic.Text({
            x: countDownOrigin.x,
            y: countDownOrigin.y,
            text: ' 0',
            fontSize: 70,
            fontFamily: 'Lato_Black',
            fill: '#36C2F0'
        });

        var speedLine = new Kinetic.Line({
            points: [x1, y1, x2, y2],
            stroke: "#fff",
            strokeWidth: 10,
            lineCap: 'square',
            lineJoin: 'round'
        });

        y2 = stageHeight - (Math.sin(startingPhase) * (speedBallRadius + speedTextPosOffset));
        x2 = (stageWidth / 2) + (Math.cos(startingPhase) * (speedBallRadius + speedTextPosOffset));
        var speedBall = new Kinetic.Circle({
            x: x2,
            y: y2,
            radius: 26,
            fill: "#fff",
            stroke: "#fff",
            strokeWidth: 1
        });

        var speedText = new Kinetic.Text({
            x: x2,
            y: y2,
            text: ' 35',
            fontSize: 24,
            fontFamily: 'Lato_Black',
            fill: '#7F7F7F'
        });

        var mphText = new Kinetic.Text({
            x: (stageWidth / 2),
            y: (stageHeight / 2) + 145,
            text: 'MPH',
            fontSize: 18,
            fontFamily: 'Lato_Black',
            fill: '#7F7F7F'
        });

        mphText.setOffset({ x: mphText.getWidth() / 2 });

        var mphNumberText = new Kinetic.Text({
            x: (stageWidth / 2),
            y: (stageHeight /2) + 90 ,
            text: '0',
            fontSize: 52,
            fontFamily: 'Lato_Black',
            fill: '#36C2F0'
        });

        var mphArc = new Kinetic.Shape({
            drawFunc: function (context) {
                var x = stageWidth /2;
                var y = stageHeight;
                var startAngle = 1 * Math.PI;
                var endAngle = 0 * Math.PI;
                context.beginPath();
                context.arc(x, y, radius -22, startAngle, endAngle, false);
                context.fillStrokeShape(this);
            },
            fill: '#000',
            stroke: '#fff',
            strokeWidth: 10,
            draggable: true
        });

        for (var i = 0; i < (speedReference * 2.0); i++) {
            var phase = 0.5 * Math.PI * (i / speedReference);
            speedLines[i] = new Kinetic.Line({
                points: [x1, y1, x1 - (Math.cos(phase) * (radius + 10)), y1 - (Math.sin(phase) * (radius + 10))],
                stroke: '#36C2F0',
                strokeWidth: 5,
                lineCap: 'square',
                lineJoin: 'round'
            });
            speedLines[i].hide();
            layer.add(speedLines[i]);
        }

        speedLayer.add(speedBall);
        speedLayer.add(speedText);

        //layer.add(speedArc);
        layer.add(speedLine);
        layer.add(mphArc);
        layer.add(mphNumberText);
        layer.add(mphText);

        function initTelemetryHandler(showCountDownTimer) {

            socket.on('car/telemetry', function(data) {
                data = data.value ? jQuery.parseJSON(data.value) : data;
                var speedLimit = data.speedLimit;
                var speed = data.mph;

                if (speed > speedReference * 2 || speed < 0){
                    speed = 0.0;
                }
                currentSpeed = speed;

                if(!showingCountdown){
                    $('#speedometer').show();
                    $('#lightCountdownContainer').hide();

                    for (var j = 0; j < speedReference * 2.0; j++) {
                        var line = speedLines[j];
                        if (j < speed) {
                            line.show();
                            if (speed > speedLimit && j > speedLimit) {
                                //blue
                                line.setStroke("red");
                            } else {
                                //white
                                line.setStroke('#36C2F0');
                            }
                        } else {
                            line.hide();
                        }
                    }
                    drawSpeed(speed, speedLimit);
                }
            });

            socket.on('car/nextsignal', function(data){
                data = data.value ? jQuery.parseJSON(data.value) : data;
                if (currentSpeed <= 5 && data.distance < 30 && data.timeToGreen >= 0 && data.color === 'Red' && showCountDownTimer && showCountDownTimer.toLowerCase() === 'true') {
                    // handle countdown timer
                    showingCountdown = true;
                    var timeToGreen = data.timeToGreen;

                    $('#speedometer').hide();
                    $('#lightCountdownContainer').show();

                    updateCountdownTimer(timeToGreen);
                } else{
                    showingCountdown = false;
                }
            });
        }

        function drawSpeed(speed, speedLimit) {
            var speedPhase = 0.5 * Math.PI * (speedLimit / speedReference);
            var speedLimitPhase = 0.5 * Math.PI * (speedLimit / speedReference);

            //only redraw if the speed limit changes
            if (initialSpeed !== speedLimit) {
                initialSpeed = speedLimit;

                speedLine.getPoints()[1].x = x1 - (Math.cos(speedLimitPhase) * radius);
                speedLine.getPoints()[1].y = y1 - (Math.sin(speedLimitPhase) * radius);

                speedLine.getPoints()[1].x = x1 - (Math.cos(speedPhase) * speedBallRadius);
                speedLine.getPoints()[1].y = y1 - (Math.sin(speedPhase) * speedBallRadius);

                speedBall.setX(x1 - (Math.cos(speedPhase) * (speedBallRadius + speedTextPosOffset)));
                speedBall.setY(y1 - (Math.sin(speedPhase) * (speedBallRadius + speedTextPosOffset)));

                speedText.setX(x1 - (Math.cos(speedPhase) * (speedBallRadius + speedTextPosOffset)));
                speedText.setY(y1 - (Math.sin(speedPhase) * (speedBallRadius + speedTextPosOffset)));
                speedText.setOffset({ x: (speedText.getWidth() / 2) });
                speedText.setText(Math.floor(speedLimit));
                speedText.setOffset({ x: speedText.getWidth() / 2, y: 11 });
            }
            
            mphNumberText.setText(Math.floor(speed));
            mphNumberText.setOffset({ x: mphNumberText.getWidth() / 2 });
            
            layer.drawScene();
            speedLayer.drawScene();
        }

        socket.on("initHalfMoonSpeedometer", function(data) {
            var containerName = "speedometer";
            var speedLimit = data.speedLimit ? data.speedLimit : 35;

            $("#" + data.quadrant).empty().html("<div id='speedometer'></div><div id='lightCountdownContainer'></div>");
            if(data.showCountDownTimer){
                drawCountdownTimer();
            }
            
            var parentHeight = $("#" + data.quadrant).height();

            var stage = new Kinetic.Stage({
                container: containerName,
                width: stageWidth,
                height: stageHeight,
                offsetY: -((parentHeight - stageHeight) / 2)
            });

            stage.add(speedLayer);
            stage.add(layer);

            socket.emit('subscribe', { console: consoleName, name: 'removeHalfMoonSpeedometer' });
            socket.emit('subscribe', { name: "car/telemetry" });
            socket.emit('subscribe', { name: "car/nextsignal"});

            initTelemetryHandler(data.showCountDownTimer);
            drawSpeed(0, speedLimit);
        });

        socket.on("removeHalfMoonSpeedometer", function(data) {
            $("#" + data.quadrant).empty();
        });

        function drawCountdownTimer(){
            var countdownName = "lightCountdownContainer";
            var stageLightCountdown = new Kinetic.Stage({
                container: countdownName,
                width: stageWidth,
                height: stageHeight
            });

            circleLayer.add(countDownCircle);
            textLayer.add(countDownText);
            stageLightCountdown.add(circleLayer);
            stageLightCountdown.add(textLayer);

            $("#lightCountdownContainer").hide();
        }

        function updateCountdownTimer(timeToGreen){
            //update this to pull the actual data
            countDownText.setText(timeToGreen);
            countDownText.setOffset({
                x: countDownText.getWidth() / 2,
                y: countDownText.getHeight() / 2
            });
            circleLayer.drawScene();
            textLayer.drawScene();
        }
    };
    new HalfmoonSpeedometerWidget(broker.getSocket(), broker.getChannel());
};

widgets.push({fn: InitHalfMoonSpeedometerWidget, channel: "HUD"});