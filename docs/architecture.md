# Skyline Architecture

This document explains the runtime architecture of the Skyline HMI: how consoles and zones are laid out, how the pub/sub broker works, how widgets are registered and activated, how state events are defined, and how journey files are structured.

---

## Table of Contents

- [Console and Zone Layout](#console-and-zone-layout)
- [Pub/Sub Broker](#pubsub-broker)
- [Widget Registration and Lifecycle](#widget-registration-and-lifecycle)
- [State Events](#state-events)
- [Journey File Format](#journey-file-format)
- [Data Flow Diagram](#data-flow-diagram)

---

## Console and Zone Layout

Each console is an independent browser page connected to the same server. Every console page loads the same `app.js` boot script, but only widgets registered for that console's channel are activated.

### Zone Layout

Each console's HTML is divided into 7 zones with numeric IDs, plus a special `"full"` identifier:

```
┌─────────────────────────────────────────┐
│  Zone 1  │  Zone 2  │  Zone 3           │
├──────────┼──────────┼───────────────────┤
│  Zone 4  │  Zone 5 (spans 2+3)          │
├──────────┼──────────────────────────────┤
│  Zone 6  │  Zone 7                      │
└─────────────────────────────────────────┘
```

Widgets target a zone by specifying its number (1–7) or `"full"` as the `quadrant` field in their trigger payload. The `clearZone` function in `app.js` handles unmounting React components and clearing the DOM before a new widget renders into a zone.

```javascript
// From client/app/js/app.js
function clearZone(id) {
  if (id === "full") {
    [1, 2, 3, 4, 5, 6, 7].forEach(function(id) {
      React.unmountComponentAtNode(document.getElementById(id));
    });
    // rebuilds inner HTML with 7 zone sections
  } else {
    React.unmountComponentAtNode(document.getElementById(id));
    $("#" + id).empty();
  }
}
```

---

## Pub/Sub Broker

The broker is the communication backbone for all widgets. It is created once per console page when the Socket.IO connection is established and exposed as `window.broker`.

```javascript
// From client/app/js/app.js
function initPubsub(socket, consoleName) {
  return {
    pub: function(topic, payload, channel) { ... },
    sub: function(topic, handler, channel) { ... },
    getSocket: function() { return socket; },
    getChannel: function() { return consoleName; }
  };
}
```

### `broker.sub(topic, handler, channel)`

Subscribes to an event. The socket emits a `subscribe` message to the server, and the handler is invoked whenever the server broadcasts `"demo." + topic` on that channel.

- **topic** — event name string (e.g., `"displayImage"`, `"notify"`)
- **handler** — function called with the event data payload
- **channel** — console name (`"CC"`, `"HUD"`, `"IP"`, `"PASS"`, `"phone"`); widgets will only respond when the running console matches this channel

If `channel` is omitted, the subscription applies globally regardless of console.

### `broker.pub(topic, payload, channel)`

Publishes an event. The socket emits a `consoleEvent` to the server, which broadcasts it to all connected clients. The `channel` field is merged into the payload so the server can route it correctly.

```javascript
// Example: advance to state 3.3 and clear the HUD
broker.pub(StateEvents.TO_STATE_33, { purgeHUD: true });
```

### Direct Socket Access

Widgets can also reach the raw Socket.IO socket via `broker.getSocket()` to subscribe to MQTT-proxied topics (e.g., `car/telemetry`, `cam/realsense`) that are not routed through the standard pub/sub mechanism.

---

## Widget Registration and Lifecycle

### Registration

Every widget file ends with one or more calls to `widgets.push(...)`:

```javascript
widgets.push({ fn: MusicPlayerWidget, channel: "PASS" });
widgets.push({ fn: MusicPlayerWidget, channel: "CC" });
```

The global `widgets` array accumulates all widget definitions as their files are loaded. `app.js` iterates this array when the Socket.IO connection opens and calls each widget's initialization function for the current console:

```javascript
mySocket.on("connect", function() {
  widgets.forEach(function(widget) {
    if (widget.channel === consoleName) {
      widget.fn(broker);
    }
  });
});
```

### Lifecycle

1. **Initialization** — On connect, `widget.fn(broker)` is called. The widget registers its `broker.sub(...)` subscriptions and sets up any initial state.
2. **Activation** — When the server fires a matching event, the widget's handler runs and calls `React.render(...)` into the specified zone DOM element.
3. **Deactivation** — Another widget or the `ReinitializeWidget` calls `clearZone(quadrant)`, which unmounts the React component and empties the DOM element.
4. **Real-time Updates** — Some widgets listen to MQTT topics (e.g., `car/telemetry`, `cam/realsense`) after rendering and call `setState(...)` to update their display live.

---

## State Events

`client/app/js/controllers/StateEvents.js` defines a registry of named state-transition event strings used by widgets when publishing navigational events via `broker.pub(...)`.

```javascript
var StateEvents = {
  INIT:         "initialize",
  TO_STATE_10:  "to state 1.0",
  TO_STATE_11:  "to state 1.1",
  // ... etc.
  TO_STATE_90:  "to state 9.0",
  PHONE_BUTTON: "phone button clicked"
};
```

State events are special: when the broker detects an incoming state event, it cancels any pending `setTimeout`-based state transitions before invoking the handler. This prevents stale timeouts from interfering with manual navigation.

Widgets that need to advance the scenario publish a `StateEvent`:

```javascript
// Inside DossierWidget — fires after countdown completes
broker.pub(StateEvents.TO_STATE_81, {});

// Inside PhoneBatteryWidget — fires when the user taps close
broker.pub(StateEvents.TO_STATE_33, {});
```

---

## Journey File Format

Journey files live in `server/journeys/` and are JSON documents that describe a complete scenario as an ordered list of events.

### Top-Level Structure

```json
{
  "drivePath": "1",
  "drivePathName": "Commuter",
  "events": [ ... ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `drivePath` | string | Numeric ID of the drive path in the simulator |
| `drivePathName` | string | Human-readable scenario name |
| `events` | array | Ordered list of scenario steps |

### Event Object

```json
{
  "subscribeText": "05 Car Started",
  "subscribeEvent": "Ignition",
  "widgets": [ ... ]
}
```

| Field | Type | Description |
|-------|------|-------------|
| `subscribeText` | string | Human-readable label shown in the journey runner UI |
| `subscribeEvent` | string | The Socket.IO event name that triggers this step |
| `widgets` | array | List of widget invocations to fire when this step activates |

### Widget Invocation Object

Each object in `widgets` maps directly to a `broker.sub(...)` event payload:

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

| Field | Type | Description |
|-------|------|-------------|
| `widget_index` | string | Internal identifier used by the journey runner |
| `event_name` | string | Full event name including `"demo."` prefix |
| `event_text` | string | Human-readable label for the journey builder |
| `console` | string | Target console channel (`CC`, `HUD`, `IP`, `PASS`, `phone`) |
| `quadrant` | string | Zone number (`"1"`–`"7"`) or `"full"` |
| *(additional fields)* | varies | Widget-specific payload fields (see individual widget docs) |

### Example: Commuter Scenario Step 5

```json
{
  "subscribeText": "05 Car Started",
  "subscribeEvent": "Ignition",
  "widgets": [
    {
      "event_name": "demo.showClock",
      "console": "IP",
      "quadrant": "1"
    },
    {
      "event_name": "demo.showWeather",
      "console": "IP",
      "quadrant": "2",
      "temperature": "78",
      "message": "30% chance of rain",
      "image": "partly-cloudy"
    },
    {
      "event_name": "demo.showTripDistance",
      "console": "IP",
      "quadrant": "3",
      "distance": "3"
    },
    {
      "event_name": "demo.displayImage",
      "console": "CC",
      "quadrant": "1",
      "imageName": "/assets/images/cabin-welcome.png",
      "audioFile": "/assets/audio/Cabin_Entry_03.mp3"
    }
  ]
}
```

---

## Data Flow Diagram

```
┌─────────────────┐     MQTT      ┌─────────────────────┐
│  SKYNIVI /       │ ──────────── │   Node.js Server     │
│  Unity Simulator │              │   (server/app.js)    │
└─────────────────┘              │                     │
                                  │  - Journey runner   │
┌─────────────────┐   Socket.IO  │  - Car state        │
│  Journey Runner  │ ──────────── │  - MQTT broker      │
│  (Admin UI)      │              │  - Socket.IO server │
└─────────────────┘              └──────────┬──────────┘
                                             │ Socket.IO
                          ┌──────────────────┼──────────────────────┐
                          │                  │                       │
                   ┌──────▼──────┐  ┌────────▼──────┐  ┌───────────▼──────┐
                   │  CC Client   │  │  HUD Client   │  │  IP/PASS/Phone   │
                   │  (broker)    │  │  (broker)     │  │  Clients         │
                   └──────┬──────┘  └───────┬───────┘  └────────┬─────────┘
                          │                  │                    │
                   ┌──────▼──────────────────▼────────────────────▼──────┐
                   │           Widget Subscriptions                        │
                   │  broker.sub("displayImage", render, "CC")            │
                   │  broker.sub("notify",       render, "HUD")           │
                   │  broker.sub("showClock",    render, "IP")            │
                   └───────────────────────────────────────────────────────┘
```
