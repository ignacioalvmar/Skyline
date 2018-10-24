/**
* Audio recorder
* Author: Victor Palacios @ victor.h.palacios.rivera@intel.com
*/
"use strict";

const Sox = require('./sox.js');
var sox = new Sox({
    // see sox.js for default options
    sox_path: 'C:\\Program Files (x86)\\sox-14.4.2\\sox',

    // windows id of the recording device to use
    recordingDevice: '1', 
    verbose: true
});


var mqtt = require('mqtt');
var broker = 'mqtt://127.0.0.1';
var mclient = mqtt.connect(broker);

function onSubscribe(err, granted)
{
    console.log('Subscribed successfully to ' + granted[0].topic);
}

mclient.on('connect', function () 
{    
    console.log("\nConnected to MQTT broker: "+ broker);
    mclient.subscribe('RealSenseRecorder/#', 0, onSubscribe);
    mclient.subscribe('doSendSkyniviRawMQTT', 0, onSubscribe);
});

mclient.on('message', function (topic, message) 
{
    if(topic.startsWith("doSendSkyniviRawMQTT"))
    {
        var json = JSON.parse(message);
        topic = json.topic;
        message = json.data;
    }
    console.log("\nReceived mqtt message! >> topic:" + topic+", message:"+message);

    if (topic.includes("record") || topic.includes("start"))
    {
        sox.startRecording();
    }
    else if (topic.includes("stop"))
    {
        sox.stopRecording();
    }
});
