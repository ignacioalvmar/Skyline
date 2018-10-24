using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
using System.Data;
using System.Drawing;
using System.Drawing.Imaging;
using System.Linq;
using System.Text;
using System.Windows.Forms;
using SampleDX;
using RS = Intel.RealSense;
using Utils;

namespace MqttRawStreams
{
    public partial class MainForm : Form
    {
        private RS.Session session;
        private volatile bool closing = false;
        private int current_device_iuid = 0;
        private Dictionary<ToolStripMenuItem, RS.DeviceInfo> devices=new Dictionary<ToolStripMenuItem,RS.DeviceInfo>();
        private Dictionary<ToolStripMenuItem, int> devices_iuid=new Dictionary<ToolStripMenuItem,int>();
        private Dictionary<ToolStripMenuItem, RS.StreamProfile> profiles=new Dictionary<ToolStripMenuItem,RS.StreamProfile>();
        private ToolStripMenuItem[] streamMenus = new ToolStripMenuItem[RS.Capture.STREAM_LIMIT];
        private RadioButton[] streamButtons = new RadioButton[RS.Capture.STREAM_LIMIT];
        private ToolStripMenuItem[] streamNone = new ToolStripMenuItem[RS.Capture.STREAM_LIMIT];

        private D2D1Render[] renders = new D2D1Render[2] { new D2D1Render(), new D2D1Render() };
        private RenderStreams streaming = new RenderStreams();
        private MqttListener client;

        private void startRecording()
        {
            if (this.Start.InvokeRequired)
            {
                this.Start.BeginInvoke((MethodInvoker) delegate() 
                {
                    Start_Click(null, null);
                });
            }
            else Start_Click(null, null);
        }

        private void stopRecording()
        {
            if (this.Stop.InvokeRequired)
            {
                this.Stop.BeginInvoke((MethodInvoker)delegate ()
                {
                    Stop_Click(null, null);
                });
            }
            else Stop_Click(null, null);
        }

        public MainForm(RS.Session session, MqttListener client)
        {
            this.client = client;
            client.onStartRecording = startRecording;
            client.onStopRecording = stopRecording;

            InitializeComponent();
            /* Put stream menu items to array */
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_COLOR)] = ColorMenu;
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_DEPTH)] = DepthMenu;
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_IR)] = IRMenu;
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_LEFT)] = LeftMenu;
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_RIGHT)] = RightMenu;
            streamMenus[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_AUX_COLOR)] = AuxColorMenu;
            /* Put stream buttons to array */
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_COLOR)] = Color;
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_DEPTH)] = Depth;
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_IR)] = IR;
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_LEFT)] = IRLeft;
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_RIGHT)] = IRRight;
            streamButtons[RS.Capture.StreamTypeToIndex(RS.StreamType.STREAM_TYPE_AUX_COLOR)] = AuxColor;

            this.session = session;
            streaming.UpdateStatus += new EventHandler<UpdateStatusEventArgs>(UpdateStatusHandler);
            streaming.RenderFrame += new EventHandler<RenderFrameEventArgs>(RenderFrameHandler);
            FormClosing += new FormClosingEventHandler(FormClosingHandler);
            MainPanel.Paint += new PaintEventHandler(PaintHandler);
            PIPPanel.Paint += new PaintEventHandler(PaintHandler);
            MainPanel.Resize += new EventHandler(ResizeHandler);
            PIPPanel.Resize += new EventHandler(ResizeHandler);

            ResetStreamTypes();
            PopulateDeviceMenu();

            Scale2.CheckedChanged += new EventHandler(Scale_Checked);
            Mirror.CheckedChanged += new EventHandler(Mirror_Checked);

            foreach (RadioButton button in streamButtons)
                if(button != null) button.Click += new EventHandler(Stream_Click);
            
            renders[0].SetHWND(MainPanel);
            renders[1].SetHWND(PIPPanel);
        }

        private void PopulateDeviceMenu()
        {
            devices.Clear();
            devices_iuid.Clear();

            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;

            DeviceMenu.DropDownItems.Clear();

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

                    ToolStripMenuItem sm1 = new ToolStripMenuItem(dinfo.name, null, new EventHandler(Device_Item_Click));
                    devices[sm1] = dinfo;
                    devices_iuid[sm1] = desc1.iuid;
                    DeviceMenu.DropDownItems.Add(sm1);
                }
                capture.Dispose();
            }
            if (DeviceMenu.DropDownItems.Count > 0)
            {
                (DeviceMenu.DropDownItems[0] as ToolStripMenuItem).Checked = true;
                PopulateColorDepthMenus(DeviceMenu.DropDownItems[0] as ToolStripMenuItem);
            }
            else
            {
                ModeLive.Visible = false;
                ModeRecord.Visible = false;
                Start.Enabled = false;
                for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                {
                    if (streamMenus[s] != null)
                    {
                        streamMenus[s].Visible = false;
                        streamButtons[s].Visible = false;
                    }
                }
            }
        }

        private bool PopulateDeviceFromFileMenu()
        {
            devices.Clear();
            devices_iuid.Clear();

            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;

            RS.DeviceInfo dinfo;
            RS.ImplDesc desc1;
            RS.SenseManager pp = RS.SenseManager.CreateInstance();
            if (pp == null)
            {
                SetStatus("Init Failed");
                return false;
            }
            try
            {
                desc1 = session.QueryImpl(desc, 0);
                if (desc1 == null)
                    throw null;
                if (pp.CaptureManager.SetFileName(streaming.File, false) < RS.Status.STATUS_NO_ERROR) throw null;
                if (pp.CaptureManager.LocateStreams() < RS.Status.STATUS_NO_ERROR) throw null;
                pp.CaptureManager.Device.QueryDeviceInfo(out dinfo);
            }
            catch
            {
                pp.Dispose();
                SetStatus("Init Failed");
                return false;
            }
            DeviceMenu.DropDownItems.Clear();
            ToolStripMenuItem sm1 = new ToolStripMenuItem(dinfo.name, null, new EventHandler(Device_Item_Click));
            devices[sm1] = dinfo;
            devices_iuid[sm1] = desc1.iuid;
            DeviceMenu.DropDownItems.Add(sm1);

            sm1 = new ToolStripMenuItem("playback from the file : ", null);
            sm1.Enabled = false;
            DeviceMenu.DropDownItems.Add(sm1);
            sm1 = new ToolStripMenuItem(streaming.File, null);
            sm1.Enabled = false;
            DeviceMenu.DropDownItems.Add(sm1);
            if (DeviceMenu.DropDownItems.Count > 0)
                (DeviceMenu.DropDownItems[0] as ToolStripMenuItem).Checked = true;

            /* populate profile menus from the file */
            profiles.Clear();
            foreach (ToolStripMenuItem menu in streamMenus)
            {
                if (menu != null)
                    menu.DropDownItems.Clear();
            }

            RS.Device device = pp.CaptureManager.Device;
            if (device == null)
            {
                pp.Dispose();
                SetStatus("Init Failed");
                return false;
            }
            
            RS.StreamProfileSet profile = new RS.StreamProfileSet();

            for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
            {
                RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                if (((int)dinfo.streams & (int)st) != 0 && streamMenus[s] != null)
                {
                    streamMenus[s].Visible = true;
                    streamButtons[s].Visible = true;
                    int num = device.QueryStreamProfileSetNum(st);
                    for (int p = 0; p < num; p++)
                    {
                        if (device.QueryStreamProfileSet(st, p, out profile) < RS.Status.STATUS_NO_ERROR) break;
                        RS.StreamProfile sprofile = profile[st];
                        sm1 = new ToolStripMenuItem(ProfileToString(sprofile), null, new EventHandler(Stream_Item_Click));
                        profiles[sm1] = sprofile;
                        streamMenus[s].DropDownItems.Add(sm1);
                    }
                }
                else if (((int)dinfo.streams & (int)st) == 0 && streamMenus[s] != null)
                {
                    streamMenus[s].Visible = false;
                    streamButtons[s].Visible = false;
                }
            }

            for (int i = 0; i < RS.Capture.STREAM_LIMIT; i++)
            {
                ToolStripMenuItem menu = streamMenus[i];
                if (menu != null)
                {
                    streamNone[i] = new ToolStripMenuItem("None", null, new EventHandler(Stream_Item_Click));
                    profiles[streamNone[i]] = new RS.StreamProfile();
                    menu.DropDownItems.Add(streamNone[i]);
                    (menu.DropDownItems[0] as ToolStripMenuItem).Checked = true;
                }
            }
            Start.Enabled = true;
            
            CheckSelection();
            pp.Close();
            pp.Dispose();

            StatusLabel.Text = "Ok";
            return true;
        }

        private void PopulateColorDepthMenus(ToolStripMenuItem device_item)
        {
            RS.ImplDesc desc = new RS.ImplDesc();
            desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
            desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;
            desc.iuid = devices_iuid[device_item];
            current_device_iuid = desc.iuid;
            desc.cuids[0] = RS.Capture.CUID;

            profiles.Clear();
            foreach (ToolStripMenuItem menu in streamMenus)
            {
                if (menu != null)
                    menu.DropDownItems.Clear();
            }
            
            RS.Capture capture;
            RS.DeviceInfo dinfo2 = GetCheckedDevice(); 
            if (session.CreateImpl<RS.Capture>(desc, out capture) >= RS.Status.STATUS_NO_ERROR) {
                RS.Device device=capture.CreateDevice(dinfo2.didx);
                if (device!=null) {
                    RS.StreamProfileSet profile = new RS.StreamProfileSet();

                    for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                    {
                        RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                        if (((int)dinfo2.streams & (int)st) != 0 && streamMenus[s] != null)
                        {
                            streamMenus[s].Visible = true;
                            streamButtons[s].Visible = true;
                            int num = device.QueryStreamProfileSetNum(st);
                            for (int p = 0; p < num; p++)
                            {
                                if (device.QueryStreamProfileSet(st, p, out profile) < RS.Status.STATUS_NO_ERROR) break;
                                RS.StreamProfile sprofile = profile[st];
                                ToolStripMenuItem sm1 = new ToolStripMenuItem(ProfileToString(sprofile), null, new EventHandler(Stream_Item_Click));
                                profiles[sm1] = sprofile;
                                streamMenus[s].DropDownItems.Add(sm1);
                            }
                        }
                        else if (((int)dinfo2.streams & (int)st) == 0 && streamMenus[s] != null)
                        {
                            streamMenus[s].Visible = false;
                            streamButtons[s].Visible = false;
                        }
                    }
                    
                    device.Dispose();
                }
                capture.Dispose();
            }
            for (int i = 0; i < RS.Capture.STREAM_LIMIT; i++)
            {
                ToolStripMenuItem menu = streamMenus[i];
                if (menu != null)
                {
                    streamNone[i] = new ToolStripMenuItem("None", null, new EventHandler(Stream_Item_Click));
                    profiles[streamNone[i]] = new RS.StreamProfile();
                    menu.DropDownItems.Add(streamNone[i]);
                    if (menu == ColorMenu)
                        (menu.DropDownItems[0] as ToolStripMenuItem).Checked = true;
                    else
                        streamNone[i].Checked = true;
                }
            }
            
            CheckSelection();
        }

        private string StreamOptionToString(RS.StreamOption streamOption)
        {
	        switch (streamOption)
	        {
	        case RS.StreamOption.STREAM_OPTION_UNRECTIFIED:
		        return " RAW";
            case (RS.StreamOption)0x20000: // Depth Confidence
                return " + Confidence";
	        case RS.StreamOption.STREAM_OPTION_DEPTH_PRECALCULATE_UVMAP:
	        case RS.StreamOption.STREAM_OPTION_STRONG_STREAM_SYNC:
	        case RS.StreamOption.STREAM_OPTION_ANY:
		        return "";
	        default:
		        return " (" + streamOption.ToString() + ")";
	        }
        }

        private string ProfileToString(RS.StreamProfile pinfo)
        {
            string line = "Unknown ";
            if (Enum.IsDefined(typeof(RS.PixelFormat), pinfo.imageInfo.format))
                line = pinfo.imageInfo.format.ToString().Substring(13)+" "+pinfo.imageInfo.width+"x"+pinfo.imageInfo.height+"x";
            else
                line += pinfo.imageInfo.width + "x" + pinfo.imageInfo.height + "x";
            if (pinfo.frameRate.min != pinfo.frameRate.max) {
                line += (float)pinfo.frameRate.min + "-" +
                      (float)pinfo.frameRate.max;
            } else {
                float fps = (pinfo.frameRate.min!=0)?pinfo.frameRate.min:pinfo.frameRate.max;
                line += fps;
            }
            line += StreamOptionToString(pinfo.options);
            return line;
        }

        private void ResetStreamTypes()
        {
            streaming.MainPanel=streaming.PIPPanel=RS.StreamType.STREAM_TYPE_ANY;
        }

        private void Device_Item_Click(object sender, EventArgs e)
        {
            foreach (ToolStripMenuItem e1 in DeviceMenu.DropDownItems)
                e1.Checked = (sender == e1);
            PopulateColorDepthMenus(sender as ToolStripMenuItem);
        }
        
        private void Stream_Item_Click(object sender, EventArgs e)
        {
            foreach (ToolStripMenuItem menu in streamMenus)
            {
                if (menu != null && menu.DropDownItems.Contains(sender as ToolStripMenuItem))
                {
                    foreach (ToolStripMenuItem e1 in menu.DropDownItems)
                        e1.Checked = (sender == e1);
                }
            }
            ResetStreamTypes();
            CheckSelection();
        }

        private void Start_Click(object sender, EventArgs e)
        {
            MainMenu.Enabled = false;
            Start.Enabled = false;
            Stop.Enabled = true;
            if (PIP.Checked)
            {
                int index = Array.FindIndex(streamButtons, sb => sb.Enabled && !sb.Checked);
                streaming.PIPPanel = RS.Capture.StreamTypeFromIndex(index);
            }
            streaming.StreamProfileSet = GetStreamSetConfiguration();
            streaming.DeviceInfo = GetCheckedDevice();
            streaming.Stop = false;
            System.Threading.Thread thread = new System.Threading.Thread(DoStreaming);
            thread.Start();
            System.Threading.Thread.Sleep(5);
        }

        delegate void DoStreamingEnd();
        private void DoStreaming()
        {
            streaming.StreamColorDepth();
            Invoke(new DoStreamingEnd(
                delegate
                {
                    Start.Enabled = true;
                    Stop.Enabled = false;
                    MainMenu.Enabled = true;
                    if (closing) Close();
                }
            ));
        }

        private RS.DeviceInfo GetCheckedDevice()
        {
            foreach (ToolStripMenuItem e in DeviceMenu.DropDownItems)
            {
                if (devices.ContainsKey(e))
                {
                    if (e.Checked) return devices[e];
                }
            }
            return new RS.DeviceInfo();
        }

        private RS.StreamProfile GetConfiguration(ToolStripMenuItem m)
        {
            foreach (ToolStripMenuItem e in m.DropDownItems)
                if (e.Checked) return profiles[e];
            return new RS.StreamProfile();
        }

        private ToolStripMenuItem GetMenuItem(RS.StreamType st, RS.StreamProfile profile)
        {
            ToolStripMenuItem parent = streamMenus[RS.Capture.StreamTypeToIndex(st)];
            if (parent == null)
                return null;
            foreach (ToolStripMenuItem key1 in parent.DropDownItems)
            {
                RS.StreamProfile profile1 = profiles[key1];
                if (ProfileToString(profile1) == ProfileToString(profile)) return key1;
            }
            return null;
        }

        private RS.StreamProfile GetStreamConfiguration(RS.StreamType st)
        {
            ToolStripMenuItem menu = streamMenus[RS.Capture.StreamTypeToIndex(st)];
            if(menu != null)
                return GetConfiguration(menu);
            else
                return new RS.StreamProfile();
        }

        private RS.StreamProfileSet GetStreamSetConfiguration()
        {
            RS.StreamProfileSet profiles = new RS.StreamProfileSet();
            for (int s=0; s<RS.Capture.STREAM_LIMIT; s++)
            {
                RS.StreamType st=RS.Capture.StreamTypeFromIndex(s);
                profiles[st]=GetStreamConfiguration(st);
            }
            return profiles;
        }

        private void SetStatus(String text) {
            StatusLabel.Text = text;
        }

        private delegate void SetStatusDelegate(String status);
        private void UpdateStatusHandler(Object sender, UpdateStatusEventArgs e)
        {
            Status2.Invoke(new SetStatusDelegate(SetStatus), new object[] { e.text });
        }

        private void Stop_Click(object sender, EventArgs e)
        {
            streaming.Stop = true;
        }

        private void RenderFrameHandler(Object sender, RenderFrameEventArgs e)
        {
            if (e.image == null) return;
            renders[e.index].UpdatePanel(e.image);
        }

        /* Redirect to DirectX Update */
        private void PaintHandler(object sender, PaintEventArgs e)
        {
            renders[(sender == MainPanel) ? 0 : 1].UpdatePanel();
        }

        /* Redirect to DirectX Resize */
        private void ResizeHandler(object sender, EventArgs e)
        {
            renders[(sender == MainPanel) ? 0 : 1].ResizePanel();
        }

        private void FormClosingHandler(object sender, FormClosingEventArgs e)
        {
            streaming.Stop = true;
            e.Cancel = Stop.Enabled;
            closing = true;
        }

        private void Scale_Checked(object sender, EventArgs e)
        {
            renders[0].SetScale(Scale2.Checked);
            renders[1].SetScale(Scale2.Checked);
        }

        private void Mirror_Checked(object sender, EventArgs e)
        {
            streaming.Mirror = Mirror.Checked;
        }

        private void CheckSelection()
        {
            if (!ModePlayback.Checked)
            {
                RS.StreamProfileSet allProfile = new RS.StreamProfileSet();
                for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                {
                    RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                    allProfile[st] = GetStreamConfiguration(st);
                }

                RS.ImplDesc desc = new RS.ImplDesc();
                desc.group = RS.ImplGroup.IMPL_GROUP_SENSOR;
                desc.subgroup = RS.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE;
                desc.iuid = current_device_iuid;
                desc.cuids[0] = RS.Capture.CUID;
                RS.Capture capture;
                RS.DeviceInfo dinfo2 = GetCheckedDevice();
                if (session.CreateImpl<RS.Capture>(desc, out capture) >= RS.Status.STATUS_NO_ERROR)
                {
                    RS.Device device = capture.CreateDevice(dinfo2.didx);
                    if (device != null)
                    {
                        RS.StreamProfileSet profile = new RS.StreamProfileSet();
                        RS.StreamProfileSet test = new RS.StreamProfileSet();

                        /* Loop over all stream types and profiles and enable only compatible in menu */
                        for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
                        {
                            RS.StreamType st = RS.Capture.StreamTypeFromIndex(s);
                            if (((int)dinfo2.streams & (int)st) != 0)
                            {
                                for (int s1 = 0; s1 < RS.Capture.STREAM_LIMIT; s1++)
                                {
                                    test[RS.Capture.StreamTypeFromIndex(s1)] = allProfile[RS.Capture.StreamTypeFromIndex(s1)];
                                }
                                int num = device.QueryStreamProfileSetNum(st);
                                for (int p = 0; p < num; p++)
                                {
                                    if (device.QueryStreamProfileSet(st, p, out profile) < RS.Status.STATUS_NO_ERROR) break;
                                    RS.StreamProfile sprofile = profile[st];
                                    ToolStripMenuItem sm1 = GetMenuItem(st, sprofile);
                                    if (sm1 != null)
                                    {
                                        test[st] = sprofile;
                                        sm1.Enabled = device.IsStreamProfileSetValid(test);
                                    }
                                }
                            }
                        }
                        Start.Enabled = device.IsStreamProfileSetValid(allProfile);
                        device.Dispose();
                    }
                    capture.Dispose();
                }
            }

            int sumEnabled = 0;
            for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
            {
                if (streamButtons[s] != null && streamNone[s] != null)
                {
                    streamButtons[s].Enabled = !streamNone[s].Checked;
                    sumEnabled += streamButtons[s].Enabled?1:0;
                }
            }
            PIP.Enabled = (sumEnabled >= 2);
            Mirror.Enabled = !ModePlayback.Checked;

            RS.StreamType selectedStream = GetSelectedStream();
            if (selectedStream != RS.StreamType.STREAM_TYPE_ANY && !streamButtons[RS.Capture.StreamTypeToIndex(selectedStream)].Enabled)
            {
                RS.StreamType st = GetUnselectedStream();
                streamButtons[RS.Capture.StreamTypeToIndex(st)].Checked = true;
                streaming.MainPanel = st;
            }

            if (PIP.Enabled && streaming.PIPPanel == RS.StreamType.STREAM_TYPE_ANY)
            {
                streaming.PIPPanel = GetUnselectedStream();
            }
        }

        private RS.StreamType GetSelectedStream()
        {
            for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
            {
                if (streamButtons[s] != null && streamButtons[s].Checked)
                    return RS.Capture.StreamTypeFromIndex(s);
            }
            return RS.StreamType.STREAM_TYPE_ANY;
        }

        private RS.StreamType GetUnselectedStream()
        {
            for (int s = 0; s < RS.Capture.STREAM_LIMIT; s++)
            {
                if (streamButtons[s] != null && !streamButtons[s].Checked && streamButtons[s].Enabled)
                    return RS.Capture.StreamTypeFromIndex(s);
            }
            return RS.StreamType.STREAM_TYPE_ANY;
        }

        private void Stream_Click(object sender, EventArgs e)
        {
            RS.StreamType selected_stream = GetSelectedStream();
            if (selected_stream != streaming.MainPanel)
            {
                streaming.PIPPanel = streaming.MainPanel;
                streaming.MainPanel = selected_stream;
            }
        }

        private void ColorDepthSync_Click(object sender, EventArgs e)
        {
            ColorDepthSync.Checked = streaming.Synced = true;
            ColorDepthAsync.Checked = false;
            CheckSelection();
        }

        private void ColorDepthAsync_Click(object sender, EventArgs e)
        {
            ColorDepthSync.Checked = streaming.Synced = false;
            ColorDepthAsync.Checked = true;
            CheckSelection();
        }

        private void ModeLive_Click(object sender, EventArgs e)
        {
            ModeLive.Checked = true;
            streaming.Playback = streaming.Record = false;
            ModeRecord.Checked = false;
            if (ModePlayback.Checked)
            {
                /* rescan streams after playback */
                ModePlayback.Checked = false;
                PopulateDeviceMenu();
            }
        }

        private void ModePlayback_Click(object sender, EventArgs e)
        {
            OpenFileDialog ofd = new OpenFileDialog();
            ofd.Filter = "RSSDK clip|*.rssdk|Old format clip|*.pcsdk|All files|*.*";
            ofd.CheckFileExists = true;
            ofd.CheckPathExists = true;
            streaming.File=(ofd.ShowDialog() == DialogResult.OK)?ofd.FileName:null;
            if (streaming.File == null)
            {
                ModeLive.Checked = true;
                ModePlayback.Checked = ModeRecord.Checked = false;
                streaming.Playback = streaming.Record = false;
                PopulateDeviceMenu();
            } 
            else 
            {
                ModePlayback.Checked = streaming.Playback=true;
                ModeLive.Checked = ModeRecord.Checked = streaming.Record = false;
                if (PopulateDeviceFromFileMenu() == false)
                {
                    ModeLive.Checked = true;
                    ModePlayback.Checked = ModeRecord.Checked = streaming.Playback = false;
                    MessageBox.Show("Incorrect file format, switching to live mode");
                }
            }
        }

        private void ModeRecord_Click(object sender, EventArgs e)
        {
            SaveFileDialog sfd = new SaveFileDialog();
            sfd.Filter = "RSSDK clip|*.rssdk|All files|*.*";
            sfd.CheckPathExists = true;
            sfd.OverwritePrompt = true;
            sfd.AddExtension    = true;
            streaming.File = (sfd.ShowDialog() == DialogResult.OK) ? sfd.FileName : null;
            if (streaming.File == null)
            {
                ModeLive.Checked = true;
                streaming.Playback = streaming.Record = false;
                ModeRecord.Checked = false;
                if (ModePlayback.Checked)
                {
                    /* rescan streams after playback */
                    PopulateDeviceMenu();
                    ModePlayback.Checked = false;
                }
            }
            else
            {
                ModeRecord.Checked = streaming.Record = true;
                ModeLive.Checked = streaming.Playback = false;
                if (ModePlayback.Checked)
                {
                    PopulateDeviceMenu();
                    ModePlayback.Checked = false;
                }
            }
        }

        private Rectangle SetHalfSize(Rectangle rc)
        {
            rc.Width = rc.Width / 2;
            rc.X = rc.X + rc.Width;
            rc.Height = rc.Height / 2;
            rc.Y = rc.Y + rc.Height;
            return rc;
        }

        private Rectangle SetQuarterSize(Rectangle rc)
        {
            rc.X = rc.X + rc.Width * 3 / 4;
            rc.Y = rc.Y + rc.Height * 3 / 4;
            rc.Width = rc.Width / 4;
            rc.Height = rc.Height / 4;
            return rc;
        }


        private void PIP_CheckStateChanged(object sender, EventArgs e)
        {
            switch (PIP.CheckState)
            {
                case CheckState.Checked:
                    PIPPanel.Bounds = SetHalfSize(MainPanel.Bounds);
                    PIPPanel.Show();
                    break;
                case CheckState.Indeterminate:
                    PIPPanel.Bounds = SetQuarterSize(MainPanel.Bounds);
                    PIPPanel.Show();
                    break;
                case CheckState.Unchecked:
                    PIPPanel.Hide();
                    break;
            }
        }
    }
}
