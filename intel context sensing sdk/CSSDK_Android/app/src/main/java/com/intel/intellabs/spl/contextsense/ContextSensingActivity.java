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

import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.util.Log;
import android.view.KeyEvent;
import android.view.View;
import android.view.inputmethod.EditorInfo;
import android.widget.EditText;
import android.widget.TextView;
import android.widget.Toast;

import com.intel.context.Sensing;
import com.intel.context.error.ContextError;
import com.intel.context.exception.ContextProviderException;
import com.intel.context.item.ContextType;
import com.intel.context.item.eartouch.EarTouchType;
import com.intel.context.item.itemcreator.EarTouchCreator;
import com.intel.context.option.ContinuousFlag;
import com.intel.context.option.activity.ActivityOptionBuilder;
import com.intel.context.option.activity.Mode;
import com.intel.context.option.activity.ReportType;
import com.intel.context.option.audio.AudioOptionBuilder;
import com.intel.context.option.deviceposition.DevicePositionOptionBuilder;
import com.intel.context.option.eartouch.GestureEarTouchOptionBuilder;
import com.intel.context.option.lift.LiftOptionBuilder;
import com.intel.context.provider.custom.VoiceKeyLanguage;
import com.intel.context.provider.custom.VoiceKeyOptionBuilder;
import com.intel.context.sdk.R;
import com.intel.context.sensing.ContextTypeListener;
import com.intel.context.sensing.InitCallback;

public class ContextSensingActivity extends AppCompatActivity implements MQTTStatusCallback
{
    private final String TAG = ContextSensingActivity.class.getName();
    private Sensing mSensing;
    private ContextSensingListener mListener;

    //Voice Recognition Provider
    private final String voiceKeyProviderURN = "urn:intel:context:type:custom:voicekey";

    @Override
    protected void onCreate(Bundle savedInstanceState)
    {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);
        mListener = getListenerInstance();

        /* configure self as status callback*/
        mListener.setMQTTStatusCallback(this);

        /* Ip textbox behavior and action */
        EditText editText = (EditText) findViewById(R.id.txtBrokerIP);
        editText.setText(mListener.getMQTTConfiguration());
        editText.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                if (actionId == EditorInfo.IME_ACTION_DONE)
                {
                    String[] ip = v.getText().toString().split(":");
                    mListener.configureMQTT(ip[0], Integer.parseInt(ip[1]));
                }
                return false;
            }
        });
    }

    public void btnDisableSensing_onClick(View v) throws Exception
    {
        if(mSensing!=null)
        {
            mSensing.disableSensing();
            //can also disable by context
            //mSensing.disableSensing(ContextType.AUDIO);
            if(mListener!=null) mSensing.removeContextTypeListener(mListener);
        }
        else
        {
            Toast.makeText(getApplicationContext(), "Sensing is already disabled.",
                    Toast.LENGTH_LONG).show();
        }
    }

    public void btnDaemon_onClick(View v)
    {
        mSensing = getSensingInstance();
        mSensing.start(new InitCallback()
        {
            @Override
            public void onSuccess()
            {
                Toast.makeText(getApplicationContext(), "Context Sensing Daemon Started",
                        Toast.LENGTH_SHORT).show();
            }

            @Override
            public void onError(ContextError contextError)
            {
                Toast.makeText(getApplicationContext(), "Error: " + contextError.getMessage(),
                        Toast.LENGTH_LONG).show();
            }
        });
    }

    public void btnStopDaemon_onClick(View v)
    {
        if(mSensing!=null)
        {
            mSensing.stop();
            mSensing = null;
        }
        else
		{
            Toast.makeText(getApplicationContext(), "Daemon not started.",
                    Toast.LENGTH_LONG).show();
        }
    }

    public void btnEnableSensing_onClick(View v)
    {
        if(mSensing==null)
        {
            Toast.makeText(getApplicationContext(), "Error: daemon not started.",
                    Toast.LENGTH_LONG).show();
            return;
        }
        //mListener = getListenerInstance();
        try
        {
			//TODO: test all context providers!
			
            //Activity
            ActivityOptionBuilder act_opt = new ActivityOptionBuilder();
            act_opt.setMode(Mode.NORMAL);
            act_opt.setReportType(ReportType.FREQUENCY);
            mSensing.enableSensing(ContextType.ACTIVITY_RECOGNITION, act_opt.toBundle());
            mSensing.addContextTypeListener(ContextType.ACTIVITY_RECOGNITION, mListener);

            //Audio classification
            AudioOptionBuilder aud_opt = new AudioOptionBuilder();
            aud_opt.setMode(com.intel.context.option.audio.Mode.FAST);
            mSensing.enableSensing(ContextType.AUDIO, aud_opt.toBundle());
            mSensing.addContextTypeListener(ContextType.AUDIO, mListener);

            //battery
            mSensing.enableSensing(ContextType.BATTERY, null);
            mSensing.addContextTypeListener(ContextType.BATTERY, mListener);

            //beacons (no bluetooth on emulated device!)
            //mSensing.enableSensing(ContextType.BEACONS, null);
            //mSensing.addContextTypeListener(ContextType.BEACONS, mListener);

            // calendar
            mSensing.enableSensing(ContextType.CALENDAR, null);
            mSensing.addContextTypeListener(ContextType.CALENDAR, mListener);

            // call events
            mSensing.enableSensing(ContextType.CALL, null);
            mSensing.addContextTypeListener(ContextType.CALL, mListener);

            //contacts
            //WIP

            //device information

            //device position -- not available on ASUS Zenfone2
            //DevicePositionOptionBuilder devpos_opt = new DevicePositionOptionBuilder();
            //devpos_opt.setSensorHubContinuousFlag(ContinuousFlag.NOPAUSE_ON_SLEEP);
            //mSensing.enableSensing(ContextType.DEVICE_POSITION, devpos_opt.toBundle());
            //mSensing.addContextTypeListener(ContextType.DEVICE_POSITION, mListener);

            // ear touch event detection
            //TODO: TEST
            GestureEarTouchOptionBuilder ear_opt = new GestureEarTouchOptionBuilder();
            ear_opt.setSensorHubContinuousFlag(ContinuousFlag.NOPAUSE_ON_SLEEP);
            ear_opt.setFilter(new EarTouchType[]{EarTouchType.EAR_TOUCH,EarTouchType.EAR_TOUCH_BACK,EarTouchType.NONE});
            ear_opt.setSensorHubContinuousFlag(ContinuousFlag.NOPAUSE_ON_SLEEP);
            mSensing.enableSensing(ContextType.GESTURE_EAR_TOUCH, ear_opt.toBundle());
            mSensing.addContextTypeListener(ContextType.GESTURE_EAR_TOUCH, mListener);


            // flick event detection

            //glypth gesture detection

            // installed applications

            // instant activity

            // lift and look event detection
            // TODO TEST
            LiftOptionBuilder lift_opt = new LiftOptionBuilder();
            lift_opt.setLookDetector(true);
            lift_opt.setVerticalDetector(true);
            lift_opt.setSensorHubContinuousFlag(ContinuousFlag.NOPAUSE_ON_SLEEP);
            mSensing.enableSensing(ContextType.LIFT, lift_opt.toBundle());
            mSensing.addContextTypeListener(ContextType.LIFT, mListener);

            //location (throws exception on emulator... works on Zenfone2)
            //mSensing.enableSensing(ContextType.LOCATION, null);
            //mSensing.addContextTypeListener(ContextType.LOCATION, mListener);

            // message SMS

            // music

            // network

            // pan zoomtilt gesture

            // pedometer

            // running apps

            // shaking event

            // tapping event

            // terminal context

            //user defined gesture

            // date

            // voice Recognition
            VoiceKeyOptionBuilder voi_opt = new VoiceKeyOptionBuilder();
            voi_opt.setLanguage(VoiceKeyLanguage.EN_US);
            mSensing.enableSensing(voiceKeyProviderURN, voi_opt.toBundle());
            mSensing.addContextTypeListener(voiceKeyProviderURN, mListener);
        }
        catch(ContextProviderException e)
        {
            Toast.makeText(getApplicationContext(), "Error enabling context type: "+e.getMessage(),
                    Toast.LENGTH_LONG).show();
            Log.e(TAG, "Error enabling context type: " + e.getMessage());
        }
    }

    private Sensing getSensingInstance()
    {
        return ((ContextSensingApplication)getApplicationContext()).getSensingInstance();
    }

    private ContextSensingListener getListenerInstance()
    {
        return ((ContextSensingApplication)getApplicationContext()).getListenerInstance();
    }

    @Override
    public void statusUpdate(String message) {
        TextView statusText = (TextView) findViewById(R.id.txtMQTTStatus);
        statusText.setText(message);
    }
}