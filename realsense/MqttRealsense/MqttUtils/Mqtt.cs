using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MqttLib;
using Newtonsoft.Json.Linq;

namespace Utils
{
    public delegate void OnStartRecording();
    public delegate void OnStopRecording();

    public class MqttListener
    {
        private IMqtt _client;
        private string topic, connectionString, clientString;
        public OnStartRecording onStartRecording;
        public OnStopRecording onStopRecording;

        public MqttListener(string connectionString, string topic, OnStartRecording onRec, OnStopRecording onStop)
        {
            Random rnd = new Random();
            this.clientString = "RealSenseRecorder" + "_" + rnd.Next();
            this.connectionString = connectionString;
            this.topic = topic;
            this.onStartRecording = onRec;
            this.onStopRecording = onStop;
        }

        public void connect()
        {
            if (_client != null && _client.IsConnected) _client.Disconnect();

            _client = MqttClientFactory.CreateClient(connectionString, clientString);

            // Setup some useful client delegate callbacks
            _client.Connected += new ConnectionDelegate(client_Connected);
            _client.ConnectionLost += new ConnectionDelegate(client_ConnectionLost);
            _client.PublishArrived += new PublishArrivedDelegate(client_PublishArrived);
            _client.Subscribed += new CompleteDelegate(client_Subscribed);
            _client.Published += new CompleteDelegate(client_Published);
            _client.Unsubscribed += new CompleteDelegate(client_Unsubscribed);

            _client.Connect();
        }

        public void disconnect()
        {
            if(_client!=null && _client.IsConnected) _client.Disconnect();
        }

        private void client_Connected(object sender, EventArgs e)
        {
            Console.WriteLine("Client connected\n");
            RegisterOurSubscriptions();
        }

        private void client_ConnectionLost(object sender, EventArgs e)
        {
            Console.WriteLine("Client connection lost\n");
        }

        private void client_Subscribed(object sender, CompleteArgs e)
        {
            Console.WriteLine("Client Subscribed\n");
        }

        private void client_Published(object sender, CompleteArgs e)
        {
            Console.WriteLine("Client published\n");
        }

        private void client_Unsubscribed(object sender, CompleteArgs e)
        {
            Console.WriteLine("Client Unsubscribed\n");
        }

        private void RegisterOurSubscriptions()
        {
            Console.WriteLine("Subscribing to " + topic);
            _client.Subscribe(topic, QoS.BestEfforts);
            _client.Subscribe("doSendSkyniviRawMQTT/#", QoS.BestEfforts);
        }

        public void PublishSomething(string topic, string message)
        {
            Console.WriteLine("Publishing on " + topic);
            _client.Publish(topic, message, QoS.BestEfforts, false);
        }

        bool client_PublishArrived(object sender, PublishArrivedArgs e)
        {
            Console.WriteLine("Received Message");
            Console.WriteLine("Topic: " + e.Topic);
            Console.WriteLine("Payload: " + e.Payload);
            Console.WriteLine();
            string topic = e.Topic;

            if(topic.StartsWith("doSendSkyniviRawMQTT"))
            {
                var json = JObject.Parse(e.Payload);
                topic = json["topic"].ToString();
            }

            if (topic.Contains("record") || topic.Contains("start"))
            {
                onStartRecording?.Invoke();
            }
            else if (topic.Contains("stop"))
            {
                onStopRecording?.Invoke();
            }
            return true;
        }
    }
}
