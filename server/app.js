/**
 * Module dependencies.
 */
var express     = require('express');
var routes      = require('./routes');
var http        = require('http');
var path        = require('path');
var ejs         = require('ejs');
var fs          = require('fs');
var io          = require ('socket.io');
var client      = require('mqtt').connect({host:'localhost', port:1883});

var exp = express();

//CONFIGURE THE APP
require('./config')(exp, process, __dirname, express, path, routes, ejs);

var app = http.createServer(exp);

app.listen(exp.get('port'), function(){
  console.log('Express server listening on port ' + exp.get('port'));
});


//CLIENT SOCKET MANAGER
var socketListner = io.listen(app);

//DISTRIBUTES MESSAGES FROM MQTT TO CONSOLES
var mqttBroker = require('./mqttBroker')(client);

// RELAYS EVENTS FROM CONSOLES TO MQTT
var socketBroker = require('./socketBroker')(client);

// KEEPS AND DISTRIBUTES GLOBAL STATE KEY/VALUE PAIRS
var carState = require('./carState')(client);

//CONFIGURE SKYNIVI
require('./skynivi')(exp, fs);

socketListner.sockets.on('connection', function(socket) {
    console.log("SkylineHMI: connection for the UI widgets");
    console.log("socket connected");

    // we probably won't call subscribe until we tell the console which widgets it has and where they go (using consoleConfigData)
    socket.on('subscribe', function(data){
        mqttBroker.subscribe(data.name, data.console, socket);
    });

    socket.on("getAudioFiles", function() {
        fs.readdir("./server/public/assets/audio/player", function(err, files)
        {
            if (err) console.log(err);
            var mp3 = files.filter(function(file){
                return file.substr(-4) === '.mp3';
            });
            socket.emit("audio_file_names", JSON.stringify(mp3));
        });
    });

    socket.on("doSendMQTT", function(data){

        client.publish(data.topic, data.data);
    });

    socket.on("subscriptionEvent", function(data) {
        if (data.event_name == "telemetryUpdate") tUpdate(data);
        else client.publish(data.event_name, JSON.stringify(data));
    });

    socket.on("subscriptionEventFromAdmin", function(data) {

        if (data.event_name == "telemetryUpdate") tUpdate(data);
        else client.publish(data.event_name, '');

    });

    socket.on("saveSenerio", function(data) {
        fs.writeFile("./journeys/" + data.fileName, data.contents, "utf8", function(err) {
            if (err) socket.emit("file_saved", JSON.stringify(err));
            else console.log("file was saved");
            socket.emit("file_saved", "File was saved Successfully");
        });
    });
    socket.on("getFileNames", function() {
        fs.readdir("./journeys", function(err, files) {
            if (err) console.log(err);
            socket.emit("scenario_file_names", JSON.stringify(files));
        });
    });

    socket.on("createLoadScenario", function(data){
        fs.readFile("./journeys/" + data, "utf8", function(err, file) {
            if (err) console.log(err);
            var r = {};
            r.fileName = data;
            r.file =file;
            socket.emit("builderLoadFile", r);
        });
    });
    socket.on("refresh_console", function(data){
        client.publish("demo.reinitialize", '{"console":"CC","quadrant": "full","event_name":"demo.reinitialize"}');
        client.publish("demo.reinitialize", '{"console":"PASS","quadrant": "full","event_name":"demo.reinitialize"}');
        client.publish("demo.reinitialize", '{"console":"phone","quadrant": "full","event_name":"demo.reinitialize"}');
        client.publish("demo.reinitialize", '{"console":"IP","quadrant": "full","event_name":"demo.reinitialize"}');
        client.publish("demo.reinitialize", '{"console":"HUD","quadrant": "full","event_name":"demo.reinitialize"}');

    });
    socket.on("loadScenario", function(data) {
        fs.readFile("./journeys/" + data.fileName, "utf8", function(err, file) {
            if (err) console.log(err);
            mqttBroker.loadScenario(JSON.parse(file).events, socket);
            socket.emit("scenario_file_data", file);
        });
    });

    socket.on("save_log", function(data){
        var rightNow = new Date();
        var log_file_name = "log_file_" + Date.now().toString();
        console.log(log_file_name);

        fs.writeFile("./server/external_json/logs/" + log_file_name, data.logData, "utf8", function(err) {
            if (err) socket.emit("file_saved", JSON.stringify(err));
            else console.log("file was saved");
            socket.emit("file_saved", "File was saved Successfully");
        });
    })

    socket.on('mockTelemetryUpdate', function(data) {
        sendTelemetry(data);
    });


    //SUBSCRIBE TO EVENTS FROM THE CONSOLES
    socketBroker.subscribeConsoleEvents(socket);
});
