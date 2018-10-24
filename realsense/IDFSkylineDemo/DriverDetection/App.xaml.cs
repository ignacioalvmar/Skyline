using System;
using System.Collections.Generic;
using System.Configuration;
using System.Data;
using System.Linq;
using System.Threading.Tasks;
using System.Windows;

namespace DriverDetection
{
    /// <summary>
    /// Interaction logic for App.xaml
    /// </summary>
    public partial class App : Application
    {
        private void realsense_startup(object sender, StartupEventArgs e)
        {
            // realsense session
            PXCMSession session = PXCMSession.CreateInstance();

            // Create the startup window
            MainWindow wnd = new MainWindow(session);
            wnd.Show();
        }
    }
}
