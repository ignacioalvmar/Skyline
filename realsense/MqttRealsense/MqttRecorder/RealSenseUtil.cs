using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using RS = Intel.RealSense;

namespace MqttRecorder
{
    class RealSenseUtil
    {
        /* Gets available devices list */
        public static void getDevices(RS.Session session, bool print, out List<RS.DeviceInfo> devices, out Dictionary<RS.DeviceInfo, int> devices_iuid)
        {
            devices = new List<RS.DeviceInfo>();
            devices_iuid = new Dictionary<RS.DeviceInfo, int>();

            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;

            for (int i = 0; ; i++)
            {
                RS.ImplDesc desc1 = session.QueryImpl(desc, i);
                if (desc1 == null)
                    break;
                RS.Capture capture;
                if (session.CreateImpl<RS.Capture>(desc1, out capture) < RS.Status.STATUS_NO_ERROR) continue;
                for (int j = 0; ; j++)
                {
                    RS.DeviceInfo dinfo;
                    if (capture.QueryDeviceInfo(j, out dinfo) < RS.Status.STATUS_NO_ERROR) break;
                    if (print) Console.WriteLine("Camera device " + devices.Count + ": " + dinfo.name);
                    devices_iuid.Add(dinfo, desc1.iuid);
                    devices.Add(dinfo);
                }
                if(capture!=null) capture.Dispose();
            }
            //return devices;
        }

        /* Get available streams profiles for device */
        public static Dictionary<RS.StreamType, List<RS.StreamProfile>> getAvailableStreamProfiles(RS.Session session, RS.DeviceInfo deviceInfo, Dictionary<RS.DeviceInfo, int> devices_iuid)
        {
            Dictionary<RS.StreamType, List<RS.StreamProfile>> prof = new Dictionary<RS.StreamType, List<RS.StreamProfile>>();

            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;
            desc.iuid = devices_iuid[deviceInfo];
            desc.cuids[0] = RS.Capture.CUID;

            RS.Capture capture;
            RS.Status status = session.CreateImpl<RS.Capture>(desc, out capture);
            if (status >= RS.Status.STATUS_NO_ERROR)
            {
                RS.Device device = capture.CreateDevice(deviceInfo.didx);
                if (device != null)
                {
                    RS.StreamProfileSet profile = new RS.StreamProfileSet();
                    for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                    {
                        RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                        if (((int)deviceInfo.streams & (int)st) != 0)
                        {
                            int num = device.QueryStreamProfileSetNum(st);
                            for (int p = 0; p < num; p++)
                            {
                                if (device.QueryStreamProfileSet(st, p, out profile) < RS.Status.STATUS_NO_ERROR) break;
                                var key = st;
                                if (!prof.ContainsKey(key))
                                    prof[key] = new List<RS.StreamProfile>();
                                prof[key].Add(profile[st]);
                            }
                        }
                    }
                    device.Dispose();
                }
            }
            else
            {
                Console.WriteLine("getAvailableStreamProfiles() capture status:" + status.ToString());
            }
            if (capture != null) capture.Dispose();
            return prof;
        }

        public static void choiceToProfile(string choice, Dictionary<RS.StreamType, List<RS.StreamProfile>> profiles, RS.StreamProfileSet sps)
        {
            var selection = choice.Split(',');
            RS.StreamType type;
            Enum.TryParse<RS.StreamType>(selection[0].Trim(), out type);
            RS.PixelFormat format;
            Enum.TryParse<RS.PixelFormat>(selection[1].Trim(), out format);
            int width = int.Parse(selection[2].Trim());
            int height = int.Parse(selection[3].Trim());
            int framerate = int.Parse(selection[4].Trim());
            int mandatory = (int)RS.StreamOption.STREAM_OPTION_ANY;
            int optional = (int)RS.StreamOption.STREAM_OPTION_ANY;
            if (selection.Length == 6)
            {
                //can be a number or Enums
                int mask = (int)RS.StreamOption.STREAM_OPTION_ANY;
                try
                {
                    mask = Convert.ToInt32(selection[5].Trim(), 16);
                }
                catch (Exception)
                {
                    string[] options = selection[5].Trim().Split('|');
                    foreach (String s in options)
                    {
                        RS.StreamOption opt;
                        Enum.TryParse<RS.StreamOption>(s.Trim(), out opt);
                        mask |= (int)opt;
                    }
                }

                //mandatory options: If the option is supported - the device sets this flag in the profile
                //we filter the available profiles with these
                mandatory = (int)RS.StreamOption.STREAM_OPTION_MANDATORY_MASK & mask;

                //optional options: The option can be added to any profile, but not necessarily supported for any profile
                //we add these to the selected profile
                optional = (int)RS.StreamOption.STREAM_OPTION_OPTIONAL_MASK & mask;
            }

            if (profiles.ContainsKey(type))
            {
                var available = profiles[type].FindAll(x => x.imageInfo.format == format &&
                                                   x.imageInfo.width == width &&
                                                   x.imageInfo.height == height &&
                                                   x.frameRate.min == framerate &&
                                                   (int)x.options == mandatory);

                if (available.Count == 1)
                {
                    available[0].options |= (RS.StreamOption)optional;
                    sps[type] = available[0];
                }
                else throw new Exception("No StreamProfile found for choice: " + choice + ". Streamprofiles available: " + printProfiles(profiles));
            }
            else
            {
                throw new Exception("No StreamProfile found for choice: " + choice + ". Streamprofiles available: " + printProfiles(profiles));
            }
        }

        private static string printProfiles(Dictionary<RS.StreamType, List<RS.StreamProfile>> profiless)
        {
            StringBuilder sb = new StringBuilder();
            foreach (RS.StreamType st in profiless.Keys)
            {
                sb.Append("\n").Append(st).Append(":\n");
                foreach (RS.StreamProfile sp in profiless[st])
                {
                    sb.Append("\t"+sp.imageInfo.format + "\t" + sp.imageInfo.width + "x" + sp.imageInfo.height+"\t" + sp.frameRate.max).Append("fps\n");
                }
                sb.Append("\n");
            }
            return sb.ToString();
        }

        public static void validateStreams(RS.Session session, RS.DeviceInfo deviceInfo, RS.StreamProfileSet profiles)
        {
            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;
            desc.iuid = deviceInfo.duid;
            desc.cuids[0] = RS.Capture.CUID;
            RS.Capture capture = null;
            RS.Device device = null;
            try
            {
                if (session.CreateImpl<RS.Capture>(desc, out capture) >= RS.Status.STATUS_NO_ERROR)
                {
                    device = capture.CreateDevice(deviceInfo.didx);
                    if (device != null)
                    {
                        bool valid = device.IsStreamProfileSetValid(profiles);
                        if (!valid) throw new Exception("StreamProfileSet is not valid!");
                    }
                }
            }
            finally
            {
                if (device != null) device.Dispose();
                if (capture != null) capture.Dispose();
            }
        }
    }
}
