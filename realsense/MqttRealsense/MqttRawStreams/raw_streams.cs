using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Linq;
using System.Text;
using RS = Intel.RealSense;

namespace MqttRawStreams
{
    class RenderStreams
    {
        public event EventHandler<UpdateStatusEventArgs> UpdateStatus=null;
        public event EventHandler<RenderFrameEventArgs> RenderFrame = null;
        public bool Playback { get; set; }
        public bool Record { get; set; }
        public String File { get; set; }
        public bool Mirror { get; set; }
        public bool Stop { get; set; }

        public RS.DeviceInfo DeviceInfo { get; set; }

        public RS.StreamProfileSet StreamProfileSet { get; set; }
        public RS.StreamType MainPanel { get; set; }
        public RS.StreamType PIPPanel { get; set; }
        public bool Synced { get; set; }

        public RenderStreams()
        {
            Playback = false;
            Record = false;
            File = null;
            DeviceInfo=null;
            StreamProfileSet = null;
            Mirror = true;
            Stop = false;
            MainPanel = RS.StreamType.STREAM_TYPE_ANY;
            PIPPanel = RS.StreamType.STREAM_TYPE_ANY;
            Synced = true;
        }

        private void SetStatus(String text) {
            EventHandler<UpdateStatusEventArgs> handler=UpdateStatus;
            if (handler!=null) {
                handler(this, new UpdateStatusEventArgs(text));
            }
        }

        public void StreamColorDepth() /* Stream Color and Depth Synchronously or Asynchronously */
        {
            try
            {
                bool sts = true;

                /* Create an instance of the RS.SenseManager interface */
                RS.SenseManager sm = RS.SenseManager.CreateInstance();

                if (sm == null)
                {
                    SetStatus("Failed to create an SDK pipeline object");
                    return;
                }

                /* Optional: if playback or recoridng */
                if ((Playback || Record) && File != null)
                    sm.CaptureManager.SetFileName(File, Record);

                /* Optional: Set Input Source */
                if (!Playback && DeviceInfo != null)
                    sm.CaptureManager.FilterByDeviceInfo(DeviceInfo);

                /* Set Color & Depth Resolution and enable streams */
                if (StreamProfileSet != null)
                {
                    /* Optional: Filter the data based on the request */
                    sm.CaptureManager.FilterByStreamProfiles(StreamProfileSet);

                    /* Enable raw data streaming for specific stream types */
                    for (int s=0; s<RS.Capture.STREAM_LIMIT; s++) 
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

                /* Initialization */
                Timer timer = new Timer();
                timer.UpdateStatus += UpdateStatus;

                SetStatus("Init Started");
                if (sm.Init() >= RS.Status.STATUS_NO_ERROR)
                {
                    /* Reset all properties */
                    sm.CaptureManager.Device.ResetProperties(RS.StreamType.STREAM_TYPE_ANY);

                    /* Set mirror mode */
                    RS.MirrorMode mirror = Mirror ? RS.MirrorMode.MIRROR_MODE_HORIZONTAL : RS.MirrorMode.MIRROR_MODE_DISABLED;
                    sm.CaptureManager.Device.MirrorMode = mirror;

                    SetStatus("Streaming");
                    while (!Stop)
                    {
                        /* Wait until a frame is ready: Synchronized or Asynchronous */
                        if (sm.AcquireFrame(Synced) < RS.Status.STATUS_NO_ERROR)
                            break;

                        /* Display images */
                        RS.Sample sample = sm.Sample;

                        /* Render streams */
                        EventHandler<RenderFrameEventArgs> render = RenderFrame;
                        RS.Image image = null;
                        if (MainPanel != RS.StreamType.STREAM_TYPE_ANY && render != null)
                        {
                            image = sample[MainPanel];
                            render(this, new RenderFrameEventArgs(0, image));
                        }

                        if (PIPPanel != RS.StreamType.STREAM_TYPE_ANY && render != null)
                            render(this, new RenderFrameEventArgs(1, sample[PIPPanel]));

                        /* Optional: Set Mirror State */
                        mirror = Mirror ? RS.MirrorMode.MIRROR_MODE_HORIZONTAL : RS.MirrorMode.MIRROR_MODE_DISABLED;
                        if (mirror != sm.CaptureManager.Device.MirrorMode)
                            sm.CaptureManager.Device.MirrorMode = mirror;

                        /* Optional: Show performance tick */

                        if (image!=null) timer.Tick(RS.ImageExtension.PixelFormatToString(image.Info.format)+" "+image.Info.width+"x"+image.Info.height);

                        sm.ReleaseFrame();
                    }
                }
                else
                {
                    SetStatus("Init Failed");
                    sts = false;
                }

                sm.Dispose();
                if (sts) SetStatus("Stopped");
            }
            catch (Exception e) {
                SetStatus(e.GetType().ToString());
            }
        }
    }
}
