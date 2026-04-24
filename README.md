# Skyline

Skyline is a rapid prototyping platform for automotive user experience research. This repository contains the web-based HMI layer used to build, orchestrate, and evaluate in-vehicle interface concepts across multiple displays such as the center console, HUD, instrument panel, passenger display, and companion phone views.

In practical terms, Skyline lets teams prototype interactive driving experiences by combining:

- browser-rendered HMI widgets built with HTML, CSS, and JavaScript
- a Node.js/Express server that hosts the simulator UIs
- Socket.IO messaging between the browser clients and the server
- a RabbitMQ topic bridge for external events, sensors, and back-end services
- scenario playback and event routing for demo flows and user studies
- shared vehicle state propagation so multiple widgets can react to the same context

## What This Repository Does

The current codebase is set up to support rapid iteration on automotive HMI concepts and demonstrations:

- It renders multiple vehicle display surfaces from the same platform, including `center_console`, `info_panel`, `passenger`, and `hud`.
- It hosts a large library of reusable widgets for common in-vehicle experiences such as navigation, messaging, weather, media, authentication, trip reporting, alerts, and take-over flows.
- It routes events from browser UIs to the messaging layer and back again, so prototypes can react to scripted scenarios, telemetry, or external sensor signals.
- It supports scenario loading and playback so researchers and designers can step through end-to-end journeys during demos or evaluations.
- It maintains shared car state so one interaction can update multiple surfaces consistently.

The repository also includes the SKYNIVI-era extensions for dynamic widgets and context-aware interaction prototypes, including RealSense and in-cabin sensing integrations reflected in the widget definitions and message topics.

## Architecture At A Glance

- `server/`: Express application, Socket.IO bridge, RabbitMQ client/broker, scenario support, EJS/HTML views, and console definitions
- `client/`: front-end assets and widget implementations used by the simulator UIs
- `server/views/`: demo pages and multi-display console templates
- `client/app/static/json/widget.json`: widget catalog, supported displays, subscriptions, and sample payloads

## Running The Project

This repository is a legacy research prototype, so setup reflects the original stack.

1. Install dependencies in both `server/` and `client/`.
2. Start RabbitMQ locally on `localhost:5672`.
3. Start the server from `server/` with Node.js.
4. Start the client tooling from `client/` if you need the legacy front-end build workflow.
5. Open the simulator views served from `http://localhost:3000/`.

Useful routes include the console views and demo pages under the server, including the main demo flow and the individual display surfaces.

## History

Skyline was introduced as a rapid prototyping driving simulator for automotive user experience work at Intel Labs. The original platform emphasized fast iteration on in-vehicle experiences using accessible web technologies and high-fidelity HMI assets for research and early product exploration.

The platform was later extended through SKYNIVI to support sensor integration and dynamic, context-aware widgets for in-cabin-aware HMIs. In this repository, that evolution is visible in the event-driven architecture, RabbitMQ integration, shared state model, and widgets tied to context-sensing and RealSense topics.

A later publication positioned Skyline as a platform for scaling UX-centric in-vehicle HMI development across product development cycles, highlighting its value beyond early-stage prototyping.

## Publications

### 2015: Public Introduction Of Skyline

Skyline was first presented publicly in:

Alvarez, Ignacio, Laura Rumbel, and Robert Adams. "Skyline: a rapid prototyping driving simulator for user experience." *Proceedings of the 7th International Conference on Automotive User Interfaces and Interactive Vehicular Applications* (2015), 101-108. [https://doi.org/10.1145/2799250.2799290](https://doi.org/10.1145/2799250.2799290)

```bibtex
@inproceedings{10.1145/2799250.2799290,
  author = {Alvarez, Ignacio and Rumbel, Laura and Adams, Robert},
  title = {Skyline: a rapid prototyping driving simulator for user experience},
  year = {2015},
  isbn = {9781450337366},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/2799250.2799290},
  doi = {10.1145/2799250.2799290},
  abstract = {This paper introduces Skyline, a user experience prototyping platform for automotive, developed in Intel Labs to enable rapid iterative development of in-vehicle experiences. The paper describes the hardware and software components of Skyline. It highlights the flexibility of the interior HMI configuration and the accessibility of the development platform, based on open source Web technologies such as JavaScript, CSS, Node.js and MQTT. The paper steps through the development and user testing processes for a cockpit experience with Skyline, illustrating the benefits of capturing early qualitative user feedback as support for rapid prototyping. Finally, the paper outlines the potential benefits of high fidelity assets developed on the platform for both industry and academia, and the enormous value that documented user experience HMI assets can have for in-vehicle feature productization and research.},
  booktitle = {Proceedings of the 7th International Conference on Automotive User Interfaces and Interactive Vehicular Applications},
  pages = {101--108},
  numpages = {8},
  keywords = {design thinking, driving simulator, rapid prototyping, skyline, user experience},
  location = {Nottingham, United Kingdom},
  series = {AutomotiveUI '15}
}
```

### 2016: SKYNIVI Extension For In-Cabin-Aware HMI

The current repository lineage was extended in the SKYNIVI platform to support sensor integration and dynamic widgets for reactive, in-cabin-aware HMIs. That work is described in:

Rivera, Victor Palacios, Laura Rumbel, and Ignacio Alvarez. "Autonomous HMI Made Easy: Prototyping Reactive In-cabin Aware HMIs." *Adjunct Proceedings of the 8th International Conference on Automotive User Interfaces and Interactive Vehicular Applications* (2016), 1-7. [https://doi.org/10.1145/3004323.3004353](https://doi.org/10.1145/3004323.3004353)

```bibtex
@inproceedings{10.1145/3004323.3004353,
  author = {Rivera, Victor Palacios and Rumbel, Laura and Alvarez, Ignacio},
  title = {Autonomous HMI Made Easy: Prototyping Reactive In-cabin Aware HMIs},
  year = {2016},
  isbn = {9781450346542},
  publisher = {Association for Computing Machinery},
  address = {New York, NY, USA},
  url = {https://doi.org/10.1145/3004323.3004353},
  doi = {10.1145/3004323.3004353},
  abstract = {Automotive user experiences can be increasingly personalized and adaptive thanks to advances in in-vehicle sensors and user modelling but current automotive software development frameworks still require large software development efforts to create custom interaction solutions. In this paper we propose a novel system architecture aimed at supporting automotive researchers and designers by simplifying the prototyping process towards novel adaptive user interfaces. We describe the integration of RealSense sensors and the Context Sensing SDK with the Skyline driving simulator framework. The combination of these tools allows rapid prototyping of in-cabin context aware interactions. The paper presents two use cases of in-cabin-aware prototypes, a user profile loading interface that recognizes identities and occupant roles and an L4 to L3 take-over control interface using RealSense and Context sensing APIs to detect in-vehicle events and Skyline to present real-time adaptive warning interfaces. The resulting experiences are core components of an intelligent ADAS framework for research of IVI personalization and highly automated collaborative driving.},
  booktitle = {Adjunct Proceedings of the 8th International Conference on Automotive User Interfaces and Interactive Vehicular Applications},
  pages = {1--7},
  numpages = {7},
  keywords = {Skyline, RealSense, Rapid Prototyping, Context-Awareness, Context Sensing, Automotive User Experience, Ambient Intelligence, Adaptive Interface, ADAS},
  location = {Ann Arbor, MI, USA},
  series = {AutomotiveUI '16 Adjunct}
}
```

### 2017: Skyline In Product Development Cycles

Skyline's role in scalable UX-centric automotive product development was later discussed in:

Alvarez, Ignacio, and Laura Rumbel. "Skyline: A Platform Towards Scalable UX-Centric In-Vehicle HMI Development." *International Journal of Mobile Human Computer Interaction (IJMHCI)* 9, no. 3 (2017): 34-53. [https://www.igi-global.com/article/skyline/181597](https://www.igi-global.com/article/skyline/181597)

```bibtex
@article{alvarez2017skyline,
  title = {Skyline: A Platform Towards Scalable UX-Centric In-Vehicle HMI Development},
  author = {Alvarez, Ignacio and Rumbel, Laura},
  journal = {International Journal of Mobile Human Computer Interaction (IJMHCI)},
  volume = {9},
  number = {3},
  pages = {34--53},
  year = {2017},
  publisher = {IGI Global Scientific Publishing}
}
```

## Citation Guidance

If you are citing the original platform, use the 2015 AutomotiveUI paper.

If you are citing the sensor-integrated, context-aware extension represented by SKYNIVI-related work, use the 2016 AutomotiveUI Adjunct paper.

If you are citing Skyline as a broader methodology or platform for UX-centric in-vehicle HMI development, use the 2017 journal article.
