# Heads-Up Display (HUD) Widgets

The HUD (`HUD`) is a landscape-oriented overlay projected on the windshield. It surfaces non-interactive notifications, route info, listening states, and ambient status indicators to the driver.

All widgets on this page are registered on channel `"HUD"`.

---

## Table of Contents

- [HUDNotificationWidget](#hudnotificationwidget)
- [RSHUDNotificationWidget](#rshudnotificationwidget)
- [AmbulanceWidget](#ambulancewidget)
- [CalendarWidget](#calendarwidget)
- [HudDinnerWidgets](#huddinnerwidgets)
- [HudListeningWidget](#hudlisteningwidget)
- [HUDMessageWidget](#hudmessagewidget)
- [HudRouteWidget](#hudroutewidget)
- [HalfMoonSpeedometerWidget](#halfmoonspeedometerwidget)

---

## HUDNotificationWidget

**Source:** `client/app/js/widgets/HUD/HUDNotification.jsx`

The primary HUD notification widget. Renders a flexible three-row layout with primary icons (large), a text message with optional inline icons, and secondary icons (small or mini). Optionally plays audio on render.

This widget uses the same `notify` event as the CC `NotificationWidget` but with a different payload structure and visual layout.

### Trigger Event

`notify`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `primary_icons` | JSON string | Yes | Array of primary icon objects (displayed large at top) |
| `secondary_icons` | JSON string | Yes | Array of secondary icon or text objects (displayed at bottom) |
| `message_text` | string | Yes | Main text message |
| `message_icons` | JSON string | Yes | Array of inline icon objects shown after the message text |
| `use_mini_icons` | string | No | `"true"` to use mini CSS class for secondary icons |
| `audioFile` | string | No | Audio file URL to play when the widget renders |

#### Primary / Message Icon Object

```json
{ "url": "Icon-Ambulance-Top.svg", "iconClass": "icon" }
```

#### Secondary Icon Object

Secondary icons can be one of three formats:

```json
{ "url": "Icon-Seat.svg", "iconClass": "icon-seat", "isVideo": false }
{ "text": "Safe shoulder in 300 ft", "iconClass": "distance-text" }
{ "paragraph": true, "iconClass": "distance-class" }
```

### Journey Example (from Commuter journey)

```json
{
  "widget_index": "hudMessageWidget",
  "event_name": "demo.notify",
  "event_text": "HUD Message",
  "console": "HUD",
  "quadrant": "3",
  "message_text": "Auto-pilot is available",
  "message_icons": "[]",
  "primary_icons": "[{\"url\": \"/icons/enter-ap-lane.png\",\"iconClass\": \"icon\"}]",
  "secondary_icons": "[]",
  "use_mini_icons": "false",
  "audioFile": null
}
```

---

## RSHUDNotificationWidget

**Source:** `client/app/js/widgets/HUD/RSHUDNotificationWidget.jsx`

A RealSense-aware HUD notification that displays a personalized welcome message with the passenger's name, avatar, and privacy permission icons (music, address book, location, calendar). Updates live when a RealSense recognition event fires.

### Trigger Event

`show_rs_hud_notification`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `image` | string | Yes | Initial avatar image URL |
| `message_text` | string | Yes | Initial welcome message (e.g., passenger name) |
| `music` | string | Yes | Initial music icon class (`"icon"` or `"de-emphasized"`) |
| `address` | string | Yes | Initial address book icon class |
| `location` | string | Yes | Initial location icon class |
| `calendar` | string | Yes | Initial calendar icon class |
| `event` | string | Yes | Socket topic to subscribe to for live updates |

### Live Update Message Format

```json
{
  "image": "C:\\Users\\Skyline\\...\\generated\\avatar.jpg",
  "name": "Alice",
  "preferences": {
    "music": true,
    "addressBook": false,
    "location": true,
    "calendar": true
  }
}
```

### Journey Example

```json
{
  "event_name": "demo.show_rs_hud_notification",
  "console": "HUD",
  "quadrant": "3",
  "image": "/assets/images/avatar-passenger.jpg",
  "message_text": "Passenger",
  "music": "de-emphasized",
  "address": "de-emphasized",
  "location": "de-emphasized",
  "calendar": "de-emphasized",
  "event": "realsense/passenger/recognized"
}
```

---

## AmbulanceWidget

**Source:** `client/app/js/widgets/HUD/AmbulanceWidget.jsx`

Displays a safe pull-over notification with a roadway diagram and a real-time distance-to-safe-shoulder indicator. Distance and proximity state update dynamically via the `pullover_proximity` event.

### Trigger Event

`hud_ambulance`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into (internally hardcoded to zone `"3"`) |

### Secondary Event

`pullover_proximity` — updates the displayed distance and proximity state.

Expected payload: `{ proximity: "Near" | "Far", distance: number }` (distance in feet)

### Journey Example

```json
{
  "event_name": "demo.hud_ambulance",
  "console": "HUD",
  "quadrant": "3"
}
```

---

## CalendarWidget

**Source:** `client/app/js/widgets/HUD/CalendarWidget.jsx`

Displays a calendar event reminder card with a day label, time, and an optional status message with an icon. Supports showing a "last week" previous appointment for context.

### Trigger Event

`calendar_event`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `day` | string | Yes | Day label (e.g., `"Today"`, `"Monday"`) |
| `time` | string | Yes | Appointment time (e.g., `"3:30 p.m."`) |
| `place_name` | string | No | Name of the location (used in data but not displayed in current template) |
| `address` | string | No | Address (used in data but not displayed in current template) |
| `message` | object | Yes | Status message object |
| `showLastWeek` | boolean | No | If `true`, shows a previous week's appointment for comparison |

#### Message Object

```json
{
  "text": "You'll be on time",
  "icon": "Icon-Check.svg",
  "messageClass": "status-on-time",
  "isEmphasized": false
}
```

| Field | Type | Description |
|-------|------|-------------|
| `text` | string | Message text |
| `icon` | string | Optional icon filename (full name including extension) |
| `messageClass` | string | CSS class applied to the message paragraph |
| `isEmphasized` | boolean | If `true`, wraps text in `<em>` |

### Journey Example

```json
{
  "event_name": "demo.calendar_event",
  "console": "HUD",
  "quadrant": "2",
  "day": "Today",
  "time": "3:30 p.m.",
  "message": {
    "text": "Running 10 min late",
    "icon": "Icon-Clock.svg",
    "messageClass": "status-late",
    "isEmphasized": true
  },
  "showLastWeek": false
}
```

---

## HudDinnerWidgets

**Source:** `client/app/js/widgets/HUD/HudDinnerWidget.jsx`

Five sequential widgets that animate the HUD display during a dinner reservation conversation between driver and passenger. Each widget shows a different stage of the booking process.

| Widget | Trigger Event | Display |
|--------|--------------|---------|
| `HudDinnerFirstWidget` | `show_hud_dinner_first` | Passenger avatar + phone icon + listening animation (initial call) |
| `HudDinnerSecondWidget` | `show_hud_dinner_second` | Passenger + phone + restaurant name recognized (Wakamole 8 p.m.) |
| `HudDinnerThirdWidget` | `show_hud_dinner_third` | Passenger + phone + OpenTable booking in progress |
| `HudDinnerFourthWidget` | `show_hud_dinner_fourth` | Passenger + phone + reservation booked confirmation |
| `HudDinnerFifthWidget` | `show_hud_dinner_fifth` | Passenger + red phone (call ended) |

All five widgets accept only a `quadrant` parameter.

### Journey Example

```json
{
  "event_name": "demo.show_hud_dinner_first",
  "console": "HUD",
  "quadrant": "3"
}
```

---

## HudListeningWidget

**Source:** `client/app/js/widgets/HUD/HudListeningWidget.jsx`

Displays an animated listening indicator (animated GIF) — used to show the system is actively processing voice input.

### Trigger Event

`show_hud_listening`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_hud_listening",
  "console": "HUD",
  "quadrant": "3"
}
```

---

## HUDMessageWidget

**Source:** `client/app/js/widgets/HUD/HudMessageWidget.jsx`

Displays a simple two-line text notification with a bold header and body text.

### Trigger Event

`hud_message`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `headerText` | string | Yes | Bold header line |
| `bodyText` | string | Yes | Secondary body text |

### Journey Example

```json
{
  "event_name": "demo.hud_message",
  "console": "HUD",
  "quadrant": "3",
  "headerText": "Traffic Ahead",
  "bodyText": "Expect 12-minute delay on I-405"
}
```

---

## HudRouteWidget

**Source:** `client/app/js/widgets/HUD/HudRouteWidget.jsx`

Displays a route change prompt on the HUD with two route option icons (Favorite and Scenic) and a distance indicator. Static — no interactive behavior.

### Trigger Event

`show_hud_route_change`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_hud_route_change",
  "console": "HUD",
  "quadrant": "3"
}
```

---

## HalfMoonSpeedometerWidget

**Source:** `client/app/js/widgets/HUD/halfmoonSpeedometerWidget.js`

A KineticJS-rendered half-moon speedometer optimized for the HUD. Displays current speed with animated tick marks and a speed limit indicator. Optionally shows a traffic light countdown timer overlay when stopped at a red light.

This widget uses a direct socket event (`initHalfMoonSpeedometer`) rather than the broker pub/sub pattern.

### Trigger Event

`initHalfMoonSpeedometer` (direct socket event)

### Trigger Payload

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `speedLimit` | number | No | Speed limit in MPH for the indicator line. Defaults to 35. |
| `showCountDownTimer` | string | No | `"true"` to show a traffic light countdown overlay when stopped |

### MQTT / Socket Topics Subscribed

- `car/telemetry` — expects `{ mph, speedLimit }` to update the speed display
- `car/nextsignal` — expects `{ color, distance, timeToGreen }` to trigger the countdown timer when stopped at a red light within 30 meters

### Remove Event

`removeHalfMoonSpeedometer` — clears the widget zone.

### Journey Example

```json
{
  "widget_index": "halfMoonSpeedo",
  "event_name": "initHalfMoonSpeedometer",
  "console": "HUD",
  "quadrant": "1",
  "speedLimit": 35,
  "showCountDownTimer": "true"
}
```
