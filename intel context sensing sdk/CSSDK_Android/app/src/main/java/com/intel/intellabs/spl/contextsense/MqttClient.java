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

import android.util.Log;
import android.content.Context;
import android.content.res.Resources;

import com.intel.context.sdk.R;

import java.io.InputStream;
import java.util.Properties;

import org.eclipse.paho.android.service.MqttAndroidClient;
import org.eclipse.paho.client.mqttv3.IMqttActionListener;
import org.eclipse.paho.client.mqttv3.IMqttDeliveryToken;
import org.eclipse.paho.client.mqttv3.IMqttToken;
import org.eclipse.paho.client.mqttv3.MqttConnectOptions;
import org.eclipse.paho.client.mqttv3.MqttException;
import org.eclipse.paho.client.mqttv3.MqttMessage;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;

/**
 * Created by vhpalaci on 7/20/2016.
 */
public class MqttClient
{
    private static final String LOG_TAG = MqttClient.class.getName();

    private MqttAndroidClient mClient;
    private MQTTStatusCallback statusCallback;
    private String mqtt_server;
    private int mqtt_port;
    private String mqtt_topic;
    private String mqtt_clientId;
    private int mqtt_qos; // 0 (at most once), 1 (at least once), 2 (exactly once)
    private int mqtt_timeout;
    private int mqtt_keepalive;
    private int state = DISCONNECTED;
    private Context context;


    //connection states
    private static final int DISCONNECTED = 0;
    private static final int CONNECTING = 1;
    private static final int CONNECTED = 2;

    public MqttClient(Context c)
    {
        this.context = c;
        mqtt_server = getConfigValue(c, "mqtt_server");
        mqtt_port = Integer.parseInt(getConfigValue(c, "mqtt_port"));
        mqtt_topic = getConfigValue(c, "mqtt_topic");
        mqtt_qos = Integer.parseInt(getConfigValue(c, "mqtt_qos"));
        mqtt_timeout = Integer.parseInt(getConfigValue(c, "mqtt_timeout"));
        mqtt_keepalive = Integer.parseInt(getConfigValue(c, "mqtt_keepalive"));
        mqtt_clientId = "CSSDK_" + org.eclipse.paho.client.mqttv3.MqttClient.generateClientId();
    }

    private static String getConfigValue(Context c, String name)
    {
        Resources resources = c.getResources();
        try
        {
            InputStream rawResource = resources.openRawResource(R.raw.config);
            Properties properties = new Properties();
            properties.load(rawResource);
            return properties.getProperty(name);
        }
        catch (Exception e)
        {
            Log.e(LOG_TAG, "Unable to get configuration for "+name+ ", error:" + e.getMessage());
        }
        return null;
    }

    public void configureMQTT(String server, int port)
    {
        this.mqtt_server = server;
        this.mqtt_port = port;
        try
        {
            if(mClient!=null && mClient.isConnected())
            {
                mClient.disconnect();
            }
            connect();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public String getConfiguration(){
        return this.mqtt_server+":"+this.mqtt_port;
    }

    private synchronized void connect() throws Exception
    {
        state = CONNECTING;

        //build connection options
        MqttConnectOptions opt = new MqttConnectOptions();
        opt.setCleanSession(true);
        opt.setConnectionTimeout(mqtt_timeout);
        opt.setKeepAliveInterval(mqtt_keepalive);
        final String connString = "tcp://" + mqtt_server+":"+mqtt_port;

        mClient = new MqttAndroidClient(context, connString, mqtt_clientId, new MemoryPersistence());
        Log.e(LOG_TAG, "Attempting connection to mqtt server " + connString);
        if(statusCallback!=null) statusCallback.statusUpdate("Connecting to " +mqtt_server+":"+mqtt_port);
        mClient.connect(opt).setActionCallback(new IMqttActionListener()
        {
            @Override
            public void onSuccess(IMqttToken asyncActionToken)
            {
                Log.d(LOG_TAG, "Mqtt connected!");
                state = CONNECTED;
                if(statusCallback!=null) statusCallback.statusUpdate("Connected to " +mqtt_server+":"+mqtt_port);
            }

            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception)
            {
                Log.e(LOG_TAG, "Mqtt failure while trying to connect!");
                state = DISCONNECTED; // will try to connect next time publish() is invoked

                if(statusCallback!=null) statusCallback.statusUpdate("Failure while connecting to " +mqtt_server+":"+mqtt_port);
            }
        });
    }

    public void publish(String payload, String topic)
    {
        try {
            if(mClient==null) connect();
            this.publish(payload.getBytes("UTF-8"), topic);
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    private synchronized void publish(byte[] payload, String topic) throws Exception
    {
        // detect connection loss
        if(state!=CONNECTING && !mClient.isConnected()) state = DISCONNECTED;

        // if we are connected, then send everything stored so far
        if(state == CONNECTED)
        {
            MqttMessage message = new MqttMessage(payload);
            IMqttDeliveryToken res = mClient.publish(this.mqtt_topic+"/"+topic, message, mqtt_qos, new IMqttActionListener()
            {
                @Override
                public synchronized void onSuccess(IMqttToken asyncActionToken)
                {
                    Log.d(LOG_TAG, "Mqtt message published");
                }

                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception)
                {
                    Log.e(LOG_TAG, "Mqtt failure while trying to publish message");
                    state = DISCONNECTED; // assume failure was caused by disconnection, since the exception is empty :(
                    if(statusCallback!=null) statusCallback.statusUpdate("Failure while publishing to " +mqtt_server+":"+mqtt_port);
                }
            });
        }
        // we dont want to try to connect (again) while state is CONNECTING... let the conn timeout/callback failure decide when to try again.
        else if (state == DISCONNECTED)
        {
            this.connect();
        }
    }

    public void setMQTTStatusCallback(MQTTStatusCallback callback){
        this.statusCallback = callback;
    }
}