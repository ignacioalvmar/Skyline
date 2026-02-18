# Skyline HMI — Documentation

Skyline is the HMI (Human-Machine Interface) component of the **SKYNIVI** driving simulator. It provides multiple synchronized display interfaces for a vehicle's occupants, driven by event-based scenarios ("journeys") that choreograph what each screen shows at each moment of a simulated drive.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Technology Stack](#technology-stack)
- [Repository Structure](#repository-structure)
- [Running the Application](#running-the-application)
- [Consoles](#consoles)
- [Further Documentation](#further-documentation)

---

## Project Overview

The system consists of:

- **Client** — a React/JSX single-page application that renders UI widgets on five different "console" screens.
- **Server** — a Node.js/Express application that orchestrates events, manages car state, relays MQTT telemetry, and serves the client pages.
- **RealSense** — optional C# applications that pipe Intel RealSense camera data (depth + RGB) into the system via MQTT.
- **Driving Performance** — Python scripts for post-drive analysis.

Journeys (JSON scenario files) define which widgets appear on which screen at each step of a simulated drive. The server fires events as a journey progresses; client widgets subscribe to those events and render themselves into the appropriate zone.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Client framework | React (pre-JSX transform, v0.12) |
| Client build | Lineman (Grunt-based) |
| Client styling | SCSS |
| Client canvas | KineticJS |
| Server runtime | Node.js |
| Server framework | Express.js |
| Real-time transport | Socket.IO |
| IoT messaging | MQTT (mosca broker) |
| Simulator integration | SKYNIVI / Unity via MQTT + Socket.IO |
| RealSense integration | C# .NET + MQTT |
| Driving analytics | Python 3 |

---

## Repository Structure

```
Skyline/
├── client/                     # Frontend application
│   ├── app/
│   │   ├── js/
│   │   │   ├── app.js          # Boot: broker init, widget registration, socket connect
│   │   │   ├── widgets/        # All UI widgets (organized by console)
│   │   │   │   ├── CC/         # Center Console widgets
│   │   │   │   ├── HUD/        # Heads-Up Display widgets
│   │   │   │   ├── IP/         # Information Panel widgets
│   │   │   │   ├── PASS/       # Passenger Console widgets
│   │   │   │   ├── Phone/      # Phone interface widgets
│   │   │   │   ├── DisplayImageWidget.jsx
│   │   │   │   ├── listenMQTT.js
│   │   │   │   ├── sendMQTT.js
│   │   │   │   ├── timedEvent.js
│   │   │   │   └── ReinitializeWidget.js
│   │   │   ├── controllers/    # State controllers and Unity adapter
│   │   │   ├── components/     # GPS and map components
│   │   │   └── third_party/    # CountdownTimer, ProgressBar, TimerBar
│   │   ├── pages/              # HTML entry points (one per console)
│   │   ├── css/                # SCSS stylesheets
│   │   └── static/             # JSON data, images, audio assets
│   ├── config/                 # Lineman build config
│   └── package.json
│
├── server/
│   ├── app.js                  # Server entry point (port 3000)
│   ├── routes/                 # Express HTTP routes
│   ├── views/                  # EJS templates
│   ├── mqttBroker/             # MQTT broker (mosca)
│   ├── socketBroker/           # Socket.IO event relay
│   ├── carState/               # Centralized car state
│   ├── skynivi/                # SKYNIVI simulator adapter
│   ├── journeys/               # Journey JSON scenario files
│   └── package.json
│
├── realsense/                  # Intel RealSense C# projects
├── driving_performance/        # Python analytics scripts
└── docs/                       # This documentation
```

---

## Running the Application

### Prerequisites

- Node.js (v6+ recommended)
- npm
- Lineman (`npm install -g lineman`)

### 1. Start the Server

```bash
cd server
npm install
node app.js
```

The server starts on **http://localhost:3000**.

### 2. Build and Start the Client

```bash
cd client
npm install
lineman run
```

The client is served by the server at port 3000; Lineman watches for file changes and rebuilds automatically.

### 3. Open Console Pages

Navigate to the following URLs to open each display interface:

| Console | URL |
|---------|-----|
| Center Console | http://localhost:3000/cc |
| Heads-Up Display | http://localhost:3000/hud |
| Information Panel | http://localhost:3000/ip |
| Passenger Console | http://localhost:3000/passenger |
| Phone | http://localhost:3000/phone |
| Admin / Journey Runner | http://localhost:3000/run |
| Journey Builder | http://localhost:3000/create |

### 4. Run a Journey

Open the Admin page (`/run`), select a journey (e.g., **Commuter**), and advance through the steps manually or allow SKYNIVI to drive them automatically via MQTT events.

---

## Consoles

Skyline has five display surfaces. Each runs as an independent browser page, connected to the same server via Socket.IO.

| Console ID | Description | Orientation |
|-----------|-------------|-------------|
| `CC` | Center Console — primary driver-facing touchscreen | Portrait |
| `HUD` | Heads-Up Display — windshield overlay | Landscape |
| `IP` | Instrument Panel — gauges and telemetry | Landscape |
| `PASS` | Passenger Console — rear passenger screen | Landscape |
| `phone` | Phone interface — smartphone simulation | Portrait |

Each console has **7 numbered zones** (1–7) plus a `"full"` option that spans the entire screen. Widgets render into a specific zone by targeting its DOM element ID.

---

## Further Documentation

| Document | Description |
|----------|-------------|
| [architecture.md](architecture.md) | Zone system, broker/pub-sub, widget lifecycle, journey file format |
| [widget-guide.md](widget-guide.md) | How to create and register a new widget |
| [widgets/universal.md](widgets/universal.md) | Universal widgets available on all consoles |
| [widgets/CC.md](widgets/CC.md) | Center Console widget reference |
| [widgets/HUD.md](widgets/HUD.md) | Heads-Up Display widget reference |
| [widgets/IP.md](widgets/IP.md) | Information Panel widget reference |
| [widgets/PASS.md](widgets/PASS.md) | Passenger Console widget reference |
| [widgets/phone.md](widgets/phone.md) | Phone widget reference |
