namespace MqttRawStreams
{
    partial class MainForm
    {
        /// <summary>
        /// Required designer variable.
        /// </summary>
        private System.ComponentModel.IContainer components = null;

        /// <summary>
        /// Clean up any resources being used.
        /// </summary>
        /// <param name="disposing">true if managed resources should be disposed; otherwise, false.</param>
        protected override void Dispose(bool disposing)
        {
            renders[0].Dispose();
            renders[1].Dispose();
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        /// <summary>
        /// Required method for Designer support - do not modify
        /// the contents of this method with the code editor.
        /// </summary>
        private void InitializeComponent()
        {
            this.Start = new System.Windows.Forms.Button();
            this.Stop = new System.Windows.Forms.Button();
            this.DeviceMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.ColorMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.ColorNone = new System.Windows.Forms.ToolStripMenuItem();
            this.MainMenu = new System.Windows.Forms.MenuStrip();
            this.DepthMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.DepthNone = new System.Windows.Forms.ToolStripMenuItem();
            this.IRMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.IRNone = new System.Windows.Forms.ToolStripMenuItem();
            this.LeftMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.LeftNone = new System.Windows.Forms.ToolStripMenuItem();
            this.RightMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.RightNone = new System.Windows.Forms.ToolStripMenuItem();
            this.AuxColorMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.AuxColorNone = new System.Windows.Forms.ToolStripMenuItem();
            this.ModeMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.ModeLive = new System.Windows.Forms.ToolStripMenuItem();
            this.ModePlayback = new System.Windows.Forms.ToolStripMenuItem();
            this.ModeRecord = new System.Windows.Forms.ToolStripMenuItem();
            this.SyncMenu = new System.Windows.Forms.ToolStripMenuItem();
            this.ColorDepthSync = new System.Windows.Forms.ToolStripMenuItem();
            this.ColorDepthAsync = new System.Windows.Forms.ToolStripMenuItem();
            this.Color = new System.Windows.Forms.RadioButton();
            this.Depth = new System.Windows.Forms.RadioButton();
            this.Status2 = new System.Windows.Forms.StatusStrip();
            this.StatusLabel = new System.Windows.Forms.ToolStripStatusLabel();
            this.Scale2 = new System.Windows.Forms.CheckBox();
            this.MainPanel = new System.Windows.Forms.PictureBox();
            this.Mirror = new System.Windows.Forms.CheckBox();
            this.PIPPanel = new System.Windows.Forms.PictureBox();
            this.PIP = new System.Windows.Forms.CheckBox();
            this.panel1 = new System.Windows.Forms.Panel();
            this.tableLayoutPanel1 = new System.Windows.Forms.TableLayoutPanel();
            this.tableLayoutPanel2 = new System.Windows.Forms.TableLayoutPanel();
            this.tableLayoutPanel3 = new System.Windows.Forms.TableLayoutPanel();
            this.IR = new System.Windows.Forms.RadioButton();
            this.IRLeft = new System.Windows.Forms.RadioButton();
            this.IRRight = new System.Windows.Forms.RadioButton();
            this.AuxColor = new System.Windows.Forms.RadioButton();
            this.tableLayoutPanel5 = new System.Windows.Forms.TableLayoutPanel();
            this.tableLayoutPanel6 = new System.Windows.Forms.TableLayoutPanel();
            this.MainMenu.SuspendLayout();
            this.Status2.SuspendLayout();
            ((System.ComponentModel.ISupportInitialize)(this.MainPanel)).BeginInit();
            ((System.ComponentModel.ISupportInitialize)(this.PIPPanel)).BeginInit();
            this.panel1.SuspendLayout();
            this.tableLayoutPanel1.SuspendLayout();
            this.tableLayoutPanel2.SuspendLayout();
            this.tableLayoutPanel3.SuspendLayout();
            this.tableLayoutPanel5.SuspendLayout();
            this.tableLayoutPanel6.SuspendLayout();
            this.SuspendLayout();
            // 
            // Start
            // 
            this.Start.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.Start.Location = new System.Drawing.Point(3, 3);
            this.Start.Name = "Start";
            this.Start.Size = new System.Drawing.Size(82, 21);
            this.Start.TabIndex = 2;
            this.Start.Text = "Start";
            this.Start.UseVisualStyleBackColor = true;
            this.Start.Click += new System.EventHandler(this.Start_Click);
            // 
            // Stop
            // 
            this.Stop.Dock = System.Windows.Forms.DockStyle.Top;
            this.Stop.Enabled = false;
            this.Stop.Location = new System.Drawing.Point(3, 30);
            this.Stop.Name = "Stop";
            this.Stop.Size = new System.Drawing.Size(82, 21);
            this.Stop.TabIndex = 3;
            this.Stop.Text = "Stop";
            this.Stop.UseVisualStyleBackColor = true;
            this.Stop.Click += new System.EventHandler(this.Stop_Click);
            // 
            // DeviceMenu
            // 
            this.DeviceMenu.Name = "DeviceMenu";
            this.DeviceMenu.Size = new System.Drawing.Size(54, 20);
            this.DeviceMenu.Text = "Device";
            // 
            // ColorMenu
            // 
            this.ColorMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.ColorNone});
            this.ColorMenu.Name = "ColorMenu";
            this.ColorMenu.Size = new System.Drawing.Size(48, 20);
            this.ColorMenu.Text = "Color";
            // 
            // ColorNone
            // 
            this.ColorNone.Name = "ColorNone";
            this.ColorNone.Size = new System.Drawing.Size(103, 22);
            this.ColorNone.Text = "None";
            // 
            // MainMenu
            // 
            this.MainMenu.ImageScalingSize = new System.Drawing.Size(20, 20);
            this.MainMenu.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.DeviceMenu,
            this.ColorMenu,
            this.DepthMenu,
            this.IRMenu,
            this.LeftMenu,
            this.RightMenu,
            this.AuxColorMenu,
            this.ModeMenu,
            this.SyncMenu});
            this.MainMenu.Location = new System.Drawing.Point(0, 0);
            this.MainMenu.Name = "MainMenu";
            this.MainMenu.RenderMode = System.Windows.Forms.ToolStripRenderMode.Professional;
            this.MainMenu.Size = new System.Drawing.Size(981, 24);
            this.MainMenu.TabIndex = 0;
            this.MainMenu.Text = "MainMenu";
            // 
            // DepthMenu
            // 
            this.DepthMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.DepthNone});
            this.DepthMenu.Name = "DepthMenu";
            this.DepthMenu.Size = new System.Drawing.Size(51, 20);
            this.DepthMenu.Text = "Depth";
            // 
            // DepthNone
            // 
            this.DepthNone.Name = "DepthNone";
            this.DepthNone.Size = new System.Drawing.Size(103, 22);
            this.DepthNone.Text = "None";
            // 
            // IRMenu
            // 
            this.IRMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.IRNone});
            this.IRMenu.Name = "IRMenu";
            this.IRMenu.Size = new System.Drawing.Size(29, 20);
            this.IRMenu.Text = "IR";
            // 
            // IRNone
            // 
            this.IRNone.Name = "IRNone";
            this.IRNone.Size = new System.Drawing.Size(103, 22);
            this.IRNone.Text = "None";
            // 
            // LeftMenu
            // 
            this.LeftMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.LeftNone});
            this.LeftMenu.Name = "LeftMenu";
            this.LeftMenu.Size = new System.Drawing.Size(39, 20);
            this.LeftMenu.Text = "Left";
            // 
            // LeftNone
            // 
            this.LeftNone.Name = "LeftNone";
            this.LeftNone.Size = new System.Drawing.Size(103, 22);
            this.LeftNone.Text = "None";
            // 
            // RightMenu
            // 
            this.RightMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.RightNone});
            this.RightMenu.Name = "RightMenu";
            this.RightMenu.Size = new System.Drawing.Size(47, 20);
            this.RightMenu.Text = "Right";
            // 
            // RightNone
            // 
            this.RightNone.Name = "RightNone";
            this.RightNone.Size = new System.Drawing.Size(103, 22);
            this.RightNone.Text = "None";
            // 
            // AuxColorMenu
            // 
            this.AuxColorMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.AuxColorNone});
            this.AuxColorMenu.Name = "AuxColorMenu";
            this.AuxColorMenu.Size = new System.Drawing.Size(71, 20);
            this.AuxColorMenu.Text = "Aux Color";
            // 
            // AuxColorNone
            // 
            this.AuxColorNone.Name = "AuxColorNone";
            this.AuxColorNone.Size = new System.Drawing.Size(103, 22);
            this.AuxColorNone.Text = "None";
            // 
            // ModeMenu
            // 
            this.ModeMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.ModeLive,
            this.ModePlayback,
            this.ModeRecord});
            this.ModeMenu.Name = "ModeMenu";
            this.ModeMenu.Size = new System.Drawing.Size(50, 20);
            this.ModeMenu.Text = "Mode";
            // 
            // ModeLive
            // 
            this.ModeLive.Checked = true;
            this.ModeLive.CheckState = System.Windows.Forms.CheckState.Checked;
            this.ModeLive.Name = "ModeLive";
            this.ModeLive.Size = new System.Drawing.Size(121, 22);
            this.ModeLive.Text = "Live";
            this.ModeLive.Click += new System.EventHandler(this.ModeLive_Click);
            // 
            // ModePlayback
            // 
            this.ModePlayback.Name = "ModePlayback";
            this.ModePlayback.Size = new System.Drawing.Size(121, 22);
            this.ModePlayback.Text = "Playback";
            this.ModePlayback.Click += new System.EventHandler(this.ModePlayback_Click);
            // 
            // ModeRecord
            // 
            this.ModeRecord.Name = "ModeRecord";
            this.ModeRecord.Size = new System.Drawing.Size(121, 22);
            this.ModeRecord.Text = "Record";
            this.ModeRecord.Click += new System.EventHandler(this.ModeRecord_Click);
            // 
            // SyncMenu
            // 
            this.SyncMenu.Alignment = System.Windows.Forms.ToolStripItemAlignment.Right;
            this.SyncMenu.DropDownItems.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.ColorDepthSync,
            this.ColorDepthAsync});
            this.SyncMenu.Name = "SyncMenu";
            this.SyncMenu.Size = new System.Drawing.Size(68, 20);
            this.SyncMenu.Text = "C/D Sync";
            // 
            // ColorDepthSync
            // 
            this.ColorDepthSync.Checked = true;
            this.ColorDepthSync.CheckState = System.Windows.Forms.CheckState.Checked;
            this.ColorDepthSync.Name = "ColorDepthSync";
            this.ColorDepthSync.Size = new System.Drawing.Size(118, 22);
            this.ColorDepthSync.Text = "Sync";
            this.ColorDepthSync.Click += new System.EventHandler(this.ColorDepthSync_Click);
            // 
            // ColorDepthAsync
            // 
            this.ColorDepthAsync.Name = "ColorDepthAsync";
            this.ColorDepthAsync.Size = new System.Drawing.Size(118, 22);
            this.ColorDepthAsync.Text = "No Sync";
            this.ColorDepthAsync.Click += new System.EventHandler(this.ColorDepthAsync_Click);
            // 
            // Color
            // 
            this.Color.AutoSize = true;
            this.Color.Checked = true;
            this.Color.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.Color.Location = new System.Drawing.Point(3, 3);
            this.Color.Name = "Color";
            this.Color.Size = new System.Drawing.Size(82, 17);
            this.Color.TabIndex = 20;
            this.Color.TabStop = true;
            this.Color.Text = "Color";
            this.Color.UseVisualStyleBackColor = true;
            // 
            // Depth
            // 
            this.Depth.AutoSize = true;
            this.Depth.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Depth.Location = new System.Drawing.Point(3, 26);
            this.Depth.Name = "Depth";
            this.Depth.Size = new System.Drawing.Size(82, 17);
            this.Depth.TabIndex = 21;
            this.Depth.Text = "Depth";
            this.Depth.UseVisualStyleBackColor = true;
            // 
            // Status2
            // 
            this.Status2.ImageScalingSize = new System.Drawing.Size(20, 20);
            this.Status2.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.StatusLabel});
            this.Status2.LayoutStyle = System.Windows.Forms.ToolStripLayoutStyle.Flow;
            this.Status2.Location = new System.Drawing.Point(0, 784);
            this.Status2.Name = "Status2";
            this.Status2.Size = new System.Drawing.Size(981, 20);
            this.Status2.TabIndex = 25;
            this.Status2.Text = "Status2";
            // 
            // StatusLabel
            // 
            this.StatusLabel.Name = "StatusLabel";
            this.StatusLabel.Size = new System.Drawing.Size(23, 15);
            this.StatusLabel.Text = "OK";
            // 
            // Scale2
            // 
            this.Scale2.AutoSize = true;
            this.Scale2.Checked = true;
            this.Scale2.CheckState = System.Windows.Forms.CheckState.Checked;
            this.Scale2.Dock = System.Windows.Forms.DockStyle.Bottom;
            this.Scale2.Location = new System.Drawing.Point(3, 3);
            this.Scale2.Name = "Scale2";
            this.Scale2.Size = new System.Drawing.Size(82, 15);
            this.Scale2.TabIndex = 26;
            this.Scale2.Text = "Scale";
            this.Scale2.UseVisualStyleBackColor = true;
            // 
            // MainPanel
            // 
            this.MainPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.MainPanel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.MainPanel.ErrorImage = null;
            this.MainPanel.InitialImage = null;
            this.MainPanel.Location = new System.Drawing.Point(-1, 3);
            this.MainPanel.Margin = new System.Windows.Forms.Padding(0);
            this.MainPanel.MinimumSize = new System.Drawing.Size(411, 293);
            this.MainPanel.Name = "MainPanel";
            this.MainPanel.Size = new System.Drawing.Size(875, 750);
            this.MainPanel.TabIndex = 27;
            this.MainPanel.TabStop = false;
            // 
            // Mirror
            // 
            this.Mirror.AutoSize = true;
            this.Mirror.Checked = true;
            this.Mirror.CheckState = System.Windows.Forms.CheckState.Checked;
            this.Mirror.Dock = System.Windows.Forms.DockStyle.Fill;
            this.Mirror.Location = new System.Drawing.Point(3, 24);
            this.Mirror.Name = "Mirror";
            this.Mirror.Size = new System.Drawing.Size(82, 15);
            this.Mirror.TabIndex = 30;
            this.Mirror.Text = "Mirror";
            this.Mirror.UseVisualStyleBackColor = true;
            // 
            // PIPPanel
            // 
            this.PIPPanel.Anchor = ((System.Windows.Forms.AnchorStyles)((System.Windows.Forms.AnchorStyles.Bottom | System.Windows.Forms.AnchorStyles.Right)));
            this.PIPPanel.BorderStyle = System.Windows.Forms.BorderStyle.Fixed3D;
            this.PIPPanel.Location = new System.Drawing.Point(670, 605);
            this.PIPPanel.Name = "PIPPanel";
            this.PIPPanel.Size = new System.Drawing.Size(205, 148);
            this.PIPPanel.TabIndex = 35;
            this.PIPPanel.TabStop = false;
            this.PIPPanel.Visible = false;
            // 
            // PIP
            // 
            this.PIP.AutoSize = true;
            this.PIP.Dock = System.Windows.Forms.DockStyle.Top;
            this.PIP.Location = new System.Drawing.Point(3, 45);
            this.PIP.Name = "PIP";
            this.PIP.Size = new System.Drawing.Size(82, 17);
            this.PIP.TabIndex = 36;
            this.PIP.Text = "PIP";
            this.PIP.ThreeState = true;
            this.PIP.UseVisualStyleBackColor = true;
            this.PIP.CheckStateChanged += new System.EventHandler(this.PIP_CheckStateChanged);
            // 
            // panel1
            // 
            this.panel1.Controls.Add(this.PIPPanel);
            this.panel1.Controls.Add(this.MainPanel);
            this.panel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.panel1.Location = new System.Drawing.Point(3, 3);
            this.panel1.Name = "panel1";
            this.panel1.Size = new System.Drawing.Size(875, 754);
            this.panel1.TabIndex = 37;
            // 
            // tableLayoutPanel1
            // 
            this.tableLayoutPanel1.ColumnCount = 2;
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Absolute, 100F));
            this.tableLayoutPanel1.Controls.Add(this.tableLayoutPanel2, 1, 0);
            this.tableLayoutPanel1.Controls.Add(this.panel1, 0, 0);
            this.tableLayoutPanel1.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel1.Location = new System.Drawing.Point(0, 24);
            this.tableLayoutPanel1.Name = "tableLayoutPanel1";
            this.tableLayoutPanel1.RowCount = 1;
            this.tableLayoutPanel1.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel1.Size = new System.Drawing.Size(981, 760);
            this.tableLayoutPanel1.TabIndex = 38;
            // 
            // tableLayoutPanel2
            // 
            this.tableLayoutPanel2.ColumnCount = 1;
            this.tableLayoutPanel2.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel2.Controls.Add(this.tableLayoutPanel3, 0, 0);
            this.tableLayoutPanel2.Controls.Add(this.tableLayoutPanel5, 0, 2);
            this.tableLayoutPanel2.Controls.Add(this.tableLayoutPanel6, 0, 3);
            this.tableLayoutPanel2.Dock = System.Windows.Forms.DockStyle.Fill;
            this.tableLayoutPanel2.Location = new System.Drawing.Point(884, 3);
            this.tableLayoutPanel2.MaximumSize = new System.Drawing.Size(0, 350);
            this.tableLayoutPanel2.Name = "tableLayoutPanel2";
            this.tableLayoutPanel2.RowCount = 4;
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 32.18415F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 9.048724F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 20.88167F));
            this.tableLayoutPanel2.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 38.28306F));
            this.tableLayoutPanel2.Size = new System.Drawing.Size(94, 350);
            this.tableLayoutPanel2.TabIndex = 0;
            // 
            // tableLayoutPanel3
            // 
            this.tableLayoutPanel3.ColumnCount = 1;
            this.tableLayoutPanel3.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel3.Controls.Add(this.Color, 0, 0);
            this.tableLayoutPanel3.Controls.Add(this.Depth, 0, 1);
            this.tableLayoutPanel3.Controls.Add(this.IR, 0, 2);
            this.tableLayoutPanel3.Controls.Add(this.IRLeft, 0, 3);
            this.tableLayoutPanel3.Controls.Add(this.IRRight, 0, 4);
            this.tableLayoutPanel3.Controls.Add(this.AuxColor, 0, 5);
            this.tableLayoutPanel3.Location = new System.Drawing.Point(3, 3);
            this.tableLayoutPanel3.Name = "tableLayoutPanel3";
            this.tableLayoutPanel3.RowCount = 6;
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.RowStyles.Add(new System.Windows.Forms.RowStyle());
            this.tableLayoutPanel3.Size = new System.Drawing.Size(88, 106);
            this.tableLayoutPanel3.TabIndex = 0;
            // 
            // IR
            // 
            this.IR.AutoSize = true;
            this.IR.Dock = System.Windows.Forms.DockStyle.Top;
            this.IR.Location = new System.Drawing.Point(3, 49);
            this.IR.Name = "IR";
            this.IR.Size = new System.Drawing.Size(82, 17);
            this.IR.TabIndex = 22;
            this.IR.Text = "IR";
            this.IR.UseVisualStyleBackColor = true;
            // 
            // IRLeft
            // 
            this.IRLeft.AutoSize = true;
            this.IRLeft.Dock = System.Windows.Forms.DockStyle.Top;
            this.IRLeft.Location = new System.Drawing.Point(3, 72);
            this.IRLeft.Name = "IRLeft";
            this.IRLeft.Size = new System.Drawing.Size(82, 17);
            this.IRLeft.TabIndex = 23;
            this.IRLeft.TabStop = true;
            this.IRLeft.Text = "Left";
            this.IRLeft.UseVisualStyleBackColor = true;
            // 
            // IRRight
            // 
            this.IRRight.AutoSize = true;
            this.IRRight.Dock = System.Windows.Forms.DockStyle.Top;
            this.IRRight.Location = new System.Drawing.Point(3, 95);
            this.IRRight.Name = "IRRight";
            this.IRRight.Size = new System.Drawing.Size(82, 17);
            this.IRRight.TabIndex = 24;
            this.IRRight.TabStop = true;
            this.IRRight.Text = "Right";
            this.IRRight.UseVisualStyleBackColor = true;
            // 
            // AuxColor
            // 
            this.AuxColor.AutoSize = true;
            this.AuxColor.Dock = System.Windows.Forms.DockStyle.Top;
            this.AuxColor.Location = new System.Drawing.Point(3, 118);
            this.AuxColor.Name = "AuxColor";
            this.AuxColor.Size = new System.Drawing.Size(82, 17);
            this.AuxColor.TabIndex = 25;
            this.AuxColor.TabStop = true;
            this.AuxColor.Text = "Aux Color";
            this.AuxColor.UseVisualStyleBackColor = true;
            // 
            // tableLayoutPanel5
            // 
            this.tableLayoutPanel5.ColumnCount = 1;
            this.tableLayoutPanel5.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 100F));
            this.tableLayoutPanel5.Controls.Add(this.Scale2, 0, 0);
            this.tableLayoutPanel5.Controls.Add(this.Mirror, 0, 1);
            this.tableLayoutPanel5.Controls.Add(this.PIP, 0, 2);
            this.tableLayoutPanel5.Location = new System.Drawing.Point(3, 146);
            this.tableLayoutPanel5.Name = "tableLayoutPanel5";
            this.tableLayoutPanel5.RowCount = 3;
            this.tableLayoutPanel5.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel5.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel5.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 33.33333F));
            this.tableLayoutPanel5.Size = new System.Drawing.Size(88, 65);
            this.tableLayoutPanel5.TabIndex = 2;
            // 
            // tableLayoutPanel6
            // 
            this.tableLayoutPanel6.ColumnCount = 1;
            this.tableLayoutPanel6.ColumnStyles.Add(new System.Windows.Forms.ColumnStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel6.Controls.Add(this.Start, 0, 0);
            this.tableLayoutPanel6.Controls.Add(this.Stop, 0, 1);
            this.tableLayoutPanel6.Location = new System.Drawing.Point(3, 218);
            this.tableLayoutPanel6.Name = "tableLayoutPanel6";
            this.tableLayoutPanel6.RowCount = 2;
            this.tableLayoutPanel6.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel6.RowStyles.Add(new System.Windows.Forms.RowStyle(System.Windows.Forms.SizeType.Percent, 50F));
            this.tableLayoutPanel6.Size = new System.Drawing.Size(88, 55);
            this.tableLayoutPanel6.TabIndex = 3;
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(981, 804);
            this.Controls.Add(this.tableLayoutPanel1);
            this.Controls.Add(this.Status2);
            this.Controls.Add(this.MainMenu);
            this.DoubleBuffered = true;
            this.MainMenuStrip = this.MainMenu;
            this.MinimumSize = new System.Drawing.Size(576, 418);
            this.Name = "MainForm";
            this.Text = "Intel(R) RealSense(TM) SDK: Raw Streams.cs";
            this.MainMenu.ResumeLayout(false);
            this.MainMenu.PerformLayout();
            this.Status2.ResumeLayout(false);
            this.Status2.PerformLayout();
            ((System.ComponentModel.ISupportInitialize)(this.MainPanel)).EndInit();
            ((System.ComponentModel.ISupportInitialize)(this.PIPPanel)).EndInit();
            this.panel1.ResumeLayout(false);
            this.tableLayoutPanel1.ResumeLayout(false);
            this.tableLayoutPanel2.ResumeLayout(false);
            this.tableLayoutPanel3.ResumeLayout(false);
            this.tableLayoutPanel3.PerformLayout();
            this.tableLayoutPanel5.ResumeLayout(false);
            this.tableLayoutPanel5.PerformLayout();
            this.tableLayoutPanel6.ResumeLayout(false);
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.Button Start;
        private System.Windows.Forms.Button Stop;
        private System.Windows.Forms.ToolStripMenuItem DeviceMenu;
        private System.Windows.Forms.ToolStripMenuItem ColorMenu;
        private System.Windows.Forms.MenuStrip MainMenu;
        private System.Windows.Forms.RadioButton Color;
        private System.Windows.Forms.RadioButton Depth;
        private System.Windows.Forms.StatusStrip Status2;
        private System.Windows.Forms.ToolStripStatusLabel StatusLabel;
        private System.Windows.Forms.CheckBox Scale2;
        private System.Windows.Forms.PictureBox MainPanel;
        private System.Windows.Forms.CheckBox Mirror;
        private System.Windows.Forms.ToolStripMenuItem ModeMenu;
        private System.Windows.Forms.ToolStripMenuItem ModeLive;
        private System.Windows.Forms.ToolStripMenuItem ModePlayback;
        private System.Windows.Forms.ToolStripMenuItem ModeRecord;
        private System.Windows.Forms.ToolStripMenuItem DepthMenu;
        private System.Windows.Forms.ToolStripMenuItem SyncMenu;
        private System.Windows.Forms.ToolStripMenuItem ColorDepthSync;
        private System.Windows.Forms.ToolStripMenuItem ColorDepthAsync;
        private System.Windows.Forms.PictureBox PIPPanel;
        private System.Windows.Forms.CheckBox PIP;
        private System.Windows.Forms.ToolStripMenuItem ColorNone;
        private System.Windows.Forms.ToolStripMenuItem DepthNone;
        private System.Windows.Forms.Panel panel1;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel1;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel2;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel3;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel5;
        private System.Windows.Forms.TableLayoutPanel tableLayoutPanel6;
        private System.Windows.Forms.ToolStripMenuItem IRMenu;
        private System.Windows.Forms.ToolStripMenuItem IRNone;
        private System.Windows.Forms.RadioButton IR;
        private System.Windows.Forms.ToolStripMenuItem LeftMenu;
        private System.Windows.Forms.ToolStripMenuItem LeftNone;
        private System.Windows.Forms.ToolStripMenuItem RightMenu;
        private System.Windows.Forms.ToolStripMenuItem RightNone;
        private System.Windows.Forms.RadioButton IRLeft;
        private System.Windows.Forms.RadioButton IRRight;
        private System.Windows.Forms.ToolStripMenuItem AuxColorMenu;
        private System.Windows.Forms.RadioButton AuxColor;
        private System.Windows.Forms.ToolStripMenuItem AuxColorNone;
    }
}