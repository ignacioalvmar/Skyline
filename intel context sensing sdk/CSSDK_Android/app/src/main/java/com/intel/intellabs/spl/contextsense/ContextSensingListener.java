/* INTEL CONFIDENTIAL
* Copyright 2016 Intel Corporation All Rights Reserved.
*
* The source code contained or described herein and all documents related to
* the source code ("Material") are owned by Intel Corporation or its
* suppliers or licensors. Title to the Material remains with Intel Corporation
* or its suppliers and licensors. The Material contains trade secrets and
* proprietary and confidential information of Intel or its suppliers and
* licensors. The Material is protected by worldwide copyright and trade
* secret laws and treaty provisions. No part of the Material may be used,
* copied, reproduced, modified, published, uploaded, posted, transmitted,
* distributed, or disclosed in any way without Intel's prior express written
* permission.
*
* No license under any patent, copyright, trade secret or other intellectual
* property right is granted to or conferred upon you by disclosure or delivery
* of the Materials, either expressly, by implication, inducement, estoppel
* or otherwise. Any license under such intellectual property rights must be
* express and approved by Intel in writing.
*
* Originally created by the Intel Labs, System Prototyping Lab Team.
* Skyline contact: Ignacio J Alvarez
* Author(s): Victor H Palacios
*/

package com.intel.intellabs.spl.contextsense;

import android.content.Context;
import android.location.Location;
import android.util.Log;
import android.widget.TextView;
import android.widget.Toast;

import com.intel.context.error.ContextError;
import com.intel.context.item.ActivityRecognition;
import com.intel.context.item.AudioClassification;
import com.intel.context.item.Battery;
import com.intel.context.item.Beacons;
import com.intel.context.item.Calendar;
import com.intel.context.item.Call;
import com.intel.context.item.DevicePositionItem;
import com.intel.context.item.EarTouchItem;
import com.intel.context.item.Item;
import com.intel.context.item.LiftItem;
import com.intel.context.item.LocationCurrent;
import com.intel.context.item.activityrecognition.PhysicalActivity;
import com.intel.context.item.audioclassification.Audio;
import com.intel.context.item.beacons.BeaconInfo;
import com.intel.context.item.calendar.CalendarEvent;
import com.intel.context.item.lift.LiftType;
import com.intel.context.provider.custom.VoiceKey;
import com.intel.context.sensing.ContextTypeListener;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;

/**
 * Created by vhpalaci on 11/16/2016.
 */

public class ContextSensingListener implements ContextTypeListener
{
    private final String TAG = ContextSensingListener.class.getSimpleName();
    private Context context;
    private MqttClient mClient;

    ContextSensingListener(Context context, MqttClient mClient)
    {
        this.context = context;
        this.mClient = mClient;
    }

    public void setMQTTStatusCallback(MQTTStatusCallback callback){
        this.mClient.setMQTTStatusCallback(callback);
    }

    public void configureMQTT(String server, int port)
    {
        mClient.configureMQTT(server, port);
    }

    public String getMQTTConfiguration(){
        return mClient.getConfiguration();
    }

    @Override
    public void onReceive(Item state)
    {
        try
        {
            JSONObject json = new JSONObject();
            if(state instanceof ActivityRecognition)
            {
                ActivityRecognition actStatus = (ActivityRecognition)state;
                PhysicalActivity mostProbableActivity = actStatus.getMostProbableActivity();
                json.put("Activity", mostProbableActivity.getActivity());
                json.put("ActivityProbability", mostProbableActivity.getProbability());
            }
            else if (state instanceof Battery)
            {
                Battery bStatus = (Battery) state;
                json.put("BatteryPresent", bStatus.getBatteryPresent());
                json.put("BatteryLevel", bStatus.getLevel());
                json.put("Plugged", bStatus.getPlugged());
                json.put("Temperature", bStatus.getTemperature());
                json.put("TimeOnBattery", bStatus.getTimeOnBattery());
                json.put("RemainingBattery", bStatus.getRemainingBatteryLife());
                json.put("Status", bStatus.getStatus());
            }
            else if (state instanceof DevicePositionItem)
            {
                DevicePositionItem posStatus = (DevicePositionItem) state;
                json.put("Position", posStatus.getType().name());
            }
            else if (state instanceof AudioClassification)
            {
                AudioClassification dev = (AudioClassification) state;
                Audio mostProbableAudio = dev.getMostProbableAudio();
                json.put("AudioType", mostProbableAudio.getName());
                json.put("AudioProbability", mostProbableAudio.getProbability());
            }
            else if (state instanceof Call)
            {
                Call callStatus = (Call) state;
                json.put("Caller", callStatus.getCaller());
                json.put("NotificationType", callStatus.getNotificationType());
                json.put("ContactInfo", callStatus.getContactName());
                json.put("RingCount", callStatus.getRingQuantity());
                json.put("MissedCount", callStatus.getMissedQuantity());
            }
            else if (state instanceof Calendar)
            {
                Calendar calStatus = (Calendar) state;
                List<CalendarEvent> events = calStatus.getEvents();
                json.put("EventCount", events.size());
                JSONArray arr = new JSONArray();
                for(CalendarEvent event: events)
                {
                    JSONObject obj = new JSONObject();
                    obj.put("Title",event.getTitle());
                    obj.put("Description",event.getDescription());
                    obj.put("Duration",event.getDuration());
                    obj.put("StartDate",event.getStartDate());
                    obj.put("EndDate",event.getEndDate());
                    obj.put("Location",event.getLocation());
                    obj.put("Timezone",event.getTimezone());
                    arr.put(obj);
                }
                json.put("Events", arr);
            }
            else if (state instanceof Beacons)
            {
                Beacons bStatus = (Beacons) state;
                List<BeaconInfo> beacons = bStatus.getBeacons();
                json.put("BeaconCount", beacons.size());
                JSONArray arr = new JSONArray();
                for(BeaconInfo b: beacons)
                {
                    JSONObject obj = new JSONObject();
                    obj.put("MAC",b.getMACAddress());
                    obj.put("UUID",b.getUUID());
                    obj.put("RSSI",b.getRSSILevel());
                    obj.put("Distance",b.getDistance());
                    obj.put("Status",b.getStatus());
                    arr.put(obj);
                }
                json.put("Beacons", arr);
            }
            else if (state instanceof LocationCurrent)
            {
                LocationCurrent locStatus = (LocationCurrent) state;
                Location loc = locStatus.getLocation();
                json.put("Altitude", loc.getAltitude());
                json.put("Longitude", loc.getLongitude());
                json.put("Latitude", loc.getLatitude());
                json.put("Bearing", loc.getBearing());
                json.put("Provider", loc.getProvider());
                json.put("Speed", loc.getSpeed());
                json.put("Time", loc.getTime());
                json.put("Accuracy", locStatus.getAccuracy());
            }

            // IDF Investors day demo
            else if (state instanceof VoiceKey)
            {
                VoiceKey vStatus = (VoiceKey) state;
                json.put("Type", vStatus.getName().toString());
                json.put("State", vStatus.getProbability());
                String topic = "";
                String type = vStatus.getName().toString();
                if(type.equals("TAKE_OVER_CONTROL") || type.equals("TAKE_OVER")){
                    topic = "takeover";
                }
                else if(type.equals("HAND_OVER_CONTROL") || type.equals("HAND_OVER")){
                    topic = "handover";
                }
                else return;

                Toast.makeText(context, "New "+state.getClass().getSimpleName()+" State: " + json.toString(), Toast.LENGTH_SHORT).show();
                mClient.publish(json.toString(), topic);
                Log.d(TAG, "New "+state.getClass().getSimpleName()+" state, JSON:" + json.toString());
            }
            else if (state instanceof EarTouchItem)
            {
                EarTouchItem earStatus = (EarTouchItem) state;
                json.put("Type", "ear");
                boolean s=true;
                if(earStatus.getType().name().equals("EAR_TOUCH")){
                    s = false;
                }
                else if(earStatus.getType().name().equals("EAR_TOUCH_BACK")){
                    s = true;
                }
                json.put("State", s);
                Toast.makeText(context, "New "+state.getClass().getSimpleName()+" State: " + json.toString(), Toast.LENGTH_SHORT).show();
                mClient.publish(json.toString(), "phone");
                Log.d(TAG, "New "+state.getClass().getSimpleName()+" state, JSON:" + json.toString());
            }
            else if (state instanceof LiftItem)
            {
                LiftItem liftStatus = (LiftItem) state;
                json.put("Type", "look");
                if(liftStatus.getVertical().equals(LiftType.NON_VERTICAL))
                {
                    json.put("State", true);
                }
                else if(liftStatus.getVertical().equals(LiftType.VERTICAL))
                {
                    json.put("State", false);
                }
                else if(liftStatus.getLook().equals(LiftType.LOOK))
                {
                    json.put("State", false);
                }
                else if(liftStatus.getLook().equals(LiftType.NONE))
                {
                    json.put("State", true);
                }
                Toast.makeText(context, "New "+state.getClass().getSimpleName()+" State: " + json.toString(), Toast.LENGTH_SHORT).show();
                mClient.publish(json.toString(), "phone");
                Log.d(TAG, "New "+state.getClass().getSimpleName()+" state, JSON:" + json.toString());
            }
            else
            {
                Log.d(TAG, "Unknown state type: " + state.getContextType() + ", class:" + state.getClass().getName());
            }
            //Toast.makeText(getApplicationContext(), "New "+state.getClass().getSimpleName()+" State: " + json.toString(), Toast.LENGTH_SHORT).show();
            //mClient.publish(json.toString(), state.getClass().getSimpleName());
            //Log.d(TAG, "New "+state.getClass().getSimpleName()+" state, JSON:" + json.toString());
        }
        catch(Exception e)
        {
            Log.e(TAG, "onReceive error: " + e.getMessage(), e);
        }
    }

    @Override
    public void onError(ContextError err)
    {
        Toast.makeText(context, "Listener Status: " + err.getMessage(), Toast.LENGTH_LONG).show();
        Log.e(TAG, "OnError: " + err.getMessage());
    }
}
