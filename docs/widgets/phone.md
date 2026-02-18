# Phone Widgets

The Phone console (`phone`) simulates a smartphone interface connected to the vehicle. It surfaces scenario-triggered notifications that the passenger or driver might see on their device during the simulated drive.

All widgets on this page are registered on channel `"phone"`.

In addition to the phone-specific widget below, all [universal widgets](universal.md) are also available on the phone console.

---

## Table of Contents

- [PhoneNotificationWidget](#phonenotificationwidget)

---

## PhoneNotificationWidget

**Source:** `client/app/js/widgets/Phone/PhoneNotificationWidget.jsx`

Renders a full-zone image on the phone screen. When tapped, fires a state transition based on a `nextState` code. This is essentially a phone-specific image display with built-in navigation logic for common state transitions.

### Trigger Event

`phone_notification`

### Payload Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `quadrant` | string | Yes | Zone to render into |
| `imageUrl` | string | Yes | Filename (within `assets/images/`) of the image to display |
| `nextState` | string | Yes | State code determining what happens when the image is tapped. See state codes below. |

### State Codes

| `nextState` value | Action on tap |
|-------------------|--------------|
| `"11"` | Publishes `StateEvents.TO_STATE_11` with `purgeHUD: true` |
| `"12"` | Publishes `StateEvents.TO_STATE_12` with `purgeHUD: true` |
| `"13"` | Publishes `StateEvents.TO_STATE_13` with `purgeHUD: true` |
| `"clear"` | Publishes `reinitialize` on the `phone` channel (clears the display) |

Any other value results in no action on tap.

### Journey Example

Show a notification image and advance to state 1.1 on tap:

```json
{
  "widget_index": "phoneNotificationWidget",
  "event_name": "demo.phone_notification",
  "event_text": "Phone Notification",
  "console": "phone",
  "quadrant": "full",
  "imageUrl": "phone-notification-email.png",
  "nextState": "11"
}
```

Show a dismissible notification that clears on tap:

```json
{
  "widget_index": "phoneNotificationWidget",
  "event_name": "demo.phone_notification",
  "event_text": "Phone Notification",
  "console": "phone",
  "quadrant": "full",
  "imageUrl": "phone-alert.png",
  "nextState": "clear"
}
```

### Notes

- The `imageUrl` value is prepended with `/assets/images/` by the widget, so only the filename (or relative sub-path) should be provided.
- To show images from the `DisplayImageWidget` on the phone (without built-in state navigation), use `demo.displayImage` with `console: "phone"` instead.
