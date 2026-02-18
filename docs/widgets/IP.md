# Information Panel (IP) Widgets

The Information Panel (`IP`) is a landscape-oriented display that shows persistent driving metrics: speed, distance, time, weather, and trip data. All widgets on this panel use KineticJS canvas rendering for smooth, hardware-accelerated output.

All widgets on this page are registered on channel `"IP"`.

---

## Table of Contents

- [SpeedometerWidget](#speedometerwidget)
- [ClockWidget](#clockwidget)
- [TimerWidget](#timerwidget)
- [DistanceWidget (Trip Distance)](#distancewidget-trip-distance)
- [WeatherWidget](#weatherwidget)
- [TripReportWidget](#tripreportwidget)

---

## SpeedometerWidget

**Source:** `client/app/js/widgets/IP/speedometer.js`

A KineticJS analog speedometer rendered on a 256×400 canvas. Displays current speed as an arc of tick marks and a rotating pointer. A central circle shows the speed limit. Tick marks turn blue when the car exceeds the speed limit.

### Trigger Event

`initSpeedometer` (broker pub/sub via `"IP"` channel)

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### MQTT / Socket Topics Subscribed

- `car/telemetry` — expects `{ speedMPH }` to update the speed display

### Remove Event

`removeSpeedometer` — clears the widget zone.

### Behavior

The speedometer range is 0–100 MPH (configured as `speedReference = 50` at the 90° position). Speed limit is hardcoded to 45 MPH internally (the `speedLimitText` update is commented out; the limit circle and line update via `drawSpeedometer`).

### Journey Example (from Commuter journey)

```json
{
  "widget_index": "speedoWidget",
  "event_name": "demo.initSpeedometer",
  "event_text": "Speedometer",
  "console": "IP",
  "quadrant": "3"
}
```

---

## ClockWidget

**Source:** `client/app/js/widgets/IP/clock.js`

A KineticJS analog clock with minute, hour, and second hands rendered on a 256×300 canvas. Displays the current date below the clock face, updated every second.

### Trigger Event

`showClock`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Behavior

The clock reads the system clock (`new Date()`) every 1000 ms and updates the Kinetic layers. The date text format is `"Month DD, YYYY"` (e.g., `"February 18, 2026"`).

### Journey Example (from Commuter journey)

```json
{
  "widget_index": "clockWidget",
  "event_name": "demo.showClock",
  "event_text": "Clock",
  "console": "IP",
  "quadrant": "1"
}
```

---

## TimerWidget

**Source:** `client/app/js/widgets/IP/timer.js`

A KineticJS circular countdown timer rendered on a 455×341 canvas. Tick marks animate away as time passes. Supports both seconds and minutes modes. Changes color from blue to orange when time is running low.

### Trigger Event

`initTimer`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `startTime` | number | Yes | Starting time value (interpreted according to `units`) |
| `units` | string | Yes | `"seconds"` or `"minutes"` |

### Behavior

- **Seconds mode:** Each tick (500 ms) hides one of the 120 tick marks (2 per second). Turns orange when ≤30 seconds remain.
- **Minutes mode:** Hides one of 120 marks per half-second pass. When the final minute is reached, automatically restarts in seconds mode for the last 60 seconds.

### Journey Example

```json
{
  "event_name": "demo.initTimer",
  "console": "IP",
  "quadrant": "2",
  "startTime": 45,
  "units": "seconds"
}
```

---

## DistanceWidget (Trip Distance)

**Source:** `client/app/js/widgets/IP/tripDistance.js`

A KineticJS widget that displays remaining miles to destination on a 256×256 canvas. Updates live from `car/telemetry`.

### Trigger Event

`showTripDistance`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `distance` | string/number | No | Initial distance value to display before telemetry arrives |

### MQTT / Socket Topics Subscribed

- `car/telemetry` — expects `{ progress: { remainingMiles } }` to update the displayed distance

### Remove Event

`removeTripDistance` — clears the widget zone.

### Journey Example (from Commuter journey)

```json
{
  "widget_index": "tripDistance",
  "event_name": "demo.showTripDistance",
  "event_text": "Trip Distance Widget",
  "console": "IP",
  "quadrant": "3",
  "distance": "3"
}
```

---

## WeatherWidget

**Source:** `client/app/js/widgets/IP/weather.js`

A KineticJS widget that displays current weather conditions on a 455×341 canvas with a background image, temperature, and a weather message. Static — does not update after render.

### Trigger Event

`showWeather`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `temperature` | string/number | Yes | Temperature to display (displayed with a degree symbol, e.g., `"78°"`) |
| `message` | string | Yes | Weather description text (e.g., `"30% chance of rain"`) |
| `image` | string | Yes | Background image filename (without extension) from `assets/images/weather/`. E.g., `"partly-cloudy"` loads `/assets/images/weather/partly-cloudy.png`. |

### Journey Example (from Commuter journey)

```json
{
  "widget_index": "weatherWidget",
  "event_name": "demo.showWeather",
  "event_text": "Weather",
  "console": "IP",
  "quadrant": "2",
  "temperature": "78",
  "message": "30% chance of rain",
  "image": "partly-cloudy"
}
```

---

## TripReportWidget

**Source:** `client/app/js/widgets/IP/TripReportWidget.js`

Also registered on: `CC`

Post-trip report widget displaying Highcharts column charts for trip time and average speed, plus a fuel efficiency range slider. Uses direct socket event subscriptions rather than the broker pattern.

See the [CC widget reference](CC.md#tripreportwidget) for full documentation and parameter descriptions, as the widget is identical on both consoles.
