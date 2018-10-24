using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Linq;
using System.Text;

namespace MqttRawStreams
{
    class Timer
    {
        [DllImport("Kernel32.dll")]
        private static extern bool QueryPerformanceCounter(out long data);
        [DllImport("Kernel32.dll")]
        private static extern bool QueryPerformanceFrequency(out long data);

        public event EventHandler<UpdateStatusEventArgs> UpdateStatus = null;
        private long freq, last;
        private int fps;

        public Timer()
        {
            QueryPerformanceFrequency(out freq);
            fps = 0;
            QueryPerformanceCounter(out last);
        }

        public void Tick(string text)
        {
            long now;
            QueryPerformanceCounter(out now);
            fps++;
            if (now - last > freq) // update every second
            {
                last = now;
                EventHandler<UpdateStatusEventArgs> handler=UpdateStatus;
                if (handler!=null) handler(this, new UpdateStatusEventArgs(text+" FPS=" + fps));
                fps = 0;
            }
        }
    }
}
