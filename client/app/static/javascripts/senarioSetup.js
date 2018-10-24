

var initScenario = function(socket) {
    var widgetJSON;
    var incomingEvents;
    var configJSON;

    $.getJSON("/json/config.json", function(json) {
        console.log(json);
        configJSON = json;
    }).fail(function(err) {console.log("error loading config.json: " + err);});

    $.getJSON("/json/widget.json", function(json) {
        console.log(json);
        widgetJSON = json;
    }).fail(function(err) {console.log("error loading widget.json: " + err);});




    $.getJSON("/json/drives.json", function(json) {

        drivePaths = json.Scenarios;

        $.each(drivePaths, function(i, v) {
            $(".drivepath-select")
                .append($("<option></option>")
                    .attr("value", i)
                    .text(v.Name));
        });

    }).fail(function(err) {console.log("error loading drivePaths.json: " + err);});

    $(".drivepath-select").change(function(){
        var selectedPath = $(".drivepath-select").val();
        loadSelectedEvents(selectedPath);

    });

    function loadSelectedEvents(scenario){
        //$.getJSON("/json/" + eventFile, function(json) {
          $.getJSON("/json/drives.json", function(json) {

            incomingEvents = json.Scenarios[scenario].Triggers;
            $(".mqtt-select").empty();
            $.each(incomingEvents, function(i, v) {
                $(".mqtt-select")
                    .append($("<option></option>")
                        .attr("value", v.id)
                        .text(v.name));
            });

        }).fail(function(err) {console.log("error loading hmiEvents.json: " + err);});
    };

    socket.on('builderLoadFile', function(data){
        console.log(data);
        configController.renderScenario(data.fileName,data.file);
    });

    function getScreenDropDown() {
        var select = $("<select class='form-control' name='console' ></select>");
        $.each(configJSON.consoles, function(i, v) {
            select.append($("<option></option>")
                    .attr("value", v.value)
                    .text(v.text));
        });

        return select;
    }

    function getFilteredScreenDropDown(widgetIndex) {
        var select = $("<select class='form-control' name='console' widgetIndex='" + widgetIndex + "' onchange='updateAvailableZones(this)'></select>");
        $.each(widgetJSON[widgetIndex].availableDisplays, function(i, v) {
            select.append($("<option></option>")
                    .attr("value", v.display)
                    .text(v.display));
        });

        return select;
    }

    function getQuadrantDropDown() {
        var select = $("<select class='form-control' name='quadrant' ></select>");
        $.each(configJSON.quadrants, function(i, v) {
            select.append($("<option></option>")
                    .attr("value", v.value)
                    .text(v.text));
        });

        return select;
    }

    function getFilteredQuadrantDropDown(widgetIndex, selectedDisplayIndex) {
        var select = $("<select class='form-control' name='quadrant' ></select>");
        $.each(widgetJSON[widgetIndex].availableDisplays[selectedDisplayIndex].zones, function(i, v) {
            select.append($("<option></option>")
                    .attr("value", v)
                    .text(v));
        });

        return select;
    }

    function appendWidgetList(select) {
        $.each(widgetJSON, function(i, v) {
            select.append($("<option></option>")
                    .attr("value", i)
                    .text(v.name));
        });
    }

    function parseContainer(container) {
        var obj = {};
        var inputs = container.find('input, textarea, select');

        $.each(inputs, function(index, value) {
            if (value.name != "" && obj[value.name] == undefined) {
                if (value.type == "checkbox") {
                    obj[value.name] = value.checked;

                } else {
                    obj[value.name] = value.value == '' ? null : value.value;
                }
            }
        });

        return obj;
    }

    function getSubscription(widgetIndex, widgetEvent) {
        var event;
        $.each(widgetJSON[widgetIndex].subscriptions, function(i, v) {

            if (v.name == widgetEvent) {
                event = v;
                return false;
            } else {
                return true;
            }
        });
        return event;
    }

    function getIncomingEventData(eventName) {
         var data;
        $.each(incomingEvents, function(i, v) {
            if (v.event == eventName) {
                data = v.data;
                return false;
            } else {
                return true;
            }
        });
        return data;
    }

    var configController = {
        appendListener: function(parent, subscribeEvent, subscribeText) {
            var eventIndex = subscribeEvent ? subscribeEvent : "new_event";
            var eventText = subscribeText ? subscribeText : "Custom Listener";
            var liDiv = $("<li class='mqtt-event'></li>");
            var removeBtn = "<button class='btn btn-danger pull-right' type='button' onclick='removeListenerEvent(this)'>Remove Event</button>";
            var runBtn = "<button class='btn btn-success pull-left' type='button' onclick='runAll(this)'>Run Event</button>";
            var collapseLink = "<a class='pull-left collapse-event' onclick='collapseEvent(this)'><b class='glyphicon glyphicon-arrow-up'></b></a>";
            var newListner = "<div class='col-lg-6'><input class='form-control' name='subscribeText' type='text' value='" + eventText + "' /></div>";
            var newListnerText = "<div class='col-lg-6'><input class='form-control' name='subscribeEvent' type='text' value='" + eventIndex +"' /></div>";
            var newH3 = $("<h3 class='text-center'>" + collapseLink + runBtn + removeBtn + "</h3><div class='clearfix'></div>");

            liDiv.append("<div class='mqtt-subscribe'>" + newListner + newListnerText + "</div><div class='clearfix'></div>");
            liDiv.append(newH3);

            var body = "<div class='widget-events collapsible'>" +
                        "<div class='form-group'>" +
                            "<div class='col-lg-2'>" +
                                "<label class='pull-right'>Select Widget</label>" +
                            "</div>" +
                            "<div class='col-lg-3'>" +
                                "<select class='form-control availableWidgets' id='eventSelectDropdown' onchange='displayEvents(this)'><option></option></select>" +
                            "</div>" +
                        "</div>" +
                        "<div class='form-group'>" +
                            "<div class='col-lg-2'>" +
                                "<label class='pull-right'>Select Event</label>" +
                            "</div>" +
                            "<div class='col-lg-3'>" +
                                "<select class='form-control availableEvents'></select>" +
                            "</div>" +
                        "</div>" +
                        "<button class='btn btn-primary' type='button' onclick='appendData(this)'>Add Widget</button>" +
                        "<ul class='form-group events'></ul>" +
                    "</div>";

            liDiv.append(body);
            var ae = liDiv.find(".availableWidgets").first();
            appendWidgetList(ae);
            parent.append(liDiv);
            var data = {};
            data.name = eventIndex;
            socket.emit("subscribeNewEvent", data );

            return liDiv;
        },

        displayEvents: function(select, index) {
            console.log(select);
            if (index == "") return;
            var subscriptions = widgetJSON[index].subscriptions;
            select.empty();

            $.each(subscriptions, function(i, v) {
                if(typeof(v.displayName) != 'undefined'){
                    select.append($("<option></option>")
                            .attr("value", v.name)
                            .text(v.displayName));
                }else{
                    select.append($("<option></option>")
                            .attr("value", v.name)
                            .text(v.name));
                }

            });
        },
        getAvailableZones: function(widgetIndex, selectedDisplay){
            console.log(widgetIndex);
            console.log(selectedDisplay);
            return widgetJSON[widgetIndex].availableDisplays[selectedDisplay].zones;
        },
        appendData: function(parentLi, widgetIndex, widgetEvent) {
            parentLi.find(".availableWidgets").first().val(widgetIndex);
            var widgetName = parentLi.find(".availableWidgets").first().children(':selected').text();
            var eventName = widgetJSON[widgetIndex].name;

            var publishEvent = getSubscription(widgetIndex, widgetEvent);
            var data = publishEvent.data;
            var parent = parentLi.find(".events").first();
            var eventDiv = $("<li class='event'></li>");
            var collapsibleDiv = $("<div class='collapsible'></div>");
            var runButton = "<button class='btn btn-success run-event-button pull-left' type='button' onclick='sendMessage(this)'>Run Widget</button>";
            var removeButton = "<button class='btn btn-danger pull-right' style='margin-left:10px;' type='button' onclick='removeEvent(this)'>Remove Widget</button>";
            var collapseLink = "<a class='pull-left collapse-event' onclick='collapseEvent(this)'><b class='glyphicon glyphicon-arrow-up'></b></a>";
            eventDiv.append("<h4>" + collapseLink + runButton + widgetName + " - " + publishEvent.name + removeButton + "</h4>");
            eventDiv.append("<div class='zoneImage'></div>");
            eventDiv.append("<div class='clearfix'></div>");
            //append event name
            collapsibleDiv.append("<input type='hidden' name='widget_index' value='" + widgetIndex + "' />");
            collapsibleDiv.append("<input type='hidden' name='event_name' class='event_name' value='" + publishEvent.name + "' />");
            collapsibleDiv.append("<input type='hidden' name='event_text' value='" + eventName + "' />");

            //append data fields
            var dataDiv = $("<div class='data'></div>");
            var locationDiv = "<label>Screen</label>";
            var standardDivs = "<label>Quadrant</label><button class='btn btn-success show-zone-button' style='padding: 3px; margin: 5px;' type='button' onclick='showSelectedZone(this)'>Show Display</button><button class='btn btn-danger show-zone-button' style='display:none; padding: 3px; margin: 5px;' type='button' onclick='hideSelectedZone(this)'>Hide Display</button>";

            

            dataDiv.append(locationDiv);
            if(typeof(widgetJSON[widgetIndex].availableDisplays) != 'undefined'){
                dataDiv.append(getFilteredScreenDropDown(widgetIndex));
            }else{
                dataDiv.append(getScreenDropDown());
            }
            
            
            dataDiv.append(standardDivs);

            if(typeof(widgetJSON[widgetIndex].availableDisplays) != 'undefined'){
                dataDiv.append(getFilteredQuadrantDropDown(widgetIndex, 0));
            }else{
                dataDiv.append(getQuadrantDropDown());
            }


            var subscribeEventName = parentLi.find("input[name='subscribeEvent']").first().val();
            var subscribeEventData = getIncomingEventData(subscribeEventName);

            $.each(data, function(i, v) {
                if (v == null) v = "";
                var textClass = '';
                var placeholder = '';
                if (subscribeEventData && subscribeEventData.hasOwnProperty(i)) {
                    textClass = "highlight";
                    placeholder = "Incoming data field. Will be overridden";
                }
                dataDiv.append("<label>" + i + "</label><input class='form-control " + textClass + "' name='" + i + "' placeholder='" + placeholder + "' type='text' value='" + v + "'/>");
            });

            collapsibleDiv.append(dataDiv);
            eventDiv.append(collapsibleDiv);

            parent.append(eventDiv);
            $(".events").sortable();

            return dataDiv;
        },

        sendMessage: function(button) {
            var dataDiv = $(button).parent().parent().find('.data');
            var message = parseContainer(dataDiv);
            message.event_name = $(button).parent().parent().find('.event_name').first().val();
            socket.emit("subscriptionEvent", message);
            console.log("send message button clicked");
            console.log(message);
        },
        loadCreatedScenario: function(fileName){
            socket.emit("createLoadScenario", fileName);
        },
        renderScenario: function(fileName, file){
            var json = JSON.parse(file);
            var name = fileName.toString().substr(0, fileName.toString().indexOf('.'));
            $("#scenarioName").val(name);

            //set the drive path
            $(".drivepath-select").val(json.drivePath).change();

            setTimeout(function(){
            //load the events
                $.each(json.events, function(index, value) {
                    var liDiv = configController.appendListener($("#mqttEvents"), value.subscribeEvent, value.subscribeText);
                    $.each(value.widgets, function(i, v) {
                        var data = configController.appendData(liDiv, v.widget_index, v.event_name);

                        $.each(v, function(vIndex, vValue) {
                            if (vIndex == 'console') data.find("select[name='console']").val(vValue);
                            if (vIndex == "quadrant") data.find("select[name='quadrant']").val(vValue);
                            data.find("input[name='" + vIndex + "']").val(vValue);
                        });
                    });
                });
            }, 500);
        },
        loadScenario: function(fileName) {
            console.log("loading scenario from scenario setup js");
            $.getJSON("/json/senerios/" + fileName, function(json) {
                console.log(json);
                var name = fileName.toString().substr(0, fileName.toString().indexOf('.'));
                $("#scenarioName").val(name);

                $.each(json.events, function(index, value) {
                    var liDiv = configController.appendListener($("#mqttEvents"), value.subscribeEvent, value.subscribeText);
                    $.each(value.widgets, function(i, v) {
                        var data = configController.appendData(liDiv, v.widget_index, v.event_name);

                        $.each(v, function(vIndex, vValue) {
                            if (vIndex == 'console') data.find("select[name='console']").val(vValue);
                            if (vIndex == "quadrant") data.find("select[name='quadrant']").val(vValue);
                            data.find("input[name='" + vIndex + "']").val(vValue);
                        });
                    });
                });

            }).fail(function(err) { console.log("error loading json: " + err); });


        },

        saveScenario: function() {
            var mqttEvents = [];
            var saveObject = {};
            var events = $("#mqttEvents").find(".mqtt-event");
            var fileName = $("#scenarioName").val();
            var drivePath = $(".drivepath-select").val();
            var drivePathName = $(".drivepath-select option:selected").text();
            saveObject.drivePath = drivePath;
            saveObject.drivePathName = drivePathName;
            
            if (!fileName || fileName == '') {
                alert("Please enter a file name.");
                return;
            }

            fileName += ".json";

            $.each(events, function (i, v) {
                var subscribe = $(v).find(".mqtt-subscribe").first();
                var mqttEvent = parseContainer(subscribe);
                mqttEvent.widgets = [];

                var widgets = $(v).find('.event');
                $.each(widgets, function(index, value) {
                    mqttEvent.widgets.push(parseContainer($(value)));
                });

                mqttEvents.push(mqttEvent);
            });

            saveObject.events = mqttEvents;
            var data = {};
            data.fileName = fileName;
            data.contents = JSON.stringify(saveObject);
            socket.emit("saveSenerio", data );
        },

        removeEvent: function(button) {
            var div = $(button).parent().parent();
            div.remove();
        },

        collapseEvent: function(link) {
            var div = $(link).parent().parent().find('.collapsible').first();
            div.toggle();

            var icon = $(link).find('.glyphicon').first();

            if (icon.hasClass("glyphicon-arrow-down")) {
                icon.removeClass("glyphicon-arrow-down");
                icon.addClass("glyphicon-arrow-up");
            } else {
                icon.removeClass("glyphicon-arrow-up");
                icon.addClass("glyphicon-arrow-down");
            }
        },

        removeListenerEvent: function(elm) {
            elm.parent().parent().remove();
        }
    };

    return configController;
}
