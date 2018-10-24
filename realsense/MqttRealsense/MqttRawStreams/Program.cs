/*******************************************************************************

INTEL CORPORATION PROPRIETARY INFORMATION
This software is supplied under the terms of a license agreement or nondisclosure
agreement with Intel Corporation and may not be copied or disclosed except in
accordance with the terms of that agreement
Copyright(c) 2013 Intel Corporation. All Rights Reserved.

*******************************************************************************/
using System;
using System.Windows.Forms;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using RS = Intel.RealSense;
using Utils;
using System.IO;

namespace MqttRawStreams
{
    static class Program
    {
        /// <summary>
        /// The main entry point for the application.
        /// </summary>
        [STAThread]
        static void Main()
        {
            Application.EnableVisualStyles();
            Application.SetCompatibleTextRenderingDefault(false);

            RS.Session session = RS.Session.CreateInstance();
            String path = Environment.CurrentDirectory + Path.DirectorySeparatorChar + "config.json";
            MqttRawStreamsConfig config = null;
            //read config
            try
            {
                Console.WriteLine("Reading configuration from " + path);
                JsonUtil.readConfiguration(path, out config);
            }
            catch (Exception)
            {
                Console.WriteLine("Could not read configuration from " + path);
                Console.WriteLine("Using default configuration...");
                config = new MqttRawStreamsConfig();
                JsonUtil.writeConfiguration(path, config);
            }

            MqttListener client = new MqttListener(config.connectionString, config.topic, null, null);
            client.connect();
            if (session != null)
            {
                Application.Run(new MainForm(session, client));
                session.Dispose();
            }

            if (client != null) client.disconnect();
        }
    }

    class MqttRawStreamsConfig
    {
        public string connectionString = "tcp://127.0.0.1:1883";
        public string topic = "RealSenseRecorder/#";
    }
}
