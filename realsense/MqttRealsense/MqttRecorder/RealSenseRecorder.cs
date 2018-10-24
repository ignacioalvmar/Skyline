using System;
using System.Collections.Generic;
using System.Threading;
using RS = Intel.RealSense;
using Utils;
using static Utils.JsonUtil;
using static MqttRecorder.RealSenseUtil;
using System.IO;


namespace MqttRecorder
{
    public class RealSenseRecorder
    {
        public bool mirror = false;
        private bool stop = false;
        public bool synced = true;
        public string topic = "RealSenseRecorder/#";
        public int camera;
        //path to store location and config file
        public string path = Environment.CurrentDirectory + Path.DirectorySeparatorChar;

        /*Select desired streams and options*/
        //Streams: STREAM_TYPE_COLOR, STREAM_TYPE_DEPTH, STREAM_TYPE_IR
        //Options:
        // Mandatory mask:              0xFFFF0000
        // Depth confidence mode:       0x00020000
        // Unrectified streams:         0x00010000
        // Optional mask:               0x0000FFFF
        // Depth precalculate UV map:   0x00000001
        // Strong stream sync:          0x00000002
        public string[] Streams = {
            "STREAM_TYPE_COLOR, PIXEL_FORMAT_YUY2,  1280, 720, 30, 0x00000",
            "STREAM_TYPE_DEPTH, PIXEL_FORMAT_DEPTH,  640, 480, 60, 0x00000",
            "STREAM_TYPE_IR,    PIXEL_FORMAT_Y16,    640, 480, 60, 0x00000",
        };

        public string connectionString = "tcp://127.0.0.1:1883";

        private MqttListener client;                //handles mqtt connection
        private Thread recordingThread;             //thread for recording streams
        private RS.Session session = null;          //RS session object

        /* Main method */
        private void record()
        {
            /* Create an instance of the RS.SenseManager interface */
            RS.SenseManager sm = null;
            try
            {
                createSession();
                List<RS.DeviceInfo> devices;
                Dictionary<RS.DeviceInfo, int> devices_iuid;

                //get available record devices
                getDevices(session, false, out devices, out devices_iuid);

                //select the first device
                var selectedDevice = devices[camera];
                Console.WriteLine("We will record on:" + selectedDevice.name);

                //get available stream profiles
                var streams = getAvailableStreamProfiles(session, selectedDevice, devices_iuid);

                //get stream profiles for selected streams
                RS.StreamProfileSet StreamProfileSet = new RS.StreamProfileSet();
                foreach (String c in Streams)
                    choiceToProfile(c, streams, StreamProfileSet);

                //check stream compatibility
                validateStreams(session, selectedDevice, StreamProfileSet);

                /* Create an instance of the RS.SenseManager interface */
                sm = RS.SenseManager.CreateInstance();

                if (sm == null)
                {
                    throw new Exception("Failed to create an SDK pipeline object");
                }

                //record to file
                string filename = this.path + DateTime.Now.ToString("yyy-MM-dd_HH-mm-ss.fff") + ".rssdk";
                Console.WriteLine("Saving to " + filename);
                sm.CaptureManager.SetFileName(filename, true);

                //device to record from
                sm.CaptureManager.FilterByDeviceInfo(selectedDevice);

                /* Set Color & Depth Resolution and enable streams */
                if (StreamProfileSet != null)
                {
                    /* Optional: Filter the data based on the request */
                    sm.CaptureManager.FilterByStreamProfiles(StreamProfileSet);

                    /* Enable raw data streaming for specific stream types */
                    for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                    {
                        RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                        RS.StreamProfile info = StreamProfileSet[st];
                        if (info.imageInfo.format != 0)
                        {
                            /* For simple request, you can also use sm.EnableStream(...) */
                            RS.DataDesc desc = new RS.DataDesc();
                            desc.streams[st].frameRate.min = desc.streams[st].frameRate.max = info.frameRate.max;
                            desc.streams[st].sizeMin.height = desc.streams[st].sizeMax.height = info.imageInfo.height;
                            desc.streams[st].sizeMin.width = desc.streams[st].sizeMax.width = info.imageInfo.width;
                            desc.streams[st].options = info.options;
                            desc.receivePartialSample = true;
                            RS.SampleReader sampleReader = RS.SampleReader.Activate(sm);
                            sampleReader.EnableStreams(desc);
                        }
                    }
                }

                /* nitialization */
                RS.Status status = sm.Init();
                if (status >= RS.Status.STATUS_NO_ERROR)
                {
                    /* Reset all properties */
                    sm.CaptureManager.Device.ResetProperties(RS.StreamType.STREAM_TYPE_ANY);

                    /* Set mirror mode */
                    RS.MirrorMode mirrorMode = mirror ? RS.MirrorMode.MIRROR_MODE_HORIZONTAL : RS.MirrorMode.MIRROR_MODE_DISABLED;
                    sm.CaptureManager.Device.MirrorMode = mirrorMode;

                    //SetStatus("Streaming");
                    while (!stop)
                    {
                        /* Wait until a frame is ready: Synchronized or Asynchronous */
                        if (sm.AcquireFrame(synced) < RS.Status.STATUS_NO_ERROR)
                            break;

                        RS.Sample sample = sm.Sample;


                        /*do nothing with the frame*/

                        //release
                        sm.ReleaseFrame();
                    }
                }
                else
                {
                    Console.WriteLine("Init failed:" + status.ToString());
                }
            }
            catch (Exception e)
            {
                Console.WriteLine("Exception occurred: " + e.Message);
                if (e.InnerException != null)
                    Console.WriteLine("Cause:" + e.InnerException.Message);
                Console.WriteLine("trace: " + e.StackTrace);
            }
            finally
            {
                if (sm != null) sm.Dispose();
            }
        }

        private void createSession()
        {
            if (session == null)
                session = RS.Session.CreateInstance();
        }

        /*Starts mqtt client*/
        public void start()
        {
            client = new MqttListener(connectionString, topic, OnStartRecording, OnStopRecording);
            client.connect();
        }

        public bool testCamera()
        {
            createSession();

            List<RS.DeviceInfo> devices;
            Dictionary<RS.DeviceInfo, int> devices_iuid;
            getDevices(session, true, out devices, out devices_iuid);
            foreach (RS.DeviceInfo dev in devices)
            {
                if (dev.name.Contains("RealSense")) return true; 
            }
            return false;
        }

        /*Stops recording thread and disconnects mqtt client*/
        public void exit()
        {
            OnStopRecording();
            client.disconnect();
            if (session != null) session.Dispose();
        }

        /*Recording is required, launch thread*/
        private void OnStartRecording()
        {
            if (recordingThread == null || !recordingThread.IsAlive)
            {
                recordingThread = new Thread(record);
                recordingThread.Name = "RealSense recorder";
                recordingThread.IsBackground = true;
                recordingThread.Start();
            }
        }

        /*Recording must be stopped*/
        private void OnStopRecording()
        {
            stop = true;
            if (recordingThread != null && recordingThread.IsAlive)
            {
                recordingThread.Join();
                recordingThread = null;
            }
            stop = false;
        }
    }
}
