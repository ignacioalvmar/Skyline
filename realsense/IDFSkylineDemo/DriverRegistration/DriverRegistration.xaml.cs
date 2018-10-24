//--------------------------------------------------------------------------------------
// Copyright 2015 Intel Corporation
// All Rights Reserved
//
// Permission is granted to use, copy, distribute and prepare derivative works of this
// software for any purpose and without fee, provided, that the above copyright notice
// and this statement appear in all copies.  Intel makes no representations about the
// suitability of this software for any purpose.  THIS SOFTWARE IS PROVIDED "AS IS."
// INTEL SPECIFICALLY DISCLAIMS ALL WARRANTIES, EXPRESS OR IMPLIED, AND ALL LIABILITY,
// INCLUDING CONSEQUENTIAL AND OTHER INDIRECT DAMAGES, FOR THE USE OF THIS SOFTWARE,
// INCLUDING LIABILITY FOR INFRINGEMENT OF ANY PROPRIETARY RIGHTS, AND INCLUDING THE
// WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE.  Intel does not
// assume any responsibility for any errors which may appear in this software nor any
// responsibility to update it.
//--------------------------------------------------------------------------------------
using System;
using System.Windows;
using System.Windows.Media.Imaging;
using System.Threading;
using System.Drawing;
using System.Windows.Controls;
using System.IO;
using Newtonsoft.Json.Linq;
using System.Collections.Generic;
using static PXCMFaceData;



namespace DriverRegistration
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class DriverRegistrationWindow : Window
    {
        private Thread processingThread;
        private PXCMSenseManager senseManager;
        private PXCMFaceConfiguration.RecognitionConfiguration recognitionConfig;
        private PXCMFaceData faceData;
        private RecognitionData recognitionData;
        private Int32 numFacesDetected;
        private string userId;
        private string dbState;
        private const int DatabaseUsers = 10;
        private const string recognitionDatabase = "C:\\Users\\vhpalaci\\Desktop\\db\\realsense.bin";
        private const string userDatabase = "C:\\Users\\vhpalaci\\Desktop\\db\\user.json";
        private const string ImagePath = "C:\\Users\\vhpalaci\\Desktop\\db\\images\\";

        /*private const string recognitionDatabase = "realsense.bin";
        private const string userDatabase = "user.json";
        private const string ImagePath = "";*/

        private JObject users;
        private bool doRegister;
        private bool doUnregister;
        private int faceRectangleHeight;
        private int faceRectangleWidth;
        private int faceRectangleX;
        private int faceRectangleY;

        // preferences
        private Dictionary<string, bool> prefs = new Dictionary<string, bool>() {
            { "btnMusic", true},
            { "btnPhone", true},
            { "btnAddress", true},
            { "btnLocation", true},
            { "btnCalendar", true}
        };
        private float temperature;

        private Utils.MQTTClient mClient;

        public DriverRegistrationWindow()
        {
            InitializeComponent();
            rectFaceMarker.Visibility = Visibility.Hidden;
            chkShowFaceMarker.IsChecked = true;
            numFacesDetected = 0;
            userId = string.Empty;
            dbState = string.Empty;
            doRegister = false;
            doUnregister = false;

            // Configure and start the Mqtt client
            string server = Properties.Settings.Default.mqtt_server;
            int port = Properties.Settings.Default.mqtt_port;
            string topic = Properties.Settings.Default.mqtt_topic;
            byte qos = Properties.Settings.Default.mqtt_qos;
            ushort keepalive = Properties.Settings.Default.mqtt_keepalive;
            int timeout = Properties.Settings.Default.mqtt_timeout;
            mClient = new Utils.MQTTClient(server, port, topic, qos, keepalive, timeout);

            // Start SenseManage and configure the face module
            ConfigureRealSense();

            // Start the worker thread
            processingThread = new Thread(new ThreadStart(ProcessingThread));
            processingThread.Start();
        }

        private void ConfigureRealSense()
        {
            // Start the SenseManager and session  
            senseManager = PXCMSenseManager.CreateInstance();

            // Enable the color stream
            senseManager.EnableStream(
                PXCMCapture.StreamType.STREAM_TYPE_COLOR, 640, 480, 30);

            // Enable the face module
            senseManager.EnableFace();
            PXCMFaceModule faceModule = senseManager.QueryFace();
            PXCMFaceConfiguration faceConfig = faceModule.CreateActiveConfiguration();

            // Configure for 3D face tracking 
            // (if camera cannot support depth it will revert to 2D tracking)
            faceConfig.SetTrackingMode(
                PXCMFaceConfiguration.TrackingModeType.FACE_MODE_COLOR_PLUS_DEPTH);

            // Enable facial recognition
            recognitionConfig = faceConfig.QueryRecognition();
            recognitionConfig.Enable();

            // enable expressions
            PXCMFaceConfiguration.ExpressionsConfiguration expConfig = faceConfig.QueryExpressions();
            expConfig.EnableAllExpressions();
            expConfig.Enable();

            // Enable pulse
            PXCMFaceConfiguration.PulseConfiguration pulseconfig = faceConfig.QueryPulse();
            pulseconfig.Enable();

            // Create a recognition database
            PXCMFaceConfiguration.RecognitionConfiguration.RecognitionStorageDesc recognitionDesc = new PXCMFaceConfiguration.RecognitionConfiguration.RecognitionStorageDesc();
            recognitionDesc.maxUsers = DatabaseUsers;
            //recognitionConfig.CreateStorage(DatabaseName, out recognitionDesc);
            //recognitionConfig.UseStorage(DatabaseName);
            LoadDatabaseFromFile();
            recognitionConfig.SetRegistrationMode(PXCMFaceConfiguration.RecognitionConfiguration.RecognitionRegistrationMode.REGISTRATION_MODE_CONTINUOUS);

            // Apply changes and initialize
            faceConfig.ApplyChanges();
            senseManager.Init();
            faceData = faceModule.CreateOutput();

            // Mirror image
            senseManager.QueryCaptureManager().QueryDevice().SetMirrorMode(PXCMCapture.Device.MirrorMode.MIRROR_MODE_HORIZONTAL);

            // Release resources
            //faceConfig.Dispose();
            //faceModule.Dispose();
         }

        private void ProcessingThread()
        {
            // Start AcquireFrame/ReleaseFrame loop
            int throttle = 0;
            bool noFaceDetected = true;
            while (senseManager.AcquireFrame(true) >= pxcmStatus.PXCM_STATUS_NO_ERROR)
            {
                // Acquire the color image data
                PXCMCapture.Sample sample = senseManager.QuerySample();
                Bitmap colorBitmap;
                PXCMImage.ImageData colorData;
                sample.color.AcquireAccess(PXCMImage.Access.ACCESS_READ, PXCMImage.PixelFormat.PIXEL_FORMAT_RGB24, out colorData);
                colorBitmap = colorData.ToBitmap(0, sample.color.info.width, sample.color.info.height);
                
                // Get face data
                if (faceData != null)
                {
                    faceData.Update();
                    numFacesDetected = faceData.QueryNumberOfDetectedFaces();

                    if (numFacesDetected > 0)
                    {
                        // Get the first face detected (index 0)
                        PXCMFaceData.Face face = faceData.QueryFaceByIndex(0);

                        // Retrieve face location data
                        PXCMFaceData.DetectionData faceDetectionData = face.QueryDetection();
                        if (faceDetectionData != null)
                        {
                            PXCMRectI32 faceRectangle;
                            faceDetectionData.QueryBoundingRect(out faceRectangle);
                            faceRectangleHeight = faceRectangle.h;
                            faceRectangleWidth = faceRectangle.w;
                            faceRectangleX = faceRectangle.x;
                            faceRectangleY = faceRectangle.y;
                        }

                        // Process face recognition data
                        if (face != null)
                        {
                            // Retrieve the recognition data instance
                            recognitionData = face.QueryRecognition();
                            
                            // Set the user ID and process register/unregister logic
                            if (recognitionData.IsRegistered())
                            {
                                String detectedId = Convert.ToString(recognitionData.QueryUserID());

                                if (!userId.Equals(detectedId)) noFaceDetected = true;
                                userId = detectedId;

                                if (doUnregister)
                                {
                                    recognitionData.UnregisterUser();
                                    users.Remove(userId);

                                    //save database
                                    SaveDatabaseToFile();

                                    Dispatcher.Invoke(delegate () { txtName.Text = ""; });
                                    prefs["btnMusic"] = false;
                                    prefs["btnPhone"] = false;
                                    prefs["btnAddress"] = false;
                                    prefs["btnLocation"] = false;
                                    prefs["btnCalendar"] = false;
                                    temperature = 0;
                                    this.Dispatcher.Invoke(delegate () { drawPreferences(); imgUser.Source = new BitmapImage(); });
                                }
                                else if (doRegister)
                                {
                                    JObject user = (JObject)users.GetValue(userId);

                                    string name = string.Empty;
                                    txtName.Dispatcher.Invoke(delegate () { name = txtName.Text; });

                                    txtName.Dispatcher.Invoke(delegate () { temperature = float.Parse(txtTemperature.Text); });

                                    user["name"] = name;

                                    JObject newprefs = (JObject)user["preferences"];

                                    newprefs["music"] = prefs["btnMusic"];
                                    newprefs["phone"] = prefs["btnPhone"];
                                    newprefs["addressBook"] = prefs["btnAddress"];
                                    newprefs["location"] = prefs["btnLocation"];
                                    newprefs["calendar"] = prefs["btnCalendar"];
                                    newprefs["temperature"] = temperature;

                                    Console.WriteLine(user);

                                    SaveDatabaseToFile();
                                }

                                // reload preferences
                                if (noFaceDetected)
                                {
                                    JObject user = (JObject)users.GetValue(userId);
                                    
                                    txtName.Dispatcher.Invoke(delegate () { txtName.Text = (string)user["name"]; });

                                    JObject newprefs = (JObject)user["preferences"];
                                    prefs["btnMusic"] = (bool)newprefs["music"];
                                    prefs["btnPhone"] = (bool)newprefs["phone"];
                                    prefs["btnAddress"] = (bool)newprefs["addressBook"];
                                    prefs["btnLocation"] = (bool)newprefs["location"];
                                    prefs["btnCalendar"] = (bool)newprefs["calendar"];
                                    temperature = (float)newprefs["temperature"];
                                    Dispatcher.Invoke(delegate() {
                                        drawPreferences();
                                        imgUser.Source = new BitmapImage(new Uri((string)user["image"]));
                                    });
                                }
                                noFaceDetected = false;
                                doRegister = doUnregister = false;
                            }
                            else
                            {
                                if (doRegister)
                                {
                                    int newUserId = recognitionData.RegisterUser();

                                    // Extract user face from the picture
                                    Rectangle cropR = new Rectangle(faceRectangleX - faceRectangleWidth / 2, 
                                        faceRectangleY - faceRectangleHeight / 2, 
                                        faceRectangleWidth * 2, faceRectangleHeight * 2);
                                    Bitmap user_image = new Bitmap(cropR.Width, cropR.Height);
                                    using (Graphics g = Graphics.FromImage(user_image))
                                    {
                                        g.DrawImage(colorBitmap, 
                                            new Rectangle(0, 0, user_image.Width, user_image.Height),
                                            cropR,
                                            GraphicsUnit.Pixel);
                                    }

                                    //save user image
                                    string image_path = ImagePath + newUserId + "_user_image.jpg";
                                    user_image.Save(image_path, System.Drawing.Imaging.ImageFormat.Jpeg);

                                    //generate string image
                                    string base64image = bitmapToJpegBase64(user_image);

                                    //save user preferences
                                    string name = string.Empty;
                                    Dispatcher.Invoke(delegate () {
                                        name = txtName.Text;
                                        temperature = 0;
                                        float.TryParse(txtTemperature.Text, out temperature);
                                    });
                                    JObject user = new JObject(
                                        new JProperty("userid", newUserId),
                                        new JProperty("name", name),
                                        new JProperty("image", image_path),
                                        new JProperty("preferences", new JObject(
                                            new JProperty("music", prefs["btnMusic"]),
                                            new JProperty("phone", prefs["btnPhone"]),
                                            new JProperty("addressBook", prefs["btnAddress"]),
                                            new JProperty("location", prefs["btnLocation"]),
                                            new JProperty("calendar", prefs["btnCalendar"]),
                                            new JProperty("temperature", temperature)))
                                    );
                                    users.Add(newUserId+"", user);

                                    mClient.publish(user.ToString(), "register");

                                    //save database
                                    SaveDatabaseToFile();

                                    //reset flags
                                    doUnregister = doRegister = false;
                                }
                                else
                                {
                                    userId = "Unrecognized";
                                    if (throttle == 0) { }
                                    noFaceDetected = true;
                                }
                            }
                        }
                    }
                    else
                    {
                        userId = "No users in view";
                        noFaceDetected = true;

                        if (throttle == 0) {
                            txtName.Dispatcher.Invoke(delegate () { txtName.Text = ""; });
                            prefs["btnMusic"] = false;
                            prefs["btnPhone"] = false;
                            prefs["btnAddress"] = false;
                            prefs["btnLocation"] = false;
                            prefs["btnCalendar"] = false;
                            temperature = 0;
                            Dispatcher.Invoke(delegate () { drawPreferences(); imgUser.Source = new BitmapImage(); });
                        }
                    }
                }

                // Display the color stream and other UI elements
                UpdateUI(colorBitmap);

                // Release resources
                colorBitmap.Dispose();
                sample.color.ReleaseAccess(colorData);
                sample.color.Dispose();

                // Release the frame
                senseManager.ReleaseFrame();


                throttle = (throttle==30? 0: throttle+1);
            }
        }

       

        public static string bitmapToJpegBase64(Bitmap img)
        {
            byte[] byteArray = new byte[0];
            using (MemoryStream stream = new MemoryStream())
            {
                img.Save(stream, System.Drawing.Imaging.ImageFormat.Jpeg);
                stream.Close();

                byteArray = stream.ToArray();
            }
            return Convert.ToBase64String(byteArray);
        }

        private void UpdateUI(Bitmap bitmap)
        {
            Dispatcher.Invoke(System.Windows.Threading.DispatcherPriority.Normal, new Action(delegate()
            {
                // Display  the color image
                if (bitmap != null)
                {
                    imgColorStream.Source = ConvertBitmap.BitmapToBitmapSource(bitmap);
                }

                 // Update UI elements
                lblNumFacesDetected.Content = String.Format("Faces Detected: {0}", numFacesDetected);
                lblUserId.Content = String.Format("User ID: {0}", userId);
                lblDatabaseState.Content = String.Format("Database: {0}", dbState);

                // Change picture border color depending on if user is in camera view
                if (numFacesDetected > 0)
                {
                    bdrPictureBorder.BorderBrush = System.Windows.Media.Brushes.LightGreen;
                }
                else
                {
                    bdrPictureBorder.BorderBrush = System.Windows.Media.Brushes.Red;
                }

                // Show or hide face marker
                if ((numFacesDetected > 0) && (chkShowFaceMarker.IsChecked == true))
                {
                    // Show face marker
                    rectFaceMarker.Height = faceRectangleHeight;
                    rectFaceMarker.Width = faceRectangleWidth;
                    Canvas.SetLeft(rectFaceMarker, faceRectangleX);
                    Canvas.SetTop(rectFaceMarker, faceRectangleY);
                    rectFaceMarker.Visibility = Visibility.Visible;

                    // Show floating ID label
                    lblFloatingId.Content = String.Format("User ID: {0}", userId);
                    Canvas.SetLeft(lblFloatingId, faceRectangleX);
                    Canvas.SetTop(lblFloatingId, faceRectangleY - 20);
                    lblFloatingId.Visibility = Visibility.Visible;
                }
                else
                {
                    // Hide the face marker and floating ID label
                    rectFaceMarker.Visibility = Visibility.Hidden;
                    lblFloatingId.Visibility = Visibility.Hidden;
                }
            }));

            // Release resources
            bitmap.Dispose();
        }

        private void LoadDatabaseFromFile()
        {
            if (File.Exists(recognitionDatabase))
            {
                byte[] buffer = File.ReadAllBytes(recognitionDatabase);
                recognitionConfig.SetDatabaseBuffer(buffer);


                dbState = "Loaded";
            }
            else
            {
                dbState = "Not Found";
            }

            if (File.Exists(userDatabase))
            {
                string json = File.ReadAllText(userDatabase);
                users = JObject.Parse(json);
            }
            else
            {
                users = new JObject();
            }
        }

        private void SaveDatabaseToFile()
        {
            // Allocate the buffer to save the database
            RecognitionModuleData data = faceData.QueryRecognitionModule();
            int nBytes = data.QueryDatabaseSize();
            byte[] buffer = new Byte[nBytes];

            // Retrieve the database buffer
            data.QueryDatabaseBuffer(buffer);

            // Save the buffer to a file
            // (NOTE: production software should use file 
            // encryption for privacy protection)
            File.WriteAllBytes(recognitionDatabase, buffer);

            dbState = "Saved";

            //save users to json file
            string jsontext = users.ToString();
            File.WriteAllText(userDatabase, jsontext);

            // Inform that a change has been made
            JObject json = new JObject(
                new JProperty("status", "reload"), 
                new JProperty("recognition_path", recognitionDatabase),
                new JProperty("user_path", userDatabase)
            );
            mClient.publish(json.ToString(), "database");
        }

        private void DeleteDatabaseFile()
        {
            if (File.Exists(recognitionDatabase))
            {
                File.Delete(recognitionDatabase);
                dbState = "Deleted";
            }
            else
            {
                dbState = "Not Found";
            }
        }

        private void ReleaseResources()
        {
            // Stop the worker thread
            processingThread.Abort();

            // Release resources
            faceData.Dispose();
            senseManager.Dispose();

            // close mqtt connection
            mClient.disconnect();
        }

        private void btnRegister_Click(object sender, RoutedEventArgs e)
        {
            doRegister = true;
        }

        private void btnUnregister_Click(object sender, RoutedEventArgs e)
        {
            doUnregister = true;
        }

        private void btnSaveDatabase_Click(object sender, RoutedEventArgs e)
        {
            SaveDatabaseToFile();
        }

        private void btnDeleteDatabase_Click(object sender, RoutedEventArgs e)
        {
            DeleteDatabaseFile();
        }
        private void btnExit_Click(object sender, RoutedEventArgs e)
        {
            ReleaseResources();
            this.Close();
        }
        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            ReleaseResources();
        }

        private void btnPreference_Click(object sender, RoutedEventArgs e)
        {
            Button b = (Button)sender;
            prefs[b.Name] = !prefs[b.Name];
            float.TryParse(txtTemperature.Text, out temperature);
            drawPreferences();
        }

        private void drawPreferences()
        {
            Button[] btns = new Button[] { btnAddress, btnCalendar, btnLocation, btnMusic, btnPhone };
            foreach(Button b in btns)
            {
                if (prefs[b.Name])
                {
                    b.Opacity = 1.0;
                }
                else b.Opacity = 0.2;
            }
            txtTemperature.Text = temperature + "";
        }
    }
}
