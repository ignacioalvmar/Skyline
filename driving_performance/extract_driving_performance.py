from __future__ import print_function
import pandas as pd
import numpy as np
import sys
import json
import csv
from pandas.io.json import json_normalize
import matplotlib.pyplot as plt
import matplotlib.dates as md
# from weasyprint import HTML
# from jinja2 import Environment, FileSystemLoader

import Tkinter as Tk
from tkFileDialog import askopenfilename
import os
import datetime

# LOADING SOURCES AND FILENAMES
# Prompt console to load the file in the path
print ("\n Welcome to the SKYNIVI Driving Performance Metric generator \n")
username = raw_input("Please enter the participant's username: ")
print ("--- Username set as: "+ username)
taskID = raw_input("Please enter the taskID: ")
print ("Task ID set as: "+ taskID)

print ("Please select the simulator log file: ")
root = Tk.Tk()
root.withdraw() # Don't want a full GUI, keep the root window from appearing
filename = askopenfilename() # show an "Open" dialog box and return the path to the selected file
print("Opening Simulator File :", filename)

# Extract filename from path in the selected file
selection = os.path.split(filename)
path = selection[0]
file = selection[1].split(".")[0]
print ("Simulator file path: ", path)
# report_template = "customer_report_template.html"

# Import Simulator Data into Pandas DataFrame
data = []
with open(filename) as f:
    for line in f:
        data.append(json.loads(line))
df = pd.DataFrame(data)

# Create dataframe with Driving Car-Status Data
timestamp = df['timestamp'] # Extract timestamps into a Series
carData = json_normalize(df.to_dict('list'), ['carState']).unstack().apply(pd.Series) # Unstack json from carData
car_data = carData.assign(timestamp=timestamp.values).dropna(subset=['speedMPH']) # clean rows with NaN vehicle speed, those will correspond to infractions and simulator events
clean_car_data = car_data.drop(car_data.columns[[0]], axis=1).set_index(car_data['timestamp']).drop('timestamp', axis=1)
print ("Finished parsing Car-Status Data")
# print(clean_car_data)

# Create dataframe with Simulator Events
clean_event_data = df.drop('unitytime', axis=1).drop('carState', axis=1).drop('infraction', axis=1).set_index(df['timestamp']).drop('timestamp', axis=1).dropna(subset=['event'])
print ("Finished parsing Simulator Event Data")
# print (new_eventData)

# Create dataframe with Driving Infractions
infractionData = json_normalize(df.to_dict('list'), ['infraction']).unstack().apply(pd.Series)
infraction_data = infractionData.assign(timestamp=timestamp.values).dropna(subset=['id'])
clean_infraction_data = infraction_data.drop(infraction_data.columns[[0]], axis=1).set_index(infraction_data['timestamp']).drop('timestamp', axis=1)
print ("Finished parsing Infraction Data")
# print ("Resulting Infraction Data: ")
# print (clean_infraction_data)

# DRIVING PERFORMANCE SUMMARY
# Calculate Mean, Min, Max and SD on Speed, Acceleration (Throttle), and Steering Wheel Deviation
speed_mean = clean_car_data['speedMPH'].astype('float').mean()
speed_max =	 clean_car_data['speedMPH'].astype('float').max()
speed_min = clean_car_data['speedMPH'].astype('float').min()
speed_sd = clean_car_data['speedMPH'].astype('float').std()

throtle_mean = clean_car_data['accelInput'].astype('float').mean()
throtle_max =	 clean_car_data['accelInput'].astype('float').max()
throtle_min = clean_car_data['accelInput'].astype('float').min()
throtle_sd = clean_car_data['accelInput'].astype('float').std()

steeringwheel_mean = clean_car_data['steeringWheelInput'].astype('float').mean()
steeringwheel_max =	 clean_car_data['steeringWheelInput'].astype('float').max()
steeringwheel_min = clean_car_data['steeringWheelInput'].astype('float').min()
steeringwheel_sd = clean_car_data['steeringWheelInput'].astype('float').std()

print ("Simulator Driving Performance summary \n \
	Speed >> Mean: %(a)s, SD: %(b)s, Max: %(c)s, Min: %(d)s \n \
	Throtle >> Mean: %(e)s, SD: %(f)s, Max: %(g)s, Min: %(h)s \n \
	Steering Wheel Angle >> Mean: %(i)s, SD: %(j)s, Max: %(k)s, Min: %(l)s \n \
	" %{"a":speed_mean,"b":speed_sd,"c":speed_max,"d":speed_min,\
		"e":throtle_mean,"f":throtle_sd,"g":throtle_max,"h":throtle_min, \
		"i":steeringwheel_mean,"j":steeringwheel_sd,"k":steeringwheel_max,"l":steeringwheel_min})

# Calculate Traffic Violations and break them down by type
total_infractions = len(clean_infraction_data)
wrong_lane_changes = (clean_infraction_data.type == "LANE").sum()
env_collisions = (clean_infraction_data.type == "ENV").sum()
car_collisions = (clean_infraction_data.type == "TRAF").sum()
streetlights = (clean_infraction_data.type == "LIGHT").sum()

print ("Simulator Traffic Violations summary \n \
	Total Infractions: %(a)s \n \
	Wrong Lane Changes: %(b)s \n \
	Traffic Light Violations: %(c)s \n \
	Collisions with Environment Objects: %(d)s \n \
	Collisions with vehicles: %(e)s\n \
	" %{"a": total_infractions,"b":wrong_lane_changes, "c":streetlights, "d":env_collisions, "e":car_collisions})

# SUMMARY FOR CSV
summary = "ParticipantID, %(m)s \n \
		TaskID, %(n)s \n \
		Simulator Driving Performance Summary \n \
		 , Mean, SD, Max, Min \n \
		 Speed, %(a)s,%(b)s,%(c)s,%(d)s \n \
		 Throtle, %(e)s,%(f)s,%(g)s,%(h)s \n \
		 Steering Wheel Angle, %(i)s,%(j)s,%(k)s,%(l)s \n \
		 "%{"a":speed_mean,"b":speed_sd,"c":speed_max,"d":speed_min,\
		"e":throtle_mean,"f":throtle_sd,"g":throtle_max,"h":throtle_min, \
		"i":steeringwheel_mean,"j":steeringwheel_sd,"k":steeringwheel_max,"l":steeringwheel_min, \
		"m":username, "n":taskID}

# SAVE SUMMARY, DRIVING PERFORMANCE, INFRACTION AND SIM EVENT DATA AS .CSV FOR LATER ANALYSIS
export_filename = username+"_"+taskID+"_"+file+".csv"
clean_car_data.to_csv("cardata_"+export_filename)
clean_infraction_data.to_csv("infractiondata_"+export_filename)
clean_event_data.to_csv("eventdata_"+export_filename)
with open('summary_'+export_filename, 'w') as f:
	for line in summary:
		f.write(line)

print ("--- Finished parsing simulator logs for participant: %(a)s, task: %(b)s" %{"a":username,"b":taskID})

# Plotting data
print("--- Generating plots: ")
# plt.use('Qt4Agg')
speed_df = clean_car_data.filter(['speedMPH']).astype('float')
speed_df.index = pd.to_datetime(speed_df.index)
speed_plot = speed_df.plot()
speed_plot.xaxis.set_major_formatter(md.DateFormatter('%H:%M:%S'))
plt.xticks(rotation=90, horizontalalignment = 'right')
plt.xlabel('Time')
plt.ylabel('Speed in MPH')
plt.title('Speed participant: %(a)s, task: %(b)s' %{"a":username, "b":taskID})
plt.show(block=False)
print("--- Generated Speed: ")

throtle_df = clean_car_data.filter(['accelInput']).astype('float')
throtle_df.index = pd.to_datetime(throtle_df.index)
throtle_plot = throtle_df.plot()
throtle_plot.xaxis.set_major_formatter(md.DateFormatter('%H:%M:%S'))
plt.xticks(rotation=90, horizontalalignment = 'right')
plt.xlabel('Time')
plt.ylabel('Acceleration [0-1]')
plt.title('Throtle participant: %(a)s, task: %(b)s' %{"a":username, "b":taskID})
plt.show(block=False)
print("--- Generated Throtle: ")

sw_angle_df = clean_car_data.filter(['steeringWheelInput']).astype('float')
sw_angle_df.index = pd.to_datetime(sw_angle_df.index)
swangle_plot = sw_angle_df.plot()
swangle_plot.xaxis.set_major_formatter(md.DateFormatter('%H:%M:%S'))
plt.xticks(rotation=90, horizontalalignment = 'right')
plt.xlabel('Time')
plt.ylabel('Steering Wheel Angle [-1,1]')
plt.title('Steering Wheel Angle, Participant: %(a)s, Task: %(b)s' %{"a":username, "b":taskID})
plt.show(block=False)
print("--- Generated Steering Wheel Angle: ")
print ("--- Press CRTL + C to finish --- ")
print("--- End of Script ---")
plt.show(block=True)