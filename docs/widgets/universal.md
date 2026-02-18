# Universal Widgets

These widgets are registered on **all five consoles** (`CC`, `HUD`, `IP`, `PASS`, `phone`) and can be triggered from any journey step targeting any console.

---

## Table of Contents

- [DisplayImageWidget](#displayimagewidget)
- [TimedEventWidget (setTimer)](#timedeventwidget-settimer)
- [listenMQTTWidget](#listenmqttwidget)
- [sendMQTTWidget](#sendmqttwidget)
- [ReinitializeWidget](#reinitializewidget)
- [ReinitializeAllWidget](#reinitializeallwidget)

---

## DisplayImageWidget

**Source:** `client/app/js/widgets/DisplayImageWidget.jsx`

Renders a full-zone image, optionally plays an audio file, and optionally fires a console event when the image is tapped.

This is the most commonly used widget in journeys — it covers the majority of simple "show this screen" steps.

### Trigger Event

`demo.displayImage`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into (`"1"`–`"7"` or `"full"`) |
| `imageName` | string | Yes | Path to the image asset (e.g., `"/assets/images/welcome.png"`) |
| `clickEvent` | string | No | Event name emitted to the server when the image is tapped (e.g., `"demo.to state 2.0"`). Pass `null` for non-interactive images. |
| `audioFile` | string | No | Path to an audio file to play when the widget renders (e.g., `"/assets/audio/Alert_Suggest.mp3"`). Pass `null` for no audio. |

### Pointer Events

On CC, zones 4, 5, and `"full"` have pointer events enabled automatically when this widget renders. On PASS, zones 2, 3, and `"full"` are enabled.

### Journey Example

```json
{
  "widget_index": "displayImageWidget",
  "event_name": "demo.displayImage",
  "event_text": "Display Image",
  "console": "CC",
  "quadrant": "full",
  "imageName": "/assets/images/buckle-up.png",
  "clickEvent": null,
  "audioFile": "/assets/audio/Seatbelt.mp3"
}
```

Interactive image (advances scenario on tap):

```json
{
  "widget_index": "displayImageWidget",
  "event_name": "demo.displayImage",
  "event_text": "Display Image",
  "console": "CC",
  "quadrant": "full",
  "imageName": "/assets/images/startengine.png",
  "clickEvent": "Ignition",
  "audioFile": "/assets/audio/Click.mp3"
}
```

---

## TimedEventWidget (setTimer)

**Source:** `client/app/js/widgets/timedEvent.js`

Schedules a server event to fire after a specified delay in milliseconds. This is used to automatically advance a journey step after a timeout without requiring user interaction.

### Trigger Event

`demo.setTimer`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone (not rendered visually; required by convention) |
| `eventToFire` | string | Yes | The event name to emit to the server after the timeout |
| `time` | string/number | Yes | Delay in milliseconds (must be a valid integer) |

If `eventToFire` or `time` is missing, or `time` is not a number, the widget does nothing.

### Behavior

After `time` milliseconds, the widget emits `subscriptionEventFromAdmin` on the socket with the `eventToFire` as the event name. The server treats this identically to a journey step advancing manually.

### Journey Example

Auto-advance to `"begin_driving"` after 5 seconds:

```json
{
  "widget_index": "raiseEventTimerWidget",
  "event_name": "demo.setTimer",
  "event_text": "Timed Event",
  "console": "CC",
  "quadrant": "1",
  "eventToFire": "begin_driving",
  "time": "5000"
}
```

---

## listenMQTTWidget

**Source:** `client/app/js/widgets/listenMQTT.js`

Subscribes to an MQTT topic and fires a trigger event when a message arrives on that topic. Used to bridge raw MQTT messages from the simulator into the journey event system.

### Trigger Event

`demo.listenMQTT`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `listenTopic` | string | Yes | MQTT topic to listen on (e.g., `"car/event/door_open"`) |
| `triggerTopic` | string | Yes | Event name to emit to the server when a message arrives on `listenTopic` |

### Behavior

When the widget is triggered, it subscribes to `listenTopic` on the socket. When a message arrives, it emits a subscription to `triggerTopic` and `"clean"`, effectively firing the next journey step.

### Journey Example

```json
{
  "widget_index": "listenMQTTWidget",
  "event_name": "demo.listenMQTT",
  "event_text": "Listen MQTT",
  "console": "CC",
  "quadrant": "1",
  "listenTopic": "realsense/passenger_detected",
  "triggerTopic": "passenger_authenticated"
}
```

---

## sendMQTTWidget

**Source:** `client/app/js/widgets/sendMQTT.js`

Sends an MQTT message via the server. Used to push commands to the simulator or external hardware.

### Trigger Event

`demo.doSendMQTT`

### Payload Parameters

The entire payload object is forwarded to the server's `doSendMQTT` handler. The server is responsible for interpreting the fields and publishing the MQTT message.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone (not rendered visually) |
| *(any additional fields)* | any | Depends on server handler | MQTT topic, payload, etc. |

### Journey Example

```json
{
  "widget_index": "sendMQTTWidget",
  "event_name": "demo.doSendMQTT",
  "event_text": "Send MQTT",
  "console": "CC",
  "quadrant": "1",
  "topic": "car/command/lights",
  "payload": "on"
}
```

---

## ReinitializeWidget

**Source:** `client/app/js/widgets/ReinitializeWidget.js`

Clears a specific zone on the current console, unmounting any React component and emptying the DOM element.

### Trigger Event

`demo.reinitialize`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to clear (`"1"`–`"7"` or `"full"`). When `"full"`, all 7 zones are cleared and their containers are rebuilt. |

### Journey Example

Clear zone 4 on the HUD:

```json
{
  "widget_index": "refreshHmis",
  "event_name": "demo.reinitialize",
  "event_text": "Refresh HMIs",
  "console": "HUD",
  "quadrant": "4"
}
```

Clear all zones on the CC:

```json
{
  "widget_index": "refreshHmis",
  "event_name": "demo.reinitialize",
  "event_text": "Refresh HMIs",
  "console": "CC",
  "quadrant": "full"
}
```

---

## ReinitializeAllWidget

**Source:** `client/app/js/widgets/ReinitializeWidget.js`

Clears **all zones on all consoles** simultaneously by broadcasting `reinitialize` events to CC, HUD, IP, PASS, and phone.

### Trigger Event

`demo.reinitialize_all`

### Payload Parameters

No additional parameters are used.

### Journey Example

Used at the end of a scenario to reset all displays:

```json
{
  "widget_index": "refreshHmis",
  "event_name": "demo.reinitialize_all",
  "event_text": "Refresh HMIs",
  "console": "CC",
  "quadrant": "full"
}
```
