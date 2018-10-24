// Module that receives key/value pairs, creates a collection of those
//    values and sends out all the key/value pairs when any are updated.
// Used to hold global car state that can be passed between the display widgets.
// Topics: car/state/set -- set a key/value pair
//              Data is "{"KEYNAME": KEYVALUE}
//              Can include multiple key/value pairs
//              The data will replace any existing value with that KEYNAME
//              Reception of this causes an update message to be sent out
//         car/state/reset -- clears the set of stored key/value pairs
//              Reception of this causes an update message to be sent out
//         scenario_start -- clears the set of stored key/value pairs
//              Reception of this causes an update message to be sent out
//         refresh_console -- clears the set of stored key/value pairs
//              Reception of this causes an update message to be sent out
//         car/state/update -- topic that all data is sent on
//
module.exports = function (mqttClient) {

    var dataset = {};

    mqttClient.on('connect', function(){
		console.log("Car state: MQTT connected");
		mqttClient.on('message', broker);

        mqttClient.subscribe("car/state/set");
        mqttClient.subscribe("car/state/reset");
        mqttClient.subscribe("scenario/event");
        mqttClient.subscribe("refresh_console");
	});

    function broker(topic, message) {
        var data = message && message != "" ? JSON.parse(message) : "";

        if (topic == "car/state/set") {
            for (var kvp in data) {
                dataset[kvp] = data[kvp];
                // console.log('Car state: remembering state ' + kvp + ' = ' + data[kvp]);
            }
            sendOutDataset();
        }
        if (topic == 'car/state/reset') {
            clearDataset();
            sendOutDataset();
        }
        if (topic == 'scenario/event') {
            if (data.id && data.id == 'scenario_start') {
                clearDataset();
                sendOutDataset();
            }
        }
        if (topic == 'refresh_console') {
            clearDataset();
            sendOutDataset();
        }
    }

    function clearDataset() {
        console.log('Car state: clearing dataset');
        dataset = {};
    }

    function sendOutDataset() {
        mqttClient.publish('car/state/update', JSON.stringify(dataset));
    }

}
