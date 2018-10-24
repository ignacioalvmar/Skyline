module.exports = function(mqttClient) {

    var nonTargetedEvents = [];
    var targetedEvents = [];
    var eventBroker = [];
    var activeSocket;

    mqttClient.on('connect', function() {
        console.log("MQTT connected");
        mqttClient.on('message', broker);

        mqttClient.subscribe("getAudioFiles");
    });

 //    function broker(topic, message) {
 //        console.log("topic: " + topic);
 //        console.log("message: " + message);

 //        var data = message && message != "" ? JSON.parse(message) : "";
 //        if (data.console && targetedEvents[topic] && targetedEvents[topic][data.console]) {
 //            targetedEvents[topic][data.console].emit(topic, data);
 //             console.log('mqttBroker: emit targeted ' + topic + '::' + data.console + '->' + JSON.stringify(data));
 //             console.log("more");
 //             console.log(targetedEvents);
 // } else {
 //              console.log('mqttBroker: emit non-targeted ' + topic + '->' + JSON.stringify(data));
 //             for (var socket in nonTargetedEvents[topic]) {
 //                 nonTargetedEvents[topic][socket].emit(topic, data);
 //            }
 //         }
 //    }

    function verifyTargetedSubscription(eventName) {
        if (!targetedEvents[eventName]) {
            targetedEvents[eventName] = [];
            mqttClient.subscribe(eventName);
        }
    }

    function verifyNonTargetedSubscription(eventName) {
        if (!nonTargetedEvents[eventName]) {
            nonTargetedEvents[eventName] = [];
            mqttClient.subscribe(eventName);
        }
    }

    this.subscribe = function(eventName, consoleName, socket) {
        if (consoleName) {
            console.log('mqttBroker: subscribe console/event = ' + consoleName + '/' + eventName);
            verifyTargetedSubscription(eventName);
            targetedEvents[eventName][consoleName] = socket;
        } else {
            console.log('mqttBroker: subscribe event = ' + eventName);
            verifyNonTargetedSubscription(eventName);
            nonTargetedEvents[eventName].push(socket);
        }
    };



     this.loadScenario = function(jsonFile, socket) {
        eventBroker = {};
        activeSocket = socket;
       

        mqttClient.subscribe("scenario/event");
        
        for (var item in jsonFile) {
            mqttClient.subscribe(jsonFile[item].subscribeEvent);
            eventBroker[jsonFile[item].subscribeEvent] = jsonFile[item].widgets;
        }
    };

   

    function broker(topic, message) {
        
        console.log("topic: " + topic);
        // console.log("message: " + message);
        //console.log(eventBroker);
        message = message == "" ? "" : JSON.parse(message);

        if (topic == "scenario/event") topic = message.id;

        console.log(topic);

        if (eventBroker[topic]) {
            var emitEvents = eventBroker[topic];
            for (var event in emitEvents) {
                var messageData = setMessageData(message, emitEvents[event]);
                // console.log(messageData);
                console.log("messagedata");
                if (emitEvents[event].console && targetedEvents[emitEvents[event].event_name] && targetedEvents[emitEvents[event].event_name][emitEvents[event].console]) {
                    
                                   
               console.log(emitEvents);
                    targetedEvents[emitEvents[event].event_name][emitEvents[event].console].emit(emitEvents[event].event_name, messageData);

                }
                mqttClient.publish(emitEvents[event].event_name, JSON.stringify(messageData));
                console.log(emitEvents[event].event_name);
                activeSocket.emit("scenario_event_published", { topic: topic, name: emitEvents[event].event_name, data: emitEvents[event], message: message });
                console.log("event_scenario");
            }
        }else{

            var data = message;
            if (data.console && targetedEvents[topic] && targetedEvents[topic][data.console]) {
                targetedEvents[topic][data.console].emit(topic, data);
                 // console.log('mqttBroker: emit targeted ' + topic + '::' + data.console + '->' + JSON.stringify(data));
                 console.log('mqttBroker: emit targeted ' + topic + '::' + data.console);
                 console.log("more");
                 
                } else {
                  // console.log('mqttBroker: emit non-targeted ' + topic + '->' + JSON.stringify(data));
                  console.log('mqttBroker: emit non-targeted ' + topic);
                 for (var socket in nonTargetedEvents[topic]) {
                     nonTargetedEvents[topic][socket].emit(topic, data);
                }
             }
        }
    }

    //set outgoing data to incoming data where there is a match
    function setMessageData(message, data) {
        for (var d in data) {
            if (message && message.hasOwnProperty(d)) data[d] = message[d];
        }
        return data;
    }   

    return this;
}