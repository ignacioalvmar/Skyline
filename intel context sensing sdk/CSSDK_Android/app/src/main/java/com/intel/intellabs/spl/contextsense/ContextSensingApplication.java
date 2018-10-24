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

import android.location.Location;
import android.util.Log;
import android.widget.Toast;

import com.intel.context.Sensing;
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
import com.intel.context.sensing.SensingEvent;
import com.intel.context.sensing.SensingStatusListener;

import org.json.JSONArray;
import org.json.JSONObject;

import java.util.List;
import java.util.Map;

/**
 * Created by vhpalaci on 6/23/2016.
 */
public class ContextSensingApplication extends android.app.Application
{
    private final String TAG = ContextSensingApplication.class.getSimpleName();

    // Context sense
    private Sensing mSensing;
    private ContextSensingListener mListener;

    // MQTT
    private MqttClient mClient;

    @Override
    public void onCreate()
    {
        super.onCreate();
        mSensing = new Sensing(getApplicationContext(), new SensingStatusListener()
        {
            @Override
            public void onEvent(SensingEvent sensingEvent) {
                Log.i(TAG,"MySensingListener Event: " + sensingEvent.getDescription());
            }

            @Override
            public void onFail(ContextError contextError) {
                Log.i(TAG,"MySensingListener Context sensing error: " + contextError.getMessage());
            }
        });
        mClient = new MqttClient(getApplicationContext());
        mListener = new ContextSensingListener(getApplicationContext(), mClient);
    }

    public Sensing getSensingInstance(){
        return mSensing;
    }

    public ContextSensingListener getListenerInstance() {
        return mListener;
    }
}

