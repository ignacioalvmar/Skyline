function TimerWidget(broker) {
    function render(data) {
        
            var container = "timer";
            $("#" + data.quadrant).html("<div id='timer'></div>");
            
            var stage = new Kinetic.Stage({
                container: container,
                width: 455,
                height: 341
            });

            timeNumberText.setText(data.startTime);
            timeNumberText.setOffset({ x: timeNumberText.getWidth() / 2, y: timeNumberText.getHeight() / 2 });
            timeUnitText.setText(data.units);
            timeUnitText.setOffset({ x: (timeUnitText.getWidth() / 2), y: (timeUnitText.getHeight() / 2) - (timeNumberText.getHeight() / 2) });

            createTimeLines();
            layer.add(innerCircle);
            layer.add(timeNumberText);
            layer.add(timeUnitText);
            stage.add(layer);

            startTimer(data.startTime, data.units);
      }
      broker.sub("initTimer", render, "IP");

    var radius = 125;
    var lineCollection = [];
    var layer = new Kinetic.Layer();
    var x1 = 227.5;
    var y1 = 170.5;

    var innerCircle = new Kinetic.Circle({
        x: x1,
        y: y1,
        radius: radius - 35,
        fill: 'black'
    });

    var timeNumberText = new Kinetic.Text({
        x: x1,
        y: y1 - 10,
        text: '45',
        fontSize: 120,
        fontFamily: 'Lato_Regular',
        fill: 'white'
    });

    var timeUnitText = new Kinetic.Text({
        x: x1,
        y: y1,
        text: 'seconds',
        fontSize: 24,
        fontFamily: 'Lato_Black',
        fill: '#36C2F0'
    });


    
    function createTimeLines() {
        for (var i = 0; i < 120; i++) {
            var radians = (Math.PI / 180) * ((i * 3) - 90);
            var cx = x1 + (radius * Math.cos(radians));
            var cy = y1 + (radius * Math.sin(radians));
                lineCollection[i] = new Kinetic.Line({
                    points: [x1, y1, cx, cy],
                    stroke: "white",
                    strokeWidth: 2,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
            lineCollection[i].hide();
            layer.add(lineCollection[i]);
        }
    }

    function startTimer(time, units) {
        if (units.toString().toLowerCase() === 'seconds') {
            for (var i = 0; i < time * 2; i++) {
                lineCollection[i].show();
            }
            var timeLeft = Math.floor(time * 2) - 1;

            if (time <= 30) {
                updateBackgroud();
            }
            var countdownInterval = setInterval(function() {
                countdown(timeLeft);
                timeLeft--;
            }, 500);


        }

        if (units.toString().toLowerCase() === "minutes") {
            var minutesLeft = 119;

            for (var x = 0; x < 120; x++) {
                lineCollection[x].show();
            }

            timeNumberText.setText(time);
            timeNumberText.setOffset({ x: timeNumberText.getWidth() / 2, y: timeNumberText.getHeight() / 2 });

            var minuteInterval = setInterval(function() {
                countdownMinute(minutesLeft);
                minutesLeft--;
            }, 500);

        }
            function countdown(data) {
                drawCountdownTimer(data);
                if (data === 60) { updateBackgroud(); }
                if (data === 0) { clearInterval(countdownInterval); }
            }
            function countdownMinute(data) {
                drawMinuteTimer(data);
                if (data === 0) {
                    clearInterval(minuteInterval);
                    time -= 1;
                    if (time === 1) {
                        timeUnitText.setText("seconds");
                        timeUnitText.setOffset({ x: (timeUnitText.getWidth() / 2), y: (timeUnitText.getHeight() / 2) - (timeNumberText.getHeight() / 2) });
                        startTimer(60, "seconds");
                    } else{ startTimer(time, "minutes"); }
                }
            }
    }

    function drawMinuteTimer(time) {
        lineCollection[time].hide();
        layer.drawScene();
    }

    function updateBackgroud() {
        //$("#timer").parent().addClass("timer-warning");
        timeNumberText.setFill("#ffffff");
        timeUnitText.setFill("#000000");
        for (var i = 0; i < 60; i++) { lineCollection[i].setStroke("#f4a940"); }
        innerCircle.setFill('');
        innerCircle.setFillLinearGradientStartPoint(-50);
        innerCircle.setFillLinearGradientEndPoint(50);
        innerCircle.setFillLinearGradientColorStops([0, '#e3944b', 1, '#f4a940']);
    }

    function drawCountdownTimer(time) {
        lineCollection[time].hide();
        timeNumberText.setText(Math.floor(time / 2));
        timeNumberText.setOffset({ x: timeNumberText.getWidth() / 2, y: timeNumberText.getHeight() / 2 });
        layer.drawScene();
    }


}
widgets.push({fn: TimerWidget, channel: "IP"});