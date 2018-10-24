using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Utils;

namespace MqttRecorder
{
    public class Program
    {
        static void Main(string[] args)
        {
            AudioRecorder.listAudioDevices();

            RealSenseRecorder rec = null;
            try
            {
                string path;
                if (args.Length > 0) path = args[0];
                else path = Environment.CurrentDirectory + Path.DirectorySeparatorChar + "config.json";

                //read config
                try
                {
                    Console.WriteLine("Reading configuration from " + path);
                    JsonUtil.readConfiguration(path, out rec);
                }
                catch (Exception)
                {
                    Console.WriteLine("Could not read configuration from " + path);
                    Console.WriteLine("Using default configuration...");
                    rec = new RealSenseRecorder();
                    JsonUtil.writeConfiguration(path, rec);
                }

                Console.WriteLine("Configuration used: \n" + JsonUtil.SerializeObject(rec));
                rec.start();

                rec.testCamera();

                Console.WriteLine("Waiting for MQTT messages... Press enter if you want to exit.");
                Console.ReadLine();
                rec.exit();
            }
            catch (Exception e)
            {
                if (rec != null) rec.exit();
                Console.WriteLine("Exception occurred: " + e.Message);
                if (e.InnerException != null)
                    Console.WriteLine("Cause:" + e.InnerException.Message);
                Console.WriteLine("trace: " + e.StackTrace);
                Console.WriteLine("Press enter to exit...");
                Console.ReadLine();
            }
        }
    }
}
