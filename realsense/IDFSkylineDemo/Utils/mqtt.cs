using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using uPLibrary.Networking.M2Mqtt;
using uPLibrary.Networking.M2Mqtt.Messages;

namespace Utils
{
    public class MQTTClient
    {
        private MqttClient mClient;
        private string clientId = "Realsense:" + Guid.NewGuid().ToString();

        //mqtt csnfiguration
        private String mqtt_server;
        private int mqtt_port;
        private string mqtt_topic;
        private byte mqtt_qos;
        private ushort mqtt_keepalive;
        private int mqtt_timeout;

        public MQTTClient(String server, int port, string topic, byte qos, ushort keepalive, int timeout)
        {
            mqtt_server = server;
            mqtt_port = port;
            mqtt_topic = topic;
            mqtt_qos = qos;
            mqtt_keepalive = keepalive;
            mqtt_timeout = timeout;
            mClient = new MqttClient(mqtt_server);
            mClient.MqttMsgPublishReceived += client_MqttMsgPublishReceived;
            connect();
        }

        private void connect()
        {
            try
            {
                mClient.Connect(clientId, null, null, true, mqtt_keepalive);
            }
            catch (Exception e)
            {
                Console.WriteLine("Error: " + e.Message);
            }
        }

        public void publish(string message, string topic, bool asSubtopic)
        {
            if (!mClient.IsConnected) connect();
            else
            {
                try
                {
                    string t;
                    if (asSubtopic) t = mqtt_topic + "/" + topic;
                    else t = topic;
                    mClient.Publish(t, Encoding.UTF8.GetBytes(message), mqtt_qos, false);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error: " + e.Message);
                }
            }
        }
        public void publish(string message, string subtopic)
        {
            publish(message, subtopic, true);
        }

        public void subscribe(string[] topics, receiveJson callback)
        {
            if (topics != null && topics.Length > 0)
            {
                byte[] qos = new byte[topics.Length];
                for (int i = 0; i < topics.Length; i++)
                {
                    qos[i] = 2;
                }
                try
                {
                    this.subscribeAction += callback;
                    mClient.Subscribe(topics, qos);
                }
                catch (Exception e)
                {
                    Console.WriteLine("Error: " + e.Message);
                }
            }
        }

        public delegate void receiveJson(string topic, string json);

        private receiveJson subscribeAction;

        private void client_MqttMsgPublishReceived(object sender, MqttMsgPublishEventArgs e)
        {
            this.subscribeAction?.Invoke(e.Topic, Encoding.UTF8.GetString(e.Message));
        }

        public void disconnect()
        {
            if(mClient!=null && mClient.IsConnected) mClient.Disconnect();            
        }
    }
}
