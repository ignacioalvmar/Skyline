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
using static PXCMFaceData.ExpressionsData;
using static PXCMFaceConfiguration;
using static PXCMFaceConfiguration.RecognitionConfiguration;

namespace DriverDetection
{
    /// <summary>
    /// Interaction logic for MainWindow.xaml
    /// </summary>
    public partial class MainWindow : Window
    {
        // Audio
        private PXCMAudioSource source;
        private Thread voiceRecognitionThread;
        private PXCMSpeechRecognition.Handler handler;

        // Realsense objects
        private PXCMSession session;
        private PXCMSenseManager senseManager;
        private RecognitionConfiguration recognitionConfig;
        private PXCMFaceData faceData;
        private PXCMSpeechRecognition sr;
        private Thread processingThread;

        // Variables
        private const int DatabaseUsers = 10;
        private const bool mirrorImage = true;
        private Int32 numFacesDetected;
        private string userId_driver;
        private string userId_passenger;
        private string dbState;
        private Rectangle faceLocation_driver;
        private Rectangle faceLocation_passenger;
        private bool passenger_detected = false;

        //database location
        private static string realsenseDB = "C:\\Users\\vhpalaci\\Desktop\\db\\realsense.bin";
        private static string jsonDB = "C:\\Users\\vhpalaci\\Desktop\\db\\user.json";

        // User database
        private JObject users;

        // sensing
        private string eyesState = "opened";
        private int eyesDetectionThrottle;
        private string gazeState = "up";
        private int gazeDetectionThrottle;
        private bool yawCompliant = true;
        private bool pitchCompliant = true;
        private bool rollCompliant = true;

        // Our mqtt client
        private Utils.MQTTClient mClient;

        // DEPRECATED by realsense
        /*private readonly Dictionary<FaceExpression, string> m_expression_head =
            new Dictionary<FaceExpression, string>
            {
                {FaceExpression.EXPRESSION_HEAD_TURN_LEFT, @"HeadTurnLeft"},
                {FaceExpression.EXPRESSION_HEAD_TURN_RIGHT, @"HeadTurnRight"},
                {FaceExpression.EXPRESSION_HEAD_UP, @"HeadUp"},
                {FaceExpression.EXPRESSION_HEAD_DOWN, @"HeadDown"},
                {FaceExpression.EXPRESSION_HEAD_TILT_LEFT, @"HeadTiltLeft"},
                {FaceExpression.EXPRESSION_HEAD_TILT_RIGHT, @"HeadTiltLeft"},
            };*/
        private readonly Dictionary<FaceExpression, string> m_expression_eyes =
           new Dictionary<FaceExpression, string>
           {
                {FaceExpression.EXPRESSION_EYES_CLOSED_LEFT, @"EyesClosedLeft"},
                {FaceExpression.EXPRESSION_EYES_CLOSED_RIGHT, @"EyesClosedRight"},
                {FaceExpression.EXPRESSION_EYES_TURN_LEFT, @"EyesTurnLeft"},
                {FaceExpression.EXPRESSION_EYES_TURN_RIGHT, @"EyesTurnRight"},
                {FaceExpression.EXPRESSION_EYES_UP, @"EyesTurnUp"},
                {FaceExpression.EXPRESSION_EYES_DOWN, @"EyesTurnDown"},
           };
        private readonly Dictionary<FaceExpression, string> m_expression_face =
           new Dictionary<FaceExpression, string>
           {
                {FaceExpression.EXPRESSION_BROW_RAISER_LEFT, @"BrowRaiserLeft"},
                {FaceExpression.EXPRESSION_BROW_RAISER_RIGHT, @"BrowRaiserRight"},
                {FaceExpression.EXPRESSION_BROW_LOWERER_LEFT, @"BrowLowererLeft"},
                {FaceExpression.EXPRESSION_BROW_LOWERER_RIGHT, @"BrowLowererRight"},
                {FaceExpression.EXPRESSION_SMILE, @"Smile"},
                {FaceExpression.EXPRESSION_KISS, @"Kiss"},
                {FaceExpression.EXPRESSION_MOUTH_OPEN, @"MouthOpen"},
                {FaceExpression.EXPRESSION_TONGUE_OUT, @"TongueOut"},
                {FaceExpression.EXPRESSION_PUFF_LEFT, @"PuffRight"},
                {FaceExpression.EXPRESSION_PUFF_RIGHT, @"PuffLeft"}
           };

        public MainWindow(PXCMSession session)
        {
            // GUI stuff
            InitializeComponent();
            rectFaceMarker_driver.Visibility = Visibility.Hidden;
            rectFaceMarker_passenger.Visibility = Visibility.Hidden;
            chkShowFaceMarker.IsChecked = true;
            radioBoth.IsChecked = false;
            radioDriver.IsChecked = true;
            radioPassenger.IsChecked = false;
            numFacesDetected = 0;
            userId_driver = string.Empty;
            userId_passenger = string.Empty;
            dbState = string.Empty;

            // Configure and start the Mqtt client
            string server = Properties.Settings.Default.mqtt_server;
            int port = Properties.Settings.Default.mqtt_port;
            string topic = Properties.Settings.Default.mqtt_topic;
            byte qos = Properties.Settings.Default.mqtt_qos;
            ushort keepalive = Properties.Settings.Default.mqtt_keepalive;
            int timeout = Properties.Settings.Default.mqtt_timeout;
            mClient = new Utils.MQTTClient(server, port, topic, qos, keepalive, timeout);
            mClient.subscribe(new string[] { "contextsense/realsense/#" }, subscribeCallback);

            // Start SenseManager and configure the face module
            this.session = session;
            ConfigureRealSense(realsenseDB, jsonDB);

            // Start the worker thread
            processingThread = new Thread(new ThreadStart(ProcessingThread));
            processingThread.Name = "ImageProcessing";
            processingThread.Start();
        }

        // MQTT topic subscriber callback
        private void subscribeCallback(string topic, string json)
        {
            if (topic.Equals("contextsense/realsense/detection"))
            {
                //ignore, this is our own message
            }
            else if(topic.Equals("contextsense/realsense/database"))
            {
                //extract parameters
                JObject msg = JObject.Parse(json);
                string path = (string)msg["recognition_path"];
                string user = (string)msg["user_path"];

                // we need to stop the thread so we can reconfigure realsense and reload database
                processingThread.Abort();

                // Release resources
                faceData.Dispose();
                senseManager.Dispose();

                //reconfigure using json parameters
                ConfigureRealSense(path, user);

                // Start the worker thread
                processingThread = new Thread(new ThreadStart(ProcessingThread));
                processingThread.Name = "ImageProcessing";
                processingThread.Start();
            }
            else
            {
                Console.WriteLine(topic + ": " + json);
            }
        }

        private void OnSpeechRecognition(PXCMSpeechRecognition.RecognitionData data)
        {
            string s = "";
            for (int i = 0; i < data.scores.Length; i++)
            {
                if (data.scores[i].confidence > 60)
                {
                    JObject audio = new JObject(
                        new JProperty("duration", data.duration),
                        new JProperty("confidence", data.scores[i].confidence),
                        new JProperty("phrase", data.scores[i].sentence)
                        );

                    s = data.scores[i].sentence;
                    Console.WriteLine(s);
                    mClient.publish(audio.ToString(), "audio");
                }
            }
        }

        private bool configureSpeechRecognition()
        {
            // Create speech recognition module
            
            pxcmStatus status = session.CreateImpl<PXCMSpeechRecognition>(out sr);
            if (status < pxcmStatus.PXCM_STATUS_NO_ERROR) return false;

            // Create speech module grammar
            status = sr.BuildGrammarFromStringList(1, new string[] {"take over control", "hand over control", "hi car", "take over", "hand over" }, null);
            if (status < pxcmStatus.PXCM_STATUS_NO_ERROR) return false;
            sr.SetGrammar(1);

            // Select audio source
            source = session.CreateAudioSource();
            source.ScanDevices();
            PXCMAudioSource.DeviceInfo dinfo = null;
            for (int d = source.QueryDeviceNum() - 1; d >= 0; d--)
            {
                source.QueryDeviceInfo(d, out dinfo);

                //if (dinfo.name == "Headset Microphone (Plantronics BT300M)") break; // headset
                if (dinfo.name == "Microphone Array (BlasterX Senz3D VF0810)") break; // Realsense SR300 mic array
                //if (dinfo.name == "Internal Microphone (Conexant ISST Audio)") break; // Internal laptop speaker
            }
            source.SetDevice(dinfo);

            // create speech handler
            handler = new PXCMSpeechRecognition.Handler();
            handler.onRecognition = OnSpeechRecognition;
            
            PXCMSpeechRecognition.ProfileInfo pinfo;
            sr.QueryProfile(0, out pinfo);
            pinfo.language = PXCMSpeechRecognition.LanguageType.LANGUAGE_US_ENGLISH;
            sr.SetProfile(pinfo);

            voiceRecognitionThread = new Thread(StartVoiceRecognition);
            voiceRecognitionThread.Name = "AudioProcessing";
            voiceRecognitionThread.Start();
            return true;
        }

        private void StartVoiceRecognition()
        {
            sr.StartRec(source, handler);
        }

        private void ConfigureRealSense(string dbpath, string userpath)
        {
            //configureSpeechRecognition();

            // Get sense manager instance
            senseManager = session.CreateSenseManager();

            // Enable the color stream
            senseManager.EnableStream(PXCMCapture.StreamType.STREAM_TYPE_COLOR, 640, 480, 30);

            // Enable the face module
            senseManager.EnableFace();
            PXCMFaceModule faceModule = senseManager.QueryFace();
            PXCMFaceConfiguration faceConfig = faceModule.CreateActiveConfiguration();

            // Configure for 3D face tracking (if camera cannot support depth it will revert to 2D tracking)
            faceConfig.SetTrackingMode(TrackingModeType.FACE_MODE_COLOR_PLUS_DEPTH);

            // enable expressions
            ExpressionsConfiguration expConfig = faceConfig.QueryExpressions();
            expConfig.EnableAllExpressions();
            expConfig.Enable();

            // Enable facial recognition
            recognitionConfig = faceConfig.QueryRecognition();
            recognitionConfig.Enable();

            // Enable pulse
            PulseConfiguration pulseconfig = faceConfig.QueryPulse();
            pulseconfig.Enable();

            // Create a recognition database
            RecognitionStorageDesc recognitionDesc = new RecognitionStorageDesc();
            recognitionDesc.maxUsers = DatabaseUsers;
            LoadDatabaseFromFile(dbpath, userpath);
            recognitionConfig.SetRegistrationMode(RecognitionRegistrationMode.REGISTRATION_MODE_CONTINUOUS);

            // Apply changes and initialize
            faceConfig.ApplyChanges();

            /*
            // gets and selects camera devices
            PXCMCapture _capture;
            PXCMSession.ImplDesc desc = new PXCMSession.ImplDesc
            {
                @group = PXCMSession.ImplGroup.IMPL_GROUP_SENSOR,
                subgroup = PXCMSession.ImplSubgroup.IMPL_SUBGROUP_VIDEO_CAPTURE
            };
            PXCMCapture.DeviceInfo dinfo = null;
            for (int i = 0; ; i++)
            {
                PXCMSession.ImplDesc desc1;
                if (session.QueryImpl(desc, i, out desc1) < pxcmStatus.PXCM_STATUS_NO_ERROR) break;

                if (session.CreateImpl<PXCMCapture>(desc1, out _capture) < pxcmStatus.PXCM_STATUS_NO_ERROR) continue;
                for (int j = 0; ; j++)
                {
                    if (_capture.QueryDeviceInfo(j, out dinfo) < pxcmStatus.PXCM_STATUS_NO_ERROR) break;
                    string name = dinfo.name;
                    Console.WriteLine(name);
                }
            }
            senseManager.captureManager.FilterByDeviceInfo(dinfo);*/

            senseManager.Init();
            faceData = faceModule.CreateOutput();

            // Mirror image
            if (mirrorImage)
            {
                senseManager.QueryCaptureManager().QueryDevice().SetMirrorMode(PXCMCapture.Device.MirrorMode.MIRROR_MODE_HORIZONTAL);
            }

            // Release resources
            faceConfig.Dispose();
            faceModule.Dispose();
         }

        private void ProcessingThread()
        {
            // MQTT Events throttle
            int faceDetectionThrottle = 0;
            while (senseManager.AcquireFrame(true) >= pxcmStatus.PXCM_STATUS_NO_ERROR)
            {
                passenger_detected = false;

                // Acquire the color image data
                PXCMCapture.Sample sample = senseManager.QuerySample();
                Bitmap colorBitmap;
                PXCMImage.ImageData colorData;
                sample.color.AcquireAccess(PXCMImage.Access.ACCESS_READ, PXCMImage.PixelFormat.PIXEL_FORMAT_RGB24, out colorData);
                colorBitmap = colorData.ToBitmap(0, sample.color.info.width, sample.color.info.height);

                // choose driver/passenger identification
                string detectDriverPassenger = null;
                Dispatcher.Invoke(delegate () {
                    if (radioDriver.IsChecked == true) detectDriverPassenger = "driver";
                    if (radioPassenger.IsChecked == true) detectDriverPassenger = "passenger";
                    if (radioBoth.IsChecked == true) detectDriverPassenger = "both";
                });

                // Get face data
                if (faceData != null)
                {
                    faceData.Update();
                    numFacesDetected = faceData.QueryNumberOfDetectedFaces();
                    if (detectDriverPassenger == "driver" || detectDriverPassenger=="passenger")
                    {
                        if (numFacesDetected > 1) numFacesDetected = 1;
                    }
                    else if (numFacesDetected > 2) numFacesDetected = 2;
                    for (int faceid = 0; faceid < numFacesDetected; faceid++)
                    {
                        // driver or passenger
                        bool driver = false;

                        // Get the first face detected (index 0)
                        Face face = faceData.QueryFaceByIndex(faceid);

                        // Process face recognition data
                        if (face != null)
                        {
                            // Retrieve face location data
                            DetectionData faceDetectionData = face.QueryDetection();
                            if (faceDetectionData != null)
                            {
                                PXCMRectI32 faceRect;
                                faceDetectionData.QueryBoundingRect(out faceRect);
                                Rectangle faceLocation = new Rectangle(faceRect.x, faceRect.y, faceRect.w, faceRect.h);
                                if (detectDriverPassenger=="driver" || (detectDriverPassenger=="both" && faceLocation.X < 300) )
                                {
                                    faceLocation_driver = faceLocation;
                                    driver = true;
                                }
                                else
                                {
                                    faceLocation_passenger = faceLocation;
                                    driver = false;
                                    passenger_detected = true;
                                }
                            }

                            // Retrieve the recognition data instance
                            RecognitionData recognitionData = face.QueryRecognition();

                            // Process expressions
                            ExpressionsData exprData = face.QueryExpressions();
                            //JObject jsonExpressions = new JObject();
                            if (exprData != null)
                            {
                                //get facial expressions
                                JObject jsonFace = new JObject();
                                foreach (var face_expr in m_expression_face)
                                {
                                    FaceExpressionResult result;
                                    bool status = exprData.QueryExpression(face_expr.Key, out result);
                                    if (!status) continue;
                                    jsonFace.Add(face_expr.Value, result.intensity);
                                }


                                if (driver) {
                                    getHeadPose(face);
                                    //get eye expressions
                                    getEyesExpression(exprData);
                                }

                            }

                            // pulse
                            /*var pulseData = face.QueryPulse();
                            if (pulseData != null)
                            {
                                float p = pulseData.QueryHeartRate();
                                jsonExpressions.Add("HeartRate", p);
                            }*/

                            // final json to be published
                            JObject json = null;

                            // Set the user ID and process register/unregister logic
                            if (recognitionData.IsRegistered())
                            {
                                string olduser = driver ? userId_driver : userId_passenger;
                                string newUserId = Convert.ToString(recognitionData.QueryUserID());
                                if (!olduser.Equals(newUserId) || faceDetectionThrottle == 0)
                                {
                                    JObject user = (JObject)users[newUserId].DeepClone();
                                    //user.Add("expressions", jsonExpressions);
                                    //json = new JObject(new JProperty("UserDetected", user));
                                    json = user;
                                    if (driver || detectDriverPassenger == "passenger")
                                    {
                                        Dispatcher.Invoke(delegate () {
                                            drawPreferences((JObject)users[newUserId]);
                                        });
                                    }
                                }
                                if (driver) userId_driver = newUserId;
                                else userId_passenger = newUserId;
                            }
                            else
                            {
                                if (driver)
                                {
                                    userId_driver = "Unrecognized";
                                    Dispatcher.Invoke(delegate () { drawPreferences(null); });
                                }
                                else userId_passenger = "Unrecognized";
                            }
                            if (json != null)
                            {
                                if (driver)
                                {
                                    mClient.publish(json.ToString(), "driver");
                                }
                                else
                                {
                                    mClient.publish(json.ToString(), "passenger");
                                }
                            }
                        }
                    }

                    if(numFacesDetected==0)
                    {
                        userId_driver = userId_passenger = "No users in view";
                        Dispatcher.Invoke(delegate () { drawPreferences(null); });
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

                // send mqtt 'detect' message every ~30 seconds
                faceDetectionThrottle = (faceDetectionThrottle == 30 * 30 ? 0 : faceDetectionThrottle+1);
            }
        }

        private void getHeadPose(Face face)
        {
            // Retrieve pose estimation data
            PoseData facePoseData = face.QueryPose();
            if (facePoseData != null)
            {
                PoseEulerAngles headAngles;
                facePoseData.QueryPoseAngles(out headAngles);
                

                // Yaw detection
                // head yaw should be greater than -30 and less than 30, offsetting depending on the camera/drivers position
                /*int yawOffset = 40;
                if (headAngles.yaw < yawOffset-30 || headAngles.yaw > yawOffset + 30) // out of constraints
                {
                    if (yawCompliant) // previous state was compliant, send mqtt
                    {
                        JObject head = new JObject(
                            new JProperty("Type", "Yaw"),
                            new JProperty("State", !yawCompliant)
                        );
                        mClient.publish(head.ToString(), "contextsense/monitor/head", false);
                    }
                    yawCompliant = false;
                }
                else
                {
                    if (!yawCompliant) // yaw corrected, send mqtt
                    {
                        JObject head = new JObject(
                            new JProperty("Type", "Yaw"),
                            new JProperty("State", !yawCompliant)
                        );
                        mClient.publish(head.ToString(), "contextsense/monitor/head", false);
                    }
                    yawCompliant = true;
                }*/
                //Console.WriteLine("Head pitch:" + headAngles.pitch);

                // pitch detection
                // head pitch should be greater than 0
                if (headAngles.pitch < -5) // out of constraints
                {
                    if (pitchCompliant) // previous state was compliant, send mqtt
                    {
                        JObject head = new JObject(
                            new JProperty("Type", "Pitch"),
                            new JProperty("State", !pitchCompliant)
                        );
                        mClient.publish(head.ToString(), "contextsense/monitor/head", false);
                    }
                    pitchCompliant = false;
                }
                else if (headAngles.pitch > 5)
                {
                    if (!pitchCompliant) // yaw corrected, send mqtt
                    {
                        JObject head = new JObject(
                            new JProperty("Type", "Pitch"),
                            new JProperty("State", !pitchCompliant)
                        );
                        mClient.publish(head.ToString(), "contextsense/monitor/head", false);
                    }
                    pitchCompliant = true;
                }
            }
        }

        private void getEyesExpression(ExpressionsData exprData)
        {
            FaceExpressionResult result;
            int leftEye=-1, rightEye=-1, down=-1;
            if (exprData.QueryExpression(FaceExpression.EXPRESSION_EYES_CLOSED_LEFT, out result)) leftEye = result.intensity;
            if (exprData.QueryExpression(FaceExpression.EXPRESSION_EYES_CLOSED_RIGHT, out result)) rightEye = result.intensity;
            //if (exprData.QueryExpression(FaceExpression.EXPRESSION_EYES_DOWN, out result)) down = result.intensity;

            bool currentEyesClosed;
            if (leftEye > 99 || rightEye > 99) currentEyesClosed = true;
            else if (leftEye < 0 || rightEye < 0) return;
            else currentEyesClosed = false;

            /*bool currentGazeDown;
            if (down > 85) currentGazeDown = true;
            else if (down < 0) return;
            else currentGazeDown = false;*/

            // Eyes closed detection
            if (eyesState.Equals("opened"))
            {
                if (currentEyesClosed)
                {
                    eyesDetectionThrottle = 0;
                    eyesState = "maybeclosed";
                }
            }
            else if (eyesState.Equals("maybeclosed")) // is the user blinking?
            {
                if (currentEyesClosed)
                {
                    if (eyesDetectionThrottle++ > 18) // more than 30 frames user def. has eyes closed
                    {
                        JObject eye = new JObject(
                            new JProperty("Type", "Open"),
                            new JProperty("State", false)
                        );
                        mClient.publish(eye.ToString(), "contextsense/monitor/eyes", false);
                        eyesState = "closed";
                    }
                }
                else eyesState = "opened";
            }
            else if (eyesState.Equals("closed"))
            {
                if (!currentEyesClosed) // user opened eyes
                {                    
                    JObject eye = new JObject(
                        new JProperty("Type", "Open"),
                        new JProperty("State", true)
                    );
                    mClient.publish(eye.ToString(), "contextsense/monitor/eyes", false);
                    eyesState = "opened";
                }
            }

            // gaze down detection
            /*if (gazeState.Equals("up"))
            {
                if (currentGazeDown)
                {
                    gazeDetectionThrottle = 0;
                    gazeState = "maybedown";
                }
            }
            else if (gazeState.Equals("maybedown")) // is the user blinking?
            {
                if (currentGazeDown)
                {
                    if (gazeDetectionThrottle++ > 30) // more than 30 frames user def. has eyes closed
                    {
                        JObject eye = new JObject(
                            new JProperty("Type", "Down"),
                            new JProperty("State", true)
                        );
                        mClient.publish(eye.ToString(), "contextsense/monitor/eyes", false);
                        gazeState = "down";
                    }
                }
                else gazeState = "up";
            }
            else if (gazeState.Equals("down"))
            {
                if (!currentGazeDown) // user opened eyes
                {
                    JObject eye = new JObject(
                        new JProperty("Type", "Down"),
                        new JProperty("State", false)
                    );
                    mClient.publish(eye.ToString(), "contextsense/monitor/eyes", false);
                    gazeState = "up";
                }
            }*/
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
                lblUserId.Content = String.Format("User ID: {0}", userId_driver);
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
                    bool both = numFacesDetected==2 ? true : false;

                    //passenger side detected
                    if ((numFacesDetected == 1 && !passenger_detected) || both)
                    {
                        // Show face marker
                        rectFaceMarker_driver.Height = faceLocation_driver.Height;
                        rectFaceMarker_driver.Width = faceLocation_driver.Width;
                        Canvas.SetLeft(rectFaceMarker_driver, faceLocation_driver.X);
                        Canvas.SetTop(rectFaceMarker_driver, faceLocation_driver.Y);
                        rectFaceMarker_driver.Visibility = Visibility.Visible;


                        // Show floating ID label
                        lblFloatingId_driver.Content = String.Format("Driver ID: {0}", userId_driver);
                        Canvas.SetLeft(lblFloatingId_driver, faceLocation_driver.X);
                        Canvas.SetTop(lblFloatingId_driver, faceLocation_driver.Y - 20);
                        lblFloatingId_driver.Visibility = Visibility.Visible;
                    }
                    else {
                        rectFaceMarker_driver.Visibility = Visibility.Hidden;
                        lblFloatingId_driver.Visibility = Visibility.Hidden;
                    }

                    //driver side detected
                    if ((numFacesDetected == 1 && passenger_detected) || both)
                    {
                        // Show face marker
                        rectFaceMarker_passenger.Height = faceLocation_passenger.Height;
                        rectFaceMarker_passenger.Width = faceLocation_passenger.Width;
                        Canvas.SetLeft(rectFaceMarker_passenger, faceLocation_passenger.X);
                        Canvas.SetTop(rectFaceMarker_passenger, faceLocation_passenger.Y);
                        rectFaceMarker_passenger.Visibility = Visibility.Visible;

                        // Show floating ID label
                        lblFloatingId_passenger.Content = String.Format("Passenger ID: {0}", userId_passenger);
                        Canvas.SetLeft(lblFloatingId_passenger, faceLocation_passenger.X);
                        Canvas.SetTop(lblFloatingId_passenger, faceLocation_passenger.Y - 20);
                        lblFloatingId_passenger.Visibility = Visibility.Visible;
                    }
                    else
                    {
                        rectFaceMarker_passenger.Visibility = Visibility.Hidden;
                        lblFloatingId_passenger.Visibility = Visibility.Hidden;

                    }
                }
                else
                {
                    // Hide the face marker and floating ID label
                    rectFaceMarker_driver.Visibility = Visibility.Hidden;
                    rectFaceMarker_passenger.Visibility = Visibility.Hidden;
                    lblFloatingId_driver.Visibility = Visibility.Hidden;
                    lblFloatingId_passenger.Visibility = Visibility.Hidden;
                }
            }));

            // Release resources
            bitmap.Dispose();
        }

        private void LoadDatabaseFromFile(string path, string user)
        {
            // load user json database
            if (File.Exists(user))
            {
                string json = File.ReadAllText(user);
                users = JObject.Parse(json);
            }
            else
            {
                users = new JObject();
            }

            //load realsense recognition database
            if (File.Exists(path))
            {
                Byte[] buffer = File.ReadAllBytes(path);
                recognitionConfig.SetDatabaseBuffer(buffer);
                dbState = "Loaded";
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
            //voiceRecognitionThread.Abort();

            // Release resources
            faceData.Dispose();
            senseManager.Dispose();

            // close mqtt connection
            mClient.disconnect();
        }
        private void btnExit_Click(object sender, RoutedEventArgs e)
        {
            ReleaseResources();
            session.Dispose();
            this.Close();
        }

        private void Window_Closing(object sender, System.ComponentModel.CancelEventArgs e)
        {
            ReleaseResources();
        }

        private void drawPreferences(JObject user)
        {
            if (user == null)
            {
                imgUser.Source = new BitmapImage();
                lblUsername.Content = "Name: ";
                lblPreferences.Content = "Preferences: ";
            }
            else {
                imgUser.Source = new BitmapImage(new Uri((string)user["image"]));
                lblUsername.Content = "Name: " + user["name"];
                lblPreferences.Content = "Preferences: " + user["preferences"].ToString();
            }
        }
    }
}
