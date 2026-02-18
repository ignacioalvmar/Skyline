# Widget Developer Guide

This guide explains the complete process of creating, registering, and triggering a new Skyline widget — from writing the source file to invoking it from a journey.

---

## Table of Contents

- [Widget Anatomy](#widget-anatomy)
- [Step 1: Create the Widget File](#step-1-create-the-widget-file)
- [Step 2: Define the React View (optional)](#step-2-define-the-react-view-optional)
- [Step 3: Write the Widget Function](#step-3-write-the-widget-function)
- [Step 4: Register the Widget](#step-4-register-the-widget)
- [Step 5: Add the File to the Build](#step-5-add-the-file-to-the-build)
- [Step 6: Trigger the Widget from a Journey](#step-6-trigger-the-widget-from-a-journey)
- [Patterns and Best Practices](#patterns-and-best-practices)
  - [Emitting Console Events on User Interaction](#emitting-console-events-on-user-interaction)
  - [Subscribing to Live MQTT/Socket Data](#subscribing-to-live-mqttsocket-data)
  - [Using Shared Components](#using-shared-components)
  - [Audio Playback](#audio-playback)
  - [Clearing a Zone](#clearing-a-zone)
  - [Publishing State Events](#publishing-state-events)

---

## Widget Anatomy

Every widget is a **JavaScript function** that:

1. Accepts a single `broker` argument.
2. Calls `broker.sub(eventName, handler, channel)` to subscribe to one or more trigger events.
3. In the handler, calls `React.render(...)` to mount a React component into a zone DOM element.
4. Optionally publishes events via `broker.pub(...)` or `socket.emit(...)` in response to user interactions or data changes.

```
widget file
├── React component class (optional, for UI)
└── Widget function
    ├── broker.sub("event_name", handler, "CHANNEL")
    └── handler(data)
        └── React.render(<Component ...props />, document.getElementById(data.quadrant))
```

---

## Step 1: Create the Widget File

Create a new `.jsx` file (or `.js` if no JSX) in the appropriate console subfolder:

```
client/app/js/widgets/
├── CC/          ← Center Console widgets
├── HUD/         ← Heads-Up Display widgets
├── IP/          ← Information Panel widgets
├── PASS/        ← Passenger Console widgets
└── Phone/       ← Phone widgets
```

For a widget that works on multiple consoles, place it in `widgets/` directly.

**Example:** `client/app/js/widgets/CC/MyAlertWidget.jsx`

---

## Step 2: Define the React View (optional)

If your widget has visible UI, define a React component class at the top of the file. The `/** @jsx React.DOM */` pragma must appear on line 1 for JSX files.

```javascript
/** @jsx React.DOM */
var MyAlert = React.createClass({
  render: function() {
    return (
      <div className="widget-box modal">
        <h1>{this.props.title}</h1>
        <p>{this.props.message}</p>
        <button onClick={this.props.onDismiss}>OK</button>
      </div>
    );
  }
});
```

For pure side-effect widgets (audio playback, timers, MQTT senders), no React component is needed.

---

## Step 3: Write the Widget Function

The widget function receives the `broker` and wires up subscriptions.

```javascript
function MyAlertWidget(broker) {

  function render(data) {
    // data contains all fields from the journey event payload
    var onDismiss = function() {
      // Emit a socket event back to the server to advance the scenario
      broker.getSocket().emit("consoleEvent", { eventName: data.dismissEvent });
    };

    React.render(
      <MyAlert title={data.title} message={data.message} onDismiss={onDismiss} />,
      document.getElementById(data.quadrant)
    );
  }

  // Subscribe to the trigger event on this console only
  broker.sub("show_my_alert", render, broker.getChannel());
}
```

### The `data` Object

The `data` object passed to your handler contains everything from the journey event payload **minus** the `event_name`, `widget_index`, `event_text`, and `console` fields (which are consumed by the server). All other fields you define in the journey JSON arrive here verbatim.

Common fields:

| Field | Type | Description |
|-------|------|-------------|
| `quadrant` | string | Zone to render into (`"1"`–`"7"` or `"full"`) |
| *(custom fields)* | any | Any additional fields you add to the journey event |

---

## Step 4: Register the Widget

At the bottom of the file, push the widget into the global `widgets` array for each console it should be active on:

```javascript
// Active only on CC
widgets.push({ fn: MyAlertWidget, channel: "CC" });

// Active on multiple consoles
widgets.push({ fn: MyAlertWidget, channel: "CC" });
widgets.push({ fn: MyAlertWidget, channel: "PASS" });
```

---

## Step 5: Add the File to the Build

Lineman picks up all JavaScript and JSX files automatically from the `client/app/js/` directory tree via the glob patterns in `client/config/`. No explicit include is required — just place the file in the right folder and Lineman will compile and concatenate it.

After adding the file, restart `lineman run` to pick up the new file.

---

## Step 6: Trigger the Widget from a Journey

Add a widget invocation object to the appropriate step in a journey JSON file (`server/journeys/*.json`):

```json
{
  "subscribeText": "10 Alert Driver",
  "subscribeEvent": "driver_alert",
  "widgets": [
    {
      "widget_index": "myAlertWidget",
      "event_name": "demo.show_my_alert",
      "event_text": "My Alert",
      "console": "CC",
      "quadrant": "3",
      "title": "Attention Required",
      "message": "Please place your hands on the wheel.",
      "dismissEvent": "demo.alert_dismissed"
    }
  ]
}
```

The `event_name` must match `"demo." + eventName` where `eventName` is the first argument you passed to `broker.sub(...)`.

---

## Patterns and Best Practices

### Emitting Console Events on User Interaction

When a user taps a button and the scenario should advance, emit a `consoleEvent` back to the server:

```javascript
window.broker.getSocket().emit("consoleEvent", {
  eventName: this.props.clickEvent   // e.g. "demo.to state 2.0"
});
```

The `window.broker` reference is needed inside React component methods because `broker` is captured in the widget function closure, not passed to components directly. Alternatively, pass the emit logic as a prop callback.

### Subscribing to Live MQTT/Socket Data

To receive real-time telemetry or camera data, subscribe directly via the socket after rendering:

```javascript
function render(data) {
  var socket = broker.getSocket();
  var view = React.render(<MyView />, document.getElementById(data.quadrant));

  socket.emit("subscribe", { name: "car/telemetry" });
  socket.on("car/telemetry", function(message) {
    if (view.isMounted()) {
      view.setState({ speed: message.speedMPH });
    }
  });
}
```

Always check `view.isMounted()` before calling `setState` to avoid errors after the zone is cleared.

### Using Shared Components

Three shared React components are available globally (loaded by Lineman before widget files):

| Component | Props | Description |
|-----------|-------|-------------|
| `CountdownTimer` | `initialTimeRemaining` (ms), `completeCallback`, `prefixText`, `interval`, `formatFunc`, `tickCallback` | Displays a live countdown in `h:mm:ss` format |
| `TimerBar` | `timeoutValue` (ms), `onComplete`, `onTick`, `interval` | Renders a CSS progress bar that fills over the timeout duration |
| `ProgressBar` | `completed` (0–100 number), `color` | Static progress bar; update `completed` via `setState` |

```javascript
// Example: countdown that fires a callback at zero
<CountdownTimer
  initialTimeRemaining={30000}
  completeCallback={function() { broker.pub("timer_done", {}, "CC"); }}
  prefixText="Departing in"
/>
```

### Audio Playback

Widgets play audio by creating an HTML5 `Audio` object on `$('body')[0].mp3`. This is a shared singleton — setting a new audio source stops any currently playing audio.

```javascript
var el = $('body')[0];
if (el.mp3) {
  el.mp3.pause();
}
el.mp3 = new Audio("assets/audio/my-sound.mp3");
el.mp3.volume = 0.5;
el.mp3.loop = false;
el.mp3.play();
```

The `DisplayImageWidget` and `ConversationWidget` also use this singleton for their audio. The `fade_audio_out` / `fade_audio_in` events (subscribed by `SpotifyWidget`, `MusicPlayerWidget`, and `ConversationWidget`) will affect whatever audio is currently playing via this singleton.

### Clearing a Zone

To clear a zone programmatically from within a widget:

```javascript
clearZone("3");    // clears zone 3
clearZone("full"); // clears all 7 zones and rebuilds their containers
```

From a journey, use the `reinitialize` event (see [universal widgets](widgets/universal.md)).

### Publishing State Events

Use the constants in `StateEvents` rather than raw strings to navigate the scenario state machine:

```javascript
// Good
broker.pub(StateEvents.TO_STATE_33, { purgeHUD: true });

// Avoid
broker.pub("to state 3.3", { purgeHUD: true });
```

The full list of state constants is in `client/app/js/controllers/StateEvents.js`.
