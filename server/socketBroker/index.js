//relay messages from sockets to mqtt
// module.exports = function(mqttClient) {

//     this.subscribeConsoleEvents = function(socket) {
//         socket.on('consoleEvent', function(data) {
//             var stringData = data.message ? JSON.stringify(data.message) : '';
//             var consoleId;
//             if (stringData) {
//               consoleId = data.message.console;
//             }
//             console.log('socketBroker: publish to MQTT ' + data.eventName + '->' + stringData + "::" + consoleId);
//             mqttClient.publish(data.eventName, stringData == '' ? null : stringData);
//         });
//     };





//     return this;
// };

//relay messages from sockets to mqtt
 module.exports = function (mqttClient) {
     this.subscribeConsoleEvents = function(socket) {
       
         socket.on('consoleEvent', function(data) {
                
             var stringData = data.message ? JSON.stringify(data.message) : '';
             console.log('socketBroker: publish to MQTT ' + data.eventName + '->' + stringData)
             mqttClient.publish(data.eventName, stringData == '' ? null : stringData);
         });
     };
     return this;
 };