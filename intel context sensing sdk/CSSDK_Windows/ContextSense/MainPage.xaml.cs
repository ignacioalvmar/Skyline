using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Runtime.InteropServices.WindowsRuntime;
using Windows.Foundation;
using Windows.Foundation.Collections;
using Windows.UI.Xaml;
using Windows.UI.Xaml.Controls;
using Windows.UI.Xaml.Controls.Primitives;
using Windows.UI.Xaml.Data;
using Windows.UI.Xaml.Input;
using Windows.UI.Xaml.Media;
using Windows.UI.Xaml.Navigation;

using com.intel.context;
using com.intel.context.listeners;
using com.intel.context.error;
using com.intel.context.item;
using com.intel.context.providers.location;
using Windows.Devices.Geolocation;
using com.intel.context.providers;
using com.intel.context.providers.activity;
using com.intel.context.providers.deviceInformation;
using com.intel.context.providers.network;
using com.intel.context.providers.proximity;
using com.intel.context.providers.date;

namespace ContextSenseScratch
{
    /// <summary>
    /// An empty page that can be used on its own or navigated to within a Frame.
    /// </summary>
    public sealed partial class MainPage : Page
    {
        Sensing _sensing = new Sensing();

        public MainPage()
        {
            this.InitializeComponent();

            // Context sensing init
            _sensing.Start(new InitResponse());
        }

        private async void btnAction_Click(object sender, RoutedEventArgs e)
        {
            var access = await Geolocator.RequestAccessAsync();

            //Device-based Context States

            // mqtt notifier instance
            MQTTNotifier listener = new MQTTNotifier(this);

            // Location requires location and wifiControl capabilities
            LocationOptions loc_opt = new LocationOptions(SensingType.EVENT_BASED, 
                PositionAccuracy.High, 1, null);
            _sensing.enableSensing(ContextType.LOCATION, loc_opt, null);

            // activity
            ActivityOptions act_opt = new ActivityOptions(SensingType.EVENT_BASED);
            _sensing.enableSensing(ContextType.ACTIVITY, act_opt);

            // device information
            DeviceInformationOptions dev_opt = new DeviceInformationOptions();
            _sensing.enableSensing(ContextType.DEVICE_INFORMATION, dev_opt);

            //network
            NetworkOptions net_opt = new NetworkOptions();
            _sensing.enableSensing(ContextType.NETWORK, net_opt);

            ProximityOptions prox_opt = new ProximityOptions(SensingType.EVENT_BASED);
            _sensing.enableSensing(ContextType.PROXIMITY, prox_opt);

            _sensing.addContextTypeListener(ContextType.LOCATION, listener);
            _sensing.addContextTypeListener(ContextType.ACTIVITY, listener);
            _sensing.addContextTypeListener(ContextType.DEVICE_INFORMATION, listener);
            _sensing.addContextTypeListener(ContextType.NETWORK, listener);
            _sensing.addContextTypeListener(ContextType.PROXIMITY, listener);

            //CLOUD-based context states

            DateOptions date_opt = new DateOptions(SensingType.EVENT_BASED);
            _sensing.enableSensing(ContextType.DATE, date_opt);


            _sensing.addContextTypeListener(ContextType.DATE, listener);


        }

        public void setData(String data) {
            
            this.txtLocation.Select(txtLocation.Text.Length, 0);
            this.txtLocation.Text += "\n\r" + data;
        }
    }

    public class InitResponse : InitCallback
    {
        public void onError(ContextError error)
        {
            System.Diagnostics.Debug.WriteLine("InitCallbackError: " + error.Code + ", " + error.Message);
        }

        public void onSuccess()
        {
            System.Diagnostics.Debug.WriteLine("Sensing init ok!");
        }
    }

    public class MQTTNotifier : IContextListener
    {
        public TextBox _longitude;
        public TextBox _latitude;
        private MainPage _mainPage;

        public MQTTNotifier(MainPage mainPage)
        {
            this._mainPage = mainPage;
        }

        public void onError(ContextError error)
        {
            System.Diagnostics.Debug.WriteLine("LocationListener Error: " + error.Code + ", " + error.Message);
        }

        public void onSuccess(Item item)
        {
            if (item is LocationCurrent)
            {
                LocationCurrent currentItem = (LocationCurrent)item;
                _mainPage.setData(currentItem.ToString());
                System.Diagnostics.Debug.WriteLine("LocationListener item: " + currentItem.Location.ToString());
            }
            else if (item is DeviceInformationItem) {
                DeviceInformationItem currentItem = (DeviceInformationItem)item;
                _mainPage.setData(currentItem.ToString());
                System.Diagnostics.Debug.WriteLine("DeviceInformation item: " + currentItem.DeviceInformation.ToString());
            }
            else if (item is NetworkItem) {
                NetworkItem currentItem = (NetworkItem)item;
                _mainPage.setData(currentItem.ToString());
                System.Diagnostics.Debug.WriteLine("Network item: " + currentItem.Network.ToString());
            }
            else
            {
                System.Diagnostics.Debug.WriteLine("unknown item: " + item.ToString());
            }
        }
    }
}
