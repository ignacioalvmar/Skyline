README

Intel SKYNIVI Driving Simulator Log Parser

------------------------------------------

The file extract_driving_performance.py is a python script developed to parse SKYNIVI driving simulator logs.

DEPENDENCIES
You need to have python installed on your machine. The current script has been tested with python v.2.7.13 on Windows 10.
You need to install some python modules to run the script appropriately:
- pandas 0.20.2
- numpy 1.13.0
- matplotlib 2.0.2 

USE MANUAL
Execute the script by either double clicking on it or going to a terminal / command window, navigating to the appropriate folder and typing: 
	> python extract_driving_performance.py
The script will ask for Participant ID
	> OR-01	(e.g. Oregon # 01)
The script will ask for Task ID
	> ManNoNav (e.g. manual no navigation)
The scritp will open a window to select the log file
	> 
The script will print the summary report of driver metrics on the console, open windows with speed, throtle and steeringwheel angle.
You can visualize, customize and save those figures independently.
The script will also generate independent .csv files for the summary driver performance, raw cardata, infractions and simulator recorded events.
The .csv files can be later used to generate cross-participant metrics or for statistical analysis.

RESULT
The following files will be generated in the same directory where the script is.
- summary_OR-01_NoNav_2017-08-04_13-37-35.csv
- cardata_OR-01_NoNav_2017-08-04_13-37-35.csv
- infractiondata_OR-01_NoNav_2017-08-04_13-37-35.csv
- eventdata_OR-01_NoNav_2017-08-04_13-37-35.csv