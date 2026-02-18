# Passenger Console (PASS) Widgets

The Passenger Console (`PASS`) is a landscape-oriented screen in the rear of the vehicle for the passenger's use. It handles passenger onboarding (authentication, destination selection), in-ride entertainment, reminders, and reservation flows.

All widgets on this page are registered on channel `"PASS"` unless noted otherwise.

---

## Table of Contents

- [PassengerWelcomeWidget](#passengerwelcomewidget)
- [PassengerAuthenticationWidget](#passengerauthenticationwidget)
- [PassengerDestinationWidget](#passengerdestinationwidget)
- [PassengerDropoffWidget](#passengerdropoffwidget)
- [PassengerItemsWidget](#passengeritemswidget)
- [PassengerReservationWidgets](#passengerreservationwidgets)
- [RSPassengerWelcomeWidget](#rspassengerwelcomewidget)
- [RSPassengerAuthenticationWidget](#rspassengerauthenticationwidget)
- [RSPassengerDestinationWidget](#rspassengerdestinationwidget)
- [ShowTakeOverWidget (PASS)](#showtakeoverwidget-pass)
- [ShowLoadingCircleWidget (PASS)](#showloadingcirclewidget-pass)
- [MusicPlayerWidget (PASS)](#musicplayerwidget-pass)

---

## PassengerWelcomeWidget

**Source:** `client/app/js/widgets/PASS/PassengerAuthentication.jsx`

Displays a welcome screen with the passenger's connectivity status, sharing permissions from the previous ride, and a "Done" button. Tapping Done fires a configurable event.

### Trigger Event

`show_passenger_welcome`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `onTapEvent` | string | Yes | Console event name emitted when the passenger taps "Done" |

### Journey Example

```json
{
  "event_name": "demo.show_passenger_welcome",
  "console": "PASS",
  "quadrant": "full",
  "onTapEvent": "passenger_done"
}
```

---

## PassengerAuthenticationWidget

**Source:** `client/app/js/widgets/PASS/PassengerAuthentication.jsx`

Displays a compact passenger identity card with avatar, phone-connected indicator, sharing icons (music, address book, location), and temperature preference. Static — no interaction.

### Trigger Event

`show_passenger_authentication`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_passenger_authentication",
  "console": "PASS",
  "quadrant": "1"
}
```

---

## PassengerDestinationWidget

**Source:** `client/app/js/widgets/PASS/PassengerDestination.jsx`

Displays a destination confirmation prompt with two preset destination options and an "Other" button. Tapping either option fires the `onDestinationSelect` event.

### Trigger Event

`show_passenger_destination`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `eventOnTap` | string | Yes | Console event name emitted when either destination option is tapped |

### Journey Example

```json
{
  "event_name": "demo.show_passenger_destination",
  "console": "PASS",
  "quadrant": "full",
  "eventOnTap": "destination_confirmed"
}
```

---

## PassengerDropoffWidget

**Source:** `client/app/js/widgets/PASS/PassengerDropoff.jsx`

Displays a goodbye message with the passenger avatar — shown when the passenger is dropped off.

### Trigger Event

`show_passenger_dropoff`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |

### Journey Example

```json
{
  "event_name": "demo.show_passenger_dropoff",
  "console": "PASS",
  "quadrant": "full"
}
```

---

## PassengerItemsWidget

**Source:** `client/app/js/widgets/PASS/PassengerItemsWidget.jsx`

Displays a reminder list of items the passenger may have forgotten, alongside their identity card with temperature and sharing icons.

### Trigger Event

`show_passenger_items`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `connected` | JSON string | Yes | Array of connectivity icon objects (avatar, phone, etc.) |
| `sharing` | JSON string | Yes | Array of sharing permission icon objects |
| `items` | JSON string | Yes | Array of reminder item icon objects |
| `temp` | string/number | Yes | Passenger temperature preference |

#### Connected / Sharing / Items Object

```json
{ "icon": "avatar-passenger", "itemType": "jpg", "itemClasses": "avatar" }
{ "icon": "Icon-Music-Library", "itemClasses": "" }
{ "icon": "Icon-Umbrella", "itemClasses": "item-icon" }
```

### Journey Example

```json
{
  "event_name": "demo.show_passenger_items",
  "console": "PASS",
  "quadrant": "full",
  "temp": "68",
  "connected": "[{\"icon\":\"avatar-passenger\",\"itemType\":\"jpg\",\"itemClasses\":\"avatar\"},{\"icon\":\"Icon-Mobile-Phone-Check\",\"itemType\":\"svg\",\"itemClasses\":\"mobile-phone\"}]",
  "sharing": "[{\"icon\":\"Icon-Music-Library\",\"itemClasses\":\"\"},{\"icon\":\"Icon-Address-Book\",\"itemClasses\":\"\"},{\"icon\":\"Icon-Location\",\"itemClasses\":\"\"}]",
  "items": "[{\"icon\":\"Icon-Umbrella\",\"itemClasses\":\"item-icon\"},{\"icon\":\"Icon-Laptop\",\"itemClasses\":\"item-icon\"}]"
}
```

---

## PassengerReservationWidgets

**Source:** `client/app/js/widgets/PASS/PassengerReservations.jsx`

Four widgets that show progressive stages of a voice-driven restaurant reservation flow on the passenger screen, each building on the previous with more detail about the dinner search.

| Widget | Trigger Event | Description |
|--------|--------------|-------------|
| `PassengerReservationListening` | `show_passenger_reservations_listening` | Initial listening state — animated mic icon only |
| `PassengerReservationInitial` | `show_passenger_reservations_initial` | Listening + "Dinner" button + Yelp logo |
| `PassengerReservationSecondary` | `show_passenger_reservations_secondary` | Adds cuisine selection (Mexican) + restaurant list |
| `PassengerReservationTertiary` | `show_passenger_reservations_tertiary` | Adds time selection (8PM) + availability grid |

All four accept only a `quadrant` parameter.

### Journey Examples

```json
{ "event_name": "demo.show_passenger_reservations_listening", "console": "PASS", "quadrant": "full" }
{ "event_name": "demo.show_passenger_reservations_initial",   "console": "PASS", "quadrant": "full" }
{ "event_name": "demo.show_passenger_reservations_secondary", "console": "PASS", "quadrant": "full" }
{ "event_name": "demo.show_passenger_reservations_tertiary",  "console": "PASS", "quadrant": "full" }
```

---

## RSPassengerWelcomeWidget

**Source:** `client/app/js/widgets/PASS/RSPassengerAuthentication.jsx`

RealSense-powered welcome screen. Shows a personalized greeting with the passenger's recognized name and previous sharing permissions. Updates live when a RealSense recognition event fires. Includes a "Done" button that fires `onTapEvent`.

### Trigger Event

`show_rs_passenger_welcome`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `image` | string | Yes | Initial avatar image URL |
| `name` | string | Yes | Initial passenger name |
| `onTapEvent` | string | Yes | Console event name emitted when the passenger taps "Done" |
| `eventPassenger` | string | Yes | Socket topic for live RealSense recognition updates |

### Live Update Message Format

```json
{
  "image": "C:\\Users\\Skyline\\...\\generated\\avatar.jpg",
  "name": "Alice",
  "preferences": {
    "music": true,
    "addressBook": false,
    "location": true
  }
}
```

### Journey Example

```json
{
  "event_name": "demo.show_rs_passenger_welcome",
  "console": "PASS",
  "quadrant": "full",
  "image": "/assets/images/avatar-passenger.jpg",
  "name": "Passenger",
  "onTapEvent": "passenger_done",
  "eventPassenger": "realsense/passenger/recognized"
}
```

---

## RSPassengerAuthenticationWidget

**Source:** `client/app/js/widgets/PASS/RSPassengerAuthentication.jsx`

RealSense-powered compact identity card showing a live-updated avatar, temperature preference, and sharing icons. Updates as RealSense recognizes the passenger.

### Trigger Event

`show_rs_passenger_authentication`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `image` | string | Yes | Initial avatar image URL |
| `temperature` | number | Yes | Initial temperature preference |
| `name` | string | No | Passenger name (not currently displayed) |
| `eventPassenger` | string | Yes | Socket topic for live RealSense recognition updates |

### Live Update Message Format

```json
{
  "image": "C:\\Users\\Skyline\\...\\generated\\avatar.jpg",
  "preferences": { "temperature": 68 }
}
```

### Journey Example

```json
{
  "event_name": "demo.show_rs_passenger_authentication",
  "console": "PASS",
  "quadrant": "1",
  "image": "/assets/images/avatar-passenger.jpg",
  "temperature": 68,
  "eventPassenger": "realsense/passenger/recognized"
}
```

---

## RSPassengerDestinationWidget

**Source:** `client/app/js/widgets/PASS/RSPassengerDestination.jsx`

RealSense-powered destination confirmation screen. Shows a live-updated passenger avatar alongside the same two-option destination list as `PassengerDestinationWidget`. Updates as RealSense fires recognition events.

### Trigger Event

`show_rs_passenger_destination`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `image` | string | Yes | Initial avatar image URL |
| `eventOnTap` | string | Yes | Console event name emitted when a destination is tapped |
| `eventPassenger` | string | Yes | Socket topic for live RealSense recognition updates |

### Live Update Message Format

```json
{
  "image": "C:\\Users\\Skyline\\...\\generated\\avatar.jpg",
  "name": "Alice",
  "preferences": { "temperature": 68 }
}
```

### Journey Example

```json
{
  "event_name": "demo.show_rs_passenger_destination",
  "console": "PASS",
  "quadrant": "full",
  "image": "/assets/images/avatar-passenger.jpg",
  "eventOnTap": "destination_confirmed",
  "eventPassenger": "realsense/passenger/recognized"
}
```

---

## ShowTakeOverWidget (PASS)

**Source:** `client/app/js/widgets/CC/ShowSecureTakeOver.jsx`

Also registered on `CC`. See the [CC widget reference](CC.md#showtakeoverwidget) for full documentation.

The PASS version works identically to the CC version — the same source file registers on both channels.

---

## ShowLoadingCircleWidget (PASS)

**Source:** `client/app/js/widgets/CC/AuthenticatedUser.jsx`

Also registered on `CC`. See the [CC widget reference](CC.md#showloadingcirclewidget) for full documentation.

### Trigger Event

`show_loading_circle`

### Journey Example

```json
{
  "event_name": "demo.show_loading_circle",
  "console": "PASS",
  "quadrant": "1"
}
```

---

## MusicPlayerWidget (PASS)

**Source:** `client/app/js/widgets/CC/MusicPlayerWidget.jsx`

Also registered on `CC`. See the [CC widget reference](CC.md#musicplayerwidget) for full documentation. The widget is identical on both consoles.

### Journey Example

```json
{
  "event_name": "demo.show_music_player",
  "console": "PASS",
  "quadrant": "full",
  "imageDriver": "/assets/images/avatar-driver.jpg",
  "imagePassenger": "/assets/images/avatar-passenger.jpg",
  "imageEvent": "/assets/images/music-event.jpg",
  "imageEventClick": null
}
```
