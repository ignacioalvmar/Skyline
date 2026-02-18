# Center Console (CC) Widgets

The Center Console (`CC`) is the primary driver-facing touchscreen, oriented in portrait mode. It supports interactive UI elements and is the main surface for notifications, media, navigation, and passenger interactions.

All widgets on this page are registered on channel `"CC"`.

---

## Table of Contents

- [UserAuthenticationWidget](#userauthenticationwidget)
- [ShowLoadingCircleWidget](#showloadingcirclewidget)
- [ShowInitialMapWidget](#showinitialmapwidget)
- [AppMonWidget](#appmonwidget)
- [ContextSensingWidget](#contextsensingwidget)
- [ConversationWidget](#conversationwidget)
- [CallConversationWidget](#callconversationwidget)
- [DossierWidget](#dossierwidget)
- [EmailReportWidget](#emailreportwidget)
- [FloorPlanWidget](#floorplanwidget)
- [ImportantItemsWidget](#importantitemswidget)
- [MusicPlayerWidget](#musicplayerwidget)
- [NavbarWidget](#navbarwidget)
- [NotificationWidget](#notificationwidget)
- [PassengerMapWidget](#passengermapwidget)
- [PhoneBatteryWidget](#phonebatterywidget)
- [RealSenseDepthWidget](#realseensedepthwidget)
- [RealSenseRGBWidget](#realsensergbwidget)
- [RouteWidget](#routewidget)
- [RSAuthenticatedUserWidget](#rsauthenticateduserwidget)
- [ShowDinnerWidgets](#showdinnerwidgets)
- [ShowTakeOverWidget](#showtakeoverwidget)
- [SpeechWidget](#speechwidget)
- [SpotifyWidget](#spotifywidget)
- [StartCarWidget](#startcarwidget)
- [TermsAndConditionsWidget](#termsandconditionswidget)
- [TripReportWidget](#tripreportwidget)

---

## UserAuthenticationWidget

**Source:** `client/app/js/widgets/CC/AuthenticatedUser.jsx`

Displays authenticated user cards (driver and/or passenger) with avatar, temperature preference, a phone-connected indicator, and an animated seat icon that stops animating after a configurable duration.

### Trigger Event

`show_authenticated_user`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `users` | JSON string or array | Yes | Array of user objects |
| `animation_duration` | number | Yes | Milliseconds before the seat animation stops |

Each user object in `users`:

| Field | Type | Description |
|-------|------|-------------|
| `role` | string | `"driver"` or `"passenger"` |
| `temp` | number | Preferred temperature in degrees |
| `seat` | boolean | Whether to show the seat icon |
| `temperature_countdown` | number | Milliseconds for the `CountdownTimer` displayed beside the temperature |

### Secondary Event

`stop_animating_seat` — halts the seat animation. Fired automatically after `animation_duration` ms.

### Journey Example

```json
{
  "event_name": "demo.show_authenticated_user",
  "console": "CC",
  "quadrant": "1",
  "users": "[{\"role\":\"driver\",\"temp\":70,\"seat\":true,\"temperature_countdown\":60000},{\"role\":\"passenger\",\"temp\":68,\"seat\":true,\"temperature_countdown\":60000}]",
  "animation_duration": 3000
}
```

---

## ShowLoadingCircleWidget

**Source:** `client/app/js/widgets/CC/AuthenticatedUser.jsx`

Displays three pulsing loading circles — a generic "please wait" animation.

Also registered on `PASS`.

### Trigger Event

`show_loading_circle`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "widget_index": "loadingWidget",
  "event_name": "demo.show_loading_circle",
  "console": "CC",
  "quadrant": "1"
}
```

---

## ShowInitialMapWidget

**Source:** `client/app/js/widgets/CC/AuthenticatedUser.jsx`

Displays a static SVG map showing the car's initial position.

### Trigger Event

`show_initial_map`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_initial_map",
  "console": "CC",
  "quadrant": "1"
}
```

---

## AppMonWidget

**Source:** `client/app/js/widgets/CC/AppMonWidget.js`

Displays real-time phone monitoring data (battery charge status, Wi-Fi SSID, RSSI, link speed) streamed from an Android device via the Intel Context Sensing App Monitor API over MQTT.

### Trigger Event

`show_appmon_widget`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `text` | string | No | Initial text to display before live data arrives |

### MQTT Topics Subscribed

- `contextsense/appmon/BATTERY_CHARGE` — updates battery charging status text
- `contextsense/appmon/WIFIRADIO` — updates Wi-Fi connection details

### Journey Example

```json
{
  "event_name": "demo.show_appmon_widget",
  "console": "CC",
  "quadrant": "1",
  "text": "Waiting for data..."
}
```

---

## ContextSensingWidget

**Source:** `client/app/js/widgets/CC/ContextSensingWidget.js`

Displays real-time phone context data (call info, audio classification, body position, activity recognition) streamed from an Android device via the Intel Context Sensing SDK over MQTT.

### Trigger Event

`show_contextsense_widget`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `text` | string | No | Initial text to display before live data arrives |

### MQTT Topics Subscribed

- `contextsense/sdk/Call` — caller information and notification type
- `contextsense/sdk/Audio` — audio type and probability
- `contextsense/sdk/Position` — body position
- `contextsense/sdk/Battery` — battery info (subscribed but not yet displayed)
- `contextsense/sdk/Activity` — detected activity and confidence

### Journey Example

```json
{
  "event_name": "demo.show_contextsense_widget",
  "console": "CC",
  "quadrant": "1",
  "text": "Waiting for sensor data..."
}
```

---

## ConversationWidget

**Source:** `client/app/js/widgets/CC/ConversationWidget.jsx`

Plays an in-car conversation audio file. Does not render any visible UI — audio only.

### Trigger Event

`play_in_car_conversation`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | string | Yes | Path to the audio file to play |

### Secondary Events

| Event | Description |
|-------|-------------|
| `fade_conversation_out` | Fades audio volume to 0 over ~500 ms |
| `fade_conversation_in` | Fades audio volume back to 0.5 over ~500 ms |

### Journey Example

```json
{
  "event_name": "demo.play_in_car_conversation",
  "console": "CC",
  "quadrant": "1",
  "file": "/assets/audio/conversation1.mp3"
}
```

---

## CallConversationWidget

**Source:** `client/app/js/widgets/CC/ConversationWidget.jsx`

Plays a hardcoded incoming-call conversation audio file (`/assets/audio/conversation2.mp3`). No UI rendered.

### Trigger Event

`play_incoming_call_conversation`

### Payload Parameters

No additional parameters beyond the standard invocation fields.

### Secondary Events

Same `fade_conversation_out` / `fade_conversation_in` as ConversationWidget.

---

## DossierWidget

**Source:** `client/app/js/widgets/CC/Dossier.jsx`

Displays a destination dossier card showing restaurant details, related email messages, and a countdown timer. When the timer reaches 1 minute remaining, it automatically fires state transition `TO_STATE_81`.

Also renders a "Push to Smartphone" modal variant.

### Trigger Events

| Event | Description |
|-------|-------------|
| `show_dossier` | Renders the dossier card with countdown |
| `show_phone_prompt` | Renders the push-to-phone modal |

### Payload Parameters — `show_dossier`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `timeoutValue` | number | Yes | Countdown duration in milliseconds |

### Payload Parameters — `show_phone_prompt`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `timeoutValue` | number | Yes | Countdown before auto-advance (ms) |

### Emitted State Events

- On countdown reaching 1 minute: `StateEvents.TO_STATE_81`
- On phone prompt tap: `StateEvents.TO_STATE_90`

### Journey Example

```json
{
  "event_name": "demo.show_dossier",
  "console": "CC",
  "quadrant": "2",
  "timeoutValue": 120000
}
```

---

## EmailReportWidget

**Source:** `client/app/js/widgets/CC/EmailWidget.js`

Renders an HTML email overlay that appears automatically when the car speed drops below a threshold. Supports meeting invite buttons (YES / MAYBE / NO) that emit console events. Hides itself (with a "saving..." animation) when speed exceeds `hideAtMph`.

**Note:** This widget uses direct socket subscriptions (`displayEmail`, `removeEmail`) rather than the standard broker pub/sub pattern.

### Trigger Event

`displayEmail` (direct socket event, not `demo.` prefixed)

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `from` | string | Yes | Sender name displayed in the email header |
| `sentDate` | string | No | Display date string |
| `subject` | string | Yes | Email subject line |
| `body` | string | Yes | HTML body content |
| `isMeeting` | boolean | No | If `true`, renders YES / MAYBE / NO meeting response buttons |
| `attachmentIcon` | string | No | URL of an attachment icon image |
| `audioFile` | string | No | ID of an `<audio>` element to play on display |
| `backgroundImage` | string | No | Background image name (without extension) set on the parent zone |
| `displayNow` | string | No | If `"true"`, displays immediately regardless of speed |
| `hideAtMph` | string | Yes | Speed (MPH) above which the email is hidden |

### Emitted Events (meeting buttons)

- `email_meetingAccepted`
- `email_meetingMaybe`
- `email_meetingNotAccepted`

### Journey Example

```json
{
  "widget_index": "emailWidget",
  "event_name": "displayEmail",
  "console": "CC",
  "quadrant": "1",
  "from": "Marissa Michaels",
  "subject": "Meeting Room Relocation",
  "body": "Hi Sarah, we have a client coming in from Munich...",
  "isMeeting": null,
  "backgroundImage": null,
  "audioFile": null,
  "displayNow": null,
  "hideAtMph": "5"
}
```

---

## FloorPlanWidget

**Source:** `client/app/js/widgets/CC/FloorPlanWidget.jsx`

Displays a modal circle overlay containing a building floor plan SVG.

### Trigger Event

`show_floorplan`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_floorplan",
  "console": "CC",
  "quadrant": "3"
}
```

---

## ImportantItemsWidget

**Source:** `client/app/js/widgets/CC/ImportantItemsWidget.jsx`

Displays a modal circle overlay with a single icon and copy text — used for "don't forget your ..." reminder notifications.

### Trigger Event

`show_important_items`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `iconName` | string | Yes | SVG filename (without extension) from `assets/images/` |
| `itemClass` | string | No | CSS class applied to the icon image |
| `copyText` | string | Yes | Reminder text displayed below the icon |

### Journey Example

```json
{
  "event_name": "demo.show_important_items",
  "console": "CC",
  "quadrant": "3",
  "iconName": "Icon-Umbrella",
  "itemClass": "icon-item",
  "copyText": "Don't forget your umbrella!"
}
```

---

## MusicPlayerWidget

**Source:** `client/app/js/widgets/CC/MusicPlayerWidget.jsx`

Also registered on: `PASS`

A full-featured music player that loads MP3 files from the server, displays cover art, artist, and song name, renders a live progress bar, and provides back / play-pause / next / mute controls.

### Trigger Events

| Event | Description |
|-------|-------------|
| `show_music_player` | Renders the player UI and starts playback |
| `fade_audio_out` | Fades audio to 0 and pauses |
| `fade_audio_in` | Restores audio to max volume (0.5) and resumes |

### Payload Parameters — `show_music_player`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `imageDriver` | string | Yes | URL of the driver avatar image |
| `imagePassenger` | string | Yes | URL of the passenger avatar image |
| `imageEvent` | string | Yes | URL of a large event/album image shown on the left third |
| `imageEventClick` | string | No | Console event name fired when the event image is tapped |

### Behavior

On initialization, the widget requests the MP3 file list from the server (`getAudioFiles` socket event) and stores the result. A random song is selected on first render. Playback advances automatically when a track ends.

### Journey Example

```json
{
  "event_name": "demo.show_music_player",
  "console": "CC",
  "quadrant": "full",
  "imageDriver": "/assets/images/avatar-driver.jpg",
  "imagePassenger": "/assets/images/avatar-passenger.jpg",
  "imageEvent": "/assets/images/music-event.jpg",
  "imageEventClick": null
}
```

---

## NavbarWidget

**Source:** `client/app/js/widgets/CC/NavbarWidget.jsx`

Renders a navigation bar with icon buttons. Can animate in/out using a slide transition.

### Trigger Event

`show_navbar`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `slideOption` | string | No | `"show"` (slide down), `"hide"` (slide up), or omit for immediate display |
| `navbarItems` | JSON string or array | No | Array of nav item objects. Defaults to home / seat / phone / settings icons. |

Each navbar item:

| Field | Description |
|-------|-------------|
| `icon` | Icon image URL |
| `itemClass` | CSS class for the icon |

### Journey Example

```json
{
  "event_name": "demo.show_navbar",
  "console": "CC",
  "quadrant": "7",
  "slideOption": "show",
  "navbarItems": null
}
```

---

## NotificationWidget

**Source:** `client/app/js/widgets/CC/NotificationWidget.jsx`

Displays a timed modal notification with a single icon and an auto-closing `TimerBar`. When the timer completes, fires an optional next state transition.

### Trigger Event

`notify`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `icon` | string | Yes | SVG filename (without extension) from `assets/images/` |
| `classes` | string | No | CSS classes applied to the icon |
| `timeoutValue` | number | Yes | Duration of the timer bar in milliseconds |
| `nextState` | string | No | Event name to publish via `broker.pub` when the timer completes |
| `clearHUDOnTransition` | boolean | No | If `true`, passes `purgeHUD: true` to the next state event |

### Journey Example

```json
{
  "event_name": "demo.notify",
  "console": "CC",
  "quadrant": "3",
  "icon": "Icon-Timer",
  "classes": "icon-timer",
  "timeoutValue": 8000,
  "nextState": "demo.to state 3.3"
}
```

---

## PassengerMapWidget

**Source:** `client/app/js/widgets/CC/PassengerMapWidget.jsx`

Displays a static map with a passenger avatar marker at the car's position — used during passenger pickup scenarios.

### Trigger Event

`show_passenger_map`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_passenger_map",
  "console": "CC",
  "quadrant": "1"
}
```

---

## PhoneBatteryWidget

**Source:** `client/app/js/widgets/CC/PhoneBatteryWidget.jsx`

Displays a low battery modal with a charge pad diagram. Tapping the modal fires `StateEvents.TO_STATE_33` (return to default driving state).

### Trigger Event

`show_phone_battery`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Emitted State Events

- On close tap: `StateEvents.TO_STATE_33`

### Journey Example

```json
{
  "event_name": "demo.show_phone_battery",
  "console": "CC",
  "quadrant": "3"
}
```

---

## RealSenseDepthWidget

**Source:** `client/app/js/widgets/CC/RealSenseDepthWidget.js`

Displays a live depth camera feed from an Intel RealSense camera, rendered onto a KineticJS canvas (700×500 px). Receives base64-encoded depth frames via the `cam/realsense` MQTT topic.

### Trigger Event

`show_depth_widget`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `text` | string | No | Initial text overlay before data arrives |

### MQTT Topics Subscribed

- `cam/realsense` — expects `{ text, depth }` where `depth` is a base64-encoded image data URL

### Journey Example

```json
{
  "widget_index": "realSense_Depth_Widget",
  "event_name": "demo.show_depth_widget",
  "console": "CC",
  "quadrant": "1",
  "text": "Waiting for data"
}
```

---

## RealSenseRGBWidget

**Source:** `client/app/js/widgets/CC/RealSenseRGBWidget.js`

Displays a live RGB camera feed from an Intel RealSense camera on a KineticJS canvas (340×200 px).

### Trigger Event

`show_rgb_widget`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `text` | string | No | Initial text overlay before data arrives |

### MQTT Topics Subscribed

- `cam/realsense` — expects `{ text, rgb }` where `rgb` is a base64-encoded image data URL

### Journey Example

```json
{
  "widget_index": "realSenseRGBWidget",
  "event_name": "demo.show_rgb_widget",
  "console": "CC",
  "quadrant": "2",
  "text": "Waiting for data"
}
```

---

## RouteWidget

**Source:** `client/app/js/widgets/CC/RouteWidget.jsx`

Displays either a single route summary card or a rerouting selection panel (Favorite Route vs. Scenic Route).

### Trigger Events

| Event | Description |
|-------|-------------|
| `show_route` | Displays a single route summary with ETA and eco level |
| `show_reroute` | Displays a two-option rerouting panel |

### Payload Parameters — `show_route`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `icon` | string | Yes | SVG icon filename (without extension) for the route type |
| `route_name` | string | Yes | Route display name (e.g., `"Favorite Route"`) |
| `expected_time` | string | Yes | ETA in minutes |
| `eco_level` | string | Yes | Eco score label |

### Payload Parameters — `show_reroute`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Emitted Events (reroute selection)

When a reroute option is selected:
- `broker.pub("zoom_in", {}, "CC")`
- `broker.pub("show_alt_route", { route: "economic" }, "CC")`
- `broker.pub(StateEvents.TO_STATE_33, { purgeHUD: true })`

### Journey Example

```json
{
  "event_name": "demo.show_route",
  "console": "CC",
  "quadrant": "2",
  "icon": "Icon-Circle-Heart",
  "route_name": "Favorite Route",
  "expected_time": "12",
  "eco_level": "High"
}
```

---

## RSAuthenticatedUserWidget

**Source:** `client/app/js/widgets/CC/RSAuthenticatedUserWidget.jsx`

Displays driver and passenger identity cards with live updates from RealSense face recognition events. Updates avatar image and temperature preference in real time.

### Trigger Event

`show_rs_authenticated_user`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `imageDriver` | string | Yes | Initial driver avatar image URL |
| `temperatureDriver` | number | Yes | Initial driver temperature preference |
| `imagePassenger` | string | Yes | Initial passenger avatar image URL |
| `temperaturePassenger` | number | Yes | Initial passenger temperature preference |
| `eventDriver` | string | Yes | Socket topic for live driver recognition updates |
| `eventPassenger` | string | Yes | Socket topic for live passenger recognition updates |

### Live Update Message Format

Each update event is expected to provide:

```json
{
  "image": "C:\\Users\\Skyline\\...\\generated\\avatar.jpg",
  "name": "John",
  "preferences": { "temperature": 72 }
}
```

### Journey Example

```json
{
  "event_name": "demo.show_rs_authenticated_user",
  "console": "CC",
  "quadrant": "1",
  "imageDriver": "/assets/images/avatar-driver.jpg",
  "temperatureDriver": 70,
  "imagePassenger": "/assets/images/avatar-passenger.jpg",
  "temperaturePassenger": 68,
  "eventDriver": "realsense/driver/recognized",
  "eventPassenger": "realsense/passenger/recognized"
}
```

---

## ShowDinnerWidgets

**Source:** `client/app/js/widgets/CC/ShowDinnerWidget.jsx`

Three step-by-step widgets for the dinner reservation flow, each displaying a different stage of the OpenTable booking process.

| Widget | Trigger Event | Description |
|--------|--------------|-------------|
| `ShowDinnerStepOneWidget` | `show_dinner_step_one` | Shows restaurant name, rating, party size, and time |
| `ShowDinnerStepTwoWidget` | `show_dinner_step_two` | Shows "Booking Party of 2" with OpenTable logo |
| `ShowDinnerStepThreeWidget` | `show_dinner_step_three` | Shows "RESERVATION CONFIRMED" with calendar confirmation |

All three widgets accept only a `quadrant` parameter and have no configurable props.

### Journey Example

```json
{
  "event_name": "demo.show_dinner_step_one",
  "console": "CC",
  "quadrant": "3"
}
```

---

## ShowTakeOverWidget

**Source:** `client/app/js/widgets/CC/ShowSecureTakeOver.jsx`

Also registered on: `PASS`

Displays the Autonomous Vehicle Take-Over Control Panel. Shows driver monitoring status for four conditions (eyes on road, awake, no phone, hands on wheel) with live updates from RealSense driver monitoring events. When all four conditions are met, emits `autopilot_end` to the server.

### Trigger Event

`show_takeover_step_one`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `image` | string | Yes | Initial driver avatar image URL |
| `eyes` | string | Yes | Initial eyes icon class (`"takeovericon"` or `"takeovericon_disabled"`) |
| `head` | string | Yes | Initial head/alert icon class |
| `phone` | string | Yes | Initial phone icon class |
| `hands` | string | Yes | Initial hands icon class |
| `close` | string | Yes | URL of the close button image |
| `closeEventClick` | string | No | Console event name emitted when the close button is tapped |
| `imageEvent` | string | Yes | Socket topic for live driver image updates |
| `eyesEvent` | string | Yes | Socket topic for eyes-on-road state updates |
| `headEvent` | string | Yes | Socket topic for alertness state updates |
| `phoneEvent` | string | Yes | Socket topic for no-phone state updates |
| `handsEvent` | string | Yes | Socket topic for hands-on-wheel state updates |

### Emitted Events

- `autopilot_end` — emitted to server when all four monitoring conditions become `true`

### Journey Example

```json
{
  "event_name": "demo.show_takeover_step_one",
  "console": "CC",
  "quadrant": "full",
  "image": "/assets/images/avatar-driver.jpg",
  "eyes": "takeovericon_disabled",
  "head": "takeovericon_disabled",
  "phone": "takeovericon_disabled",
  "hands": "takeovericon_disabled",
  "close": "/assets/images/Icon-Close-Window.svg",
  "closeEventClick": "demo.cancel_takeover",
  "imageEvent": "realsense/driver/frame",
  "eyesEvent": "realsense/driver/eyes",
  "headEvent": "realsense/driver/head",
  "phoneEvent": "realsense/driver/phone",
  "handsEvent": "realsense/driver/hands"
}
```

---

## SpeechWidget

**Source:** `client/app/js/widgets/CC/SpeechWidget.js`

Performs text-to-speech synthesis using the Web Speech API. Fades the background audio out before speaking and fades it back in when done. Optionally fires a state transition after speech completes.

### Trigger Event

`speech`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `text` | string | Yes | The text to speak |
| `voice` | number | No | Index into the browser's `speechSynthesis.getVoices()` array. Defaults to the "Whisper" voice at index 10 if available. |
| `keepMuted` | boolean | No | If `true`, does not fade audio back in after speaking |
| `nextState` | string | No | Event name to publish via `broker.pub` after speech ends |
| `nextStateDelay` | number | No | Milliseconds to wait after speech before firing `nextState` |

### Behavior

1. Publishes `fade_audio_out` on CC.
2. Waits 500 ms (to let audio fade).
3. Speaks the text.
4. On speech end: publishes `fade_audio_in` (unless `keepMuted`), then fires `nextState` after `nextStateDelay`.

### Journey Example

```json
{
  "event_name": "demo.speech",
  "console": "CC",
  "quadrant": "1",
  "text": "Autopilot is now available. Would you like to engage?",
  "nextState": "demo.autopilot_prompt_shown",
  "nextStateDelay": 1000
}
```

---

## SpotifyWidget

**Source:** `client/app/js/widgets/CC/SpotifyWidget.jsx`

A multi-view music widget with three modes: a pre-play "Selected for You" countdown card, a now-playing view with progress bar, and a media settings modal. Manages background audio fade in/out.

### Trigger Events

| Event | Description |
|-------|-------------|
| `show_spotify` | Renders the "Selected for You" preview card with a countdown |
| `play_spotify` | Renders the now-playing view and starts `/assets/audio/music.mp3` |
| `show_media_settings` | Renders the media source settings modal |
| `fade_audio_out` | Fades the Spotify audio out |
| `fade_audio_in` | Fades the Spotify audio back in |

### Payload Parameters — `show_spotify`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `timeoutValue` | number | Yes | Countdown in ms before auto-transitioning to `TO_STATE_32` |

### Payload Parameters — `show_media_settings`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `timeoutValue` | number | Yes | Auto-close timeout in ms |

### Journey Example

```json
{
  "event_name": "demo.show_spotify",
  "console": "CC",
  "quadrant": "2",
  "timeoutValue": 8000
}
```

---

## StartCarWidget

**Source:** `client/app/js/widgets/CC/StartCarWidget.jsx`

Displays a power button. When tapped, emits `ignition_start` and a configurable `startEvent` to the server, then animates the button disappearing.

### Trigger Event

`show_start_car`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `startEvent` | string | Yes | Console event name emitted alongside `ignition_start` when the button is tapped |

### Journey Example

```json
{
  "event_name": "demo.show_start_car",
  "console": "CC",
  "quadrant": "3",
  "startEvent": "car_started"
}
```

---

## TermsAndConditionsWidget

**Source:** `client/app/js/widgets/CC/TermsAndConditionsWidget.jsx`

Displays a Terms & Conditions acceptance screen for car-sharing scenarios. The user can accept (fires `termsAcceptedEvent`) or call the owner (fires `callOwnerEvent`).

### Trigger Event

`termsandconditions`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `welcomeText` | string | No | Car owner identification text. Defaults to `"Jenna Kreuger's car."` |
| `bodyText` | string | No | Terms body text. Has a built-in default. |
| `termsAcceptedEvent` | string | Yes | Console event name fired when the user taps OK |
| `callOwnerEvent` | string | Yes | Console event name fired when the user taps "Call Owner" |

### Journey Example

```json
{
  "event_name": "demo.termsandconditions",
  "console": "CC",
  "quadrant": "full",
  "welcomeText": "Sarah's CarShare.",
  "bodyText": "This vehicle is shared. Your location will be available to the owner.",
  "termsAcceptedEvent": "terms_accepted",
  "callOwnerEvent": "call_owner"
}
```

---

## TripReportWidget

**Source:** `client/app/js/widgets/IP/TripReportWidget.js`

Also registered on: `CC`

Renders a post-trip report with two Highcharts column charts (trip time, average speed) and a fuel efficiency range slider. Data is parsed from a raw log string format.

**Note:** This widget uses direct socket subscriptions (`showTripSummaryReport`, `showTripDetailReport`) rather than the broker pattern.

### Trigger Events

| Event | Description |
|-------|-------------|
| `showTripSummaryReport` | Renders a compact summary (total distance, duration, average speed) |
| `showTripDetailReport` | Renders the full report with charts and fuel efficiency |

### Payload Parameters — `showTripDetailReport`

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `fromDestination` | string | Yes | Departure location label |
| `toDestination` | string | Yes | Arrival location label |
| `averageMPG` | string | Yes | Average fuel economy |
| `poorFuelMPG` | string | Yes | Lower bound of fuel efficiency range |
| `greatFuelMPG` | string | Yes | Upper bound of fuel efficiency range |
| `offsetMinutes` | string | Yes | Minutes offset for time/speed bar chart labels |
| `poorTimePercent` | string | Yes | % slower than average for time chart |
| `goodTimePercent` | string | Yes | % faster than average for time chart |
| `poorSpeedPercent` | string | Yes | % slower than average for speed chart |
| `goodSpeedPercent` | string | Yes | % faster than average for speed chart |
| `fuelEfficiencyText` | string | Yes | Descriptive feedback text for fuel efficiency |
| `tripTimeText` | string | Yes | Descriptive feedback text for trip time |
| `avgSpeedText` | string | Yes | Descriptive feedback text for average speed |
| `logData` | string | Yes | Raw trip log string (pipe-delimited, newline-separated) |

### Journey Example

See the Commuter journey step 33 for a complete real-world example.
