var TripReportWidget = function(broker) {
   
    var TripWidget = function(socket, consoleName) {
        socket.emit('subscribe', { console: consoleName, name: "showTripSummaryReport" });
        socket.emit('subscribe', { console: consoleName, name: "showTripDetailReport" });

        socket.on("showTripSummaryReport", function(data) {
            
            var parent = $("#" + data.quadrant);
            var widgetDiv = $("<div class='blackbox-summary'></div>");
            var logData = parseSentLog(data.logData);

            var totalDistance = (Math.floor(logData.totalDistance * 100) / 100) + ' m';
            var averageSpeed = Math.floor(logData.avgSpeed) + ' km/h';

            widgetDiv.append("<div class='totalDistance'>" + totalDistance + "</div>");
            widgetDiv.append("<div class='duration'>" + logData.duration + "</div>");
            widgetDiv.append("<div class='avgSpeed'>" + averageSpeed + "</div>");

            parent.append(widgetDiv);
        });

        socket.on("removeTripSummaryReport", function(data) {
            $("#" + data.quadrant).empty();
        });

        socket.on("showTripDetailReport", function(data) {
            
            var logData = parseSentLog(data.logData);
            var parent = $("#" + data.quadrant);
            var widgetDiv = $("<div id='blackbox'></div>");
            var header = $("<div class='trip-header'>" + data.fromDestination + " &gt; " + data.toDestination + "</div>");
            var startText = $("<div class='trip-time'>" + logData.startTime + " DEPARTURE</div>");

            widgetDiv.append(startText);
            widgetDiv.append(header);

            var idlegraph = $("<div class='idlegraph'></div>");
            var idlegraph2 = $("<div class='idlegraph2'></div>");
            var idlegraph3 = $("<div class='idlegraph3 rangeslider'></div>");

            var subTitleStyle = {
                'font-family': 'Lato_Black',
                'font-size': '24px',
                'color': '#4EBEE3',
                'padding-top': '10px'
            };

            var titleStyle = {
                'font-family': 'Lato_Regular',
                'font-size': '13px'
            };

            // TRIP TIME
            var tripTimes = logData.duration.split(":");
            var tripTime = parseFloat((parseInt(tripTimes[0]) * 60) + parseInt(tripTimes[1]) + (parseInt(tripTimes[2]) /60)).toFixed(2)/1;
            var fasterTime = (parseFloat(tripTime) - parseFloat(tripTime * parseFloat(data.goodTimePercent/100))).toFixed(2)/1;
            var slowerTime = (parseFloat(tripTime) + parseFloat(tripTime * parseFloat(data.poorTimePercent/100))).toFixed(2)/1;

            idlegraph.highcharts({
                chart: {
                    type: 'column',
                    height: 260,
                    width: 217,
                    backgroundColor: 'transparent'
                },
                title: {
                    text: 'TRIP TIME',
                    style: titleStyle
                },
                subtitle: {
                    text: logData.duration,
                    style: subTitleStyle,
                    y: 42
                },
                xAxis: {
                    categories: ['Trip Time'],
                    labels: { enabled: false },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    labels: { enabled: false },
                    title: { text: null },
                    gridLineColor: 'transparent'
                },
                series: [
                    {
                        name: 'Time Later',
                        data: [slowerTime],
                        dataLabels: {
                            enabled: true,
                            format: '-' + data.offsetMinutes + ' M'
                        },
                        color: '#EDCA8E'
                    },
                    {
                        name: 'Time Left',
                        data: [tripTime],
                        color: '#4EBEE3'
                    },
                    {
                        name: 'Time Earlier',
                        data: [fasterTime],
                        dataLabels: {
                            enabled: true,
                            format: '+' + data.offsetMinutes + ' M'
                        },
                        color: '#D8F2FB'
                    }
                ],
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                }
            });

            // AVERAGE SPEED
            var slowerSpeed = parseInt(logData.avgSpeed) - parseInt(logData.avgSpeed * (data.goodSpeedPercent /100), 10);
            var fasterSpeed = parseInt(logData.avgSpeed) + parseInt(logData.avgSpeed * (data.poorSpeedPercent /100), 10);
            idlegraph2.highcharts({
                chart: {
                    type: 'column',
                    height: 260,
                    width: 217,
                    backgroundColor: 'transparent'
                },
                title: {
                    text: 'AVG SPEED',
                    style: titleStyle
                },
                subtitle: {
                    text: logData.avgSpeed + " mph",
                    style: subTitleStyle,
                    y: 42
                },
                xAxis: {
                    categories: ['Avg Speed'],
                    labels: { enabled: false },
                    lineWidth: 0,
                    minorGridLineWidth: 0,
                    lineColor: 'transparent',
                    minorTickLength: 0,
                    tickLength: 0
                },
                yAxis: {
                    labels: { enabled: false },
                    title: { text: null },
                    gridLineColor: 'transparent'
                },
                series: [
                    {
                        name: 'Speed Slower',
                        data: [slowerSpeed],
                        dataLabels: {
                            enabled: true,
                            format: '-' + data.offsetMinutes + ' M'
                        },
                        color: '#D8F2FB'
                    },
                    {
                        name: 'Average Speed',
                        data: [parseInt(logData.avgSpeed, 10)],
                        color: '#4EBEE3'
                    },
                    {
                        name: 'Speed Faster',
                        data: [fasterSpeed],
                        dataLabels: {
                            enabled: true,
                            format: '+' + data.offsetMinutes + ' M'
                        },
                        color: '#EDCA8E'
                    }
                ],
                legend: {
                    enabled: false
                },
                credits: {
                    enabled: false
                }
            });

            //calculate fuel efficiency
            var rangeThird = Math.floor((parseInt(data.greatFuelMPG) - parseInt(data.poorFuelMPG)) / 3);
            var fairRange = Math.floor(rangeThird + parseInt(data.poorFuelMPG));
            var greatRange = Math.floor((rangeThird * 2) + parseInt(data.poorFuelMPG));
            var fuelText = "poor";
            var mpg = parseInt(data.averageMPG) /1;

            if(mpg >= fairRange && mpg < greatRange){ fuelText = "fair"; }
            if(mpg >= greatRange){ fuelText = "great"; }

            // FUEL EFFICIENCY
            // var fuelText = "Your inefficiency is costing you $4.35 a week. Adjust your behavior and you can save upwards of $17 a month.";
            idlegraph3.append("<div class='fuel-header'>FUEL EFFICIENCY</div>");
            idlegraph3.append("<div class='fuel-subheader'>" + fuelText + "</div>");
            idlegraph3.append("<div class='range-text'><div class='range-poor'>POOR</div><div class='divider'></div><div class='range-great'>GREAT</div></div>");
            idlegraph3.append("<input type='range' value='" + mpg + "' min='" + data.poorFuelMPG + "' max='" + data.greatFuelMPG +  "'  disabled='disabled'/>");
            idlegraph3.append("<div class='fuel-text'>" + data.fuelEfficiencyText + "</div>");

            widgetDiv.append(idlegraph);
            widgetDiv.append(idlegraph2);
            widgetDiv.append(idlegraph3);
            widgetDiv.append("<div class='trip-time-text'>" + data.tripTimeText + "</div>");
            widgetDiv.append("<div class='trip-avg-speed-text'>" + data.avgSpeedText + "</div>");
            parent.append(widgetDiv);

        });

        socket.on("removeTripDetailReport", function(data) {
            $("#" + data.quadrant).empty();
        });


        function parseSentLog(fileContents) {
           
            var file = fileContents.replace(/}/gi, "}\r\n");
            var lines = file.split(/\n/);
            var logData = {
                duration: null,
                startTime: null,
                stopTime: null,
                maxSpeed: null,
                avgSpeed: null,
                totalDistance: null,
                idleSeries: null,
                counterSeries: null,
                fuelSeries: null
            };

            for (var idx in lines) {
                try {
                    var tag = lines[idx].split('|')[0];
                    var jsondata = lines[idx].split('|')[1];
                    if (jsondata) {
                        jsondata = jsondata.replace(/'/gi, '"');
                        var json = JSON.parse(jsondata);
                        if (tag.trim() === 'start') {
                            logData.startTime = formatTimestamp(json.date_timestamp.split('.')[0]);
                        }
                        if (tag.trim() === 'stop') {
                            logData.stopTime = formatTimestamp(json.date_timestamp.split('.')[0]);
                            logData.duration = json.trip_duration;
                            logData.maxSpeed = json.max_speed_obd;
                            logData.avgSpeed = json.avrg_speed_obd;
                            logData.totalDistance = json.total_distance_obd;
                            //collect stats here
                        }
                        if (tag.trim() === 'FUEL') {
                            logData.fuelSeries = [json.range_1, json.range_2, json.range_3, json.range_4, json.range_5, json.range_6];
                        }
                        if (tag.trim() === 'IDLE') {
                            logData.idleSeries = [json.idle_1, json.idle_2, json.idle_3, json.idle_4, json.idle_5];
                            logData.counterSeries = [json.counter_1, json.counter_2, json.counter_3, json.counter_4, json.counter_5];
                        }
                    }
                } catch (err) {
                    console.log('Could not parse tripsummary line: ' + lines[idx] + ': ' + err);
                }
            }

            return logData;
        }

        function formatTimestamp(timestamp) {
            timestamp = parseInt(timestamp.replace(" ", ""));
            var dt = new Date(timestamp);

            var hours = dt.getHours();
            var minutes = dt.getMinutes();
            var seconds = dt.getSeconds();
            var day = dt.getDay();
            var month = dt.getMonth();
            var year = dt.getYear();

            // the above dt.get...() functions return a single digit
            // so I prepend the zero here when needed
            if (hours < 10){
                hours = '0' + hours;
            }

            if (minutes < 10){
                minutes = '0' + minutes;
            }

            if (seconds < 10){
                seconds = '0' + seconds;
            }

            // "DDMMYY hhmmss"
            return day + "/" + month + "/" + year + "  " +  hours + ":" + minutes + ":" + seconds;
        }
    };

    new TripWidget(broker.getSocket(), broker.getChannel());
};

widgets.push({fn: TripReportWidget, channel: "CC"});
