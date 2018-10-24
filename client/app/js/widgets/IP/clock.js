function ClockWidget(broker) {
    function render(data) {
        var containerName = "clock";
        var parentHeight = $("#" + data.quadrant).height();
        var widgetDiv = $("<div id='clock'></div>");
        $("#" + data.quadrant).empty().html(widgetDiv);

        // widgetDiv.css("padding-top", ((parentHeight - 256) / 2));
        widgetDiv.css("padding-top", ((parentHeight - 300) / 2));

        var stage = new Kinetic.Stage({
            container: containerName,
            width: 256,
            height: 300
        });

        stage.add(circleLayer);
        stage.add(bgLayer);
        stage.add(textLayer);
        setTime();
    }

    broker.sub("showClock", render, "IP");

    var xCor = 127;
    var yCor = 108;
    var clockRadius = 50;
    var monthText = {
        '0': "January",
        '1': "February",
        '2': "March",
        '3': "April",
        '4': 'May',
        '5': 'June',
        '6': 'July',
        '7': 'August',
        '8': 'September',
        '9': 'October',
        '10': 'November',
        '11': 'December'
    };

    var circleLayer = new Kinetic.Layer();
    var bgLayer = new Kinetic.Layer();
    var textLayer = new Kinetic.Layer();

    var dateText = new Kinetic.Text({
        x: 0,
        y: 202,
        text: '',
        fontSize: 24,
        fontFamily: 'Lato_Light',
        fill: 'white'
    });

    var clock = new Kinetic.Circle({
        x: xCor,
        y: yCor,
        radius: clockRadius,
        fill: 'black',
        stroke: 'white',
        strokeWidth: 3
    });

    var minuteLines = [];
    var hourLines = [];
    var secondLines = [];

    function createClockLines(lineCollection, count, interval, radius, color, lineWidth, strokeRGB) {
        for (var i = 0; i < count; i++) {
            var radians = (Math.PI / 180) * ((i * interval) - 90);
            var cx = xCor + (radius * Math.cos(radians));
            var cy = yCor + (radius * Math.sin(radians));

            if (strokeRGB) {
                lineCollection[i] = new Kinetic.Line({
                    points: [xCor, yCor, cx, cy],
                    strokeRGB: strokeRGB,
                    strokeWidth: lineWidth,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
            } else {
                lineCollection[i] = new Kinetic.Line({
                    points: [xCor, yCor, cx, cy],
                    stroke: color,
                    strokeWidth: lineWidth,
                    lineCap: 'round',
                    lineJoin: 'round'
                });
            }
            lineCollection[i].hide();
            bgLayer.add(lineCollection[i]);
        }
    }

    createClockLines(minuteLines, 60, 6, clockRadius - 15, "#58c1e2", 3);
    createClockLines(hourLines, 12, 30, clockRadius - 25, "white", 3);
    createClockLines(secondLines, 60, 6, clockRadius - 15, "#be1212", 2);
    circleLayer.add(clock);
    textLayer.add(dateText);




    function setTime() {
        var hour = 0;
        var minute = 0;
        var second = 0;

        setInterval(function() {
            //hide lines first
            minuteLines[minute].hide();
            hourLines[hour].hide();
            secondLines[second].hide();

            var d = new Date();
            hour = d.getHours();
            minute = d.getMinutes();
            second = d.getSeconds();

            if (hour > 12) {
                hour = hour - 12;
            }

            if (hour === 12) {
                hour = 0;
            }

            minuteLines[minute].show();
            hourLines[hour].show();
            secondLines[second].show();

            setDateText(d);

            bgLayer.drawScene();
        }, 1000);
    }

    function setDateText(date) {
        var month = date.getMonth();
        var day = date.getDate();
        var dText = day < 10 ? "0" + day : day.toString();
        var year = date.getFullYear();
        var mText = monthText[month];

        dateText.setText(mText + " " + dText + ", " + year);
        dateText.setOffset({ x: (dateText.getWidth() - 256) / 2 });
        textLayer.drawScene();
    }
}

widgets.push({fn: ClockWidget, channel: "IP"});
