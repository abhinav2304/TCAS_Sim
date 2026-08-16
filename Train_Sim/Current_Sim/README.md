# RDSO KAVACH (TCAS) Simulation

## 🚄 Overview

This project is a web-based, interactive simulation of the **Indian Railways KAVACH (Train Collision Avoidance System)**. It models the core safety features of KAVACH, including station interlocking control, RFID track layouts, and the onboard Driver Machine Interface (DMI). 

The simulation allows users to visualize how a train interacts with track circuits (TINs), RFID tags, points, and signals in real-time, providing an educational and testing platform for railway signaling principles (specifically conforming to RDSO specifications like version 4.0).

---

## 🏗️ Architecture & Tech Stack

The project has been modularized for easier development and maintainability:

- **[railway_signalling_simulation-6.html](./railway_signalling_simulation-6.html)**: The main entry point. Contains the HTML structure, dashboard layout, and Tailwind CSS configuration.
- **[style.css](./style.css)**: Contains custom CSS rules, layout constraints, modern glow effects for signals, and custom scrollbar styling.
- **[script.js](./script.js)**: The core simulation engine. Handles the HTML5 Canvas rendering, physics updates, signaling logic, and user interactions.

**Technologies Used:**
- **HTML5 Canvas**: For high-performance, real-time rendering of the track layout and train movements.
- **Vanilla JavaScript**: No heavy frameworks. Uses `requestAnimationFrame` for a smooth simulation loop.
- **Tailwind CSS (via CDN)**: For rapid, modern, utility-first UI styling.

---

## ✨ Key Features

1. **Onboard KAVACH DMI (Driver Machine Interface)**
   - Real-time digital speed gauges (Actual Speed vs. Target/PSR).
   - Dynamic **Movement Authority (MA)** progress bar.
   - Live readouts of active track circuit (TIN), route, direction, and last scanned RFID tag.
   - Operating mode indicators (Full Supervision, On-Sight, Trip).

2. **Track Layout Simulation**
   - High-contrast visual representation of a 4-line station yard (based on Gullaguda - GGD).
   - Live visual updates for point alignments (P1, P2, P3, P4).
   - Visual indicators for track occupancy (turns red when a train or obstacle is present).

3. **Interlocking & Signalling Logic**
   - **4-Aspect Cascading Signals**: Calculates signal aspects (Green, Double Yellow, Yellow, Red) based on route alignment and track occupancy ahead.
   - **Table of Control (TOC) Inspector**: A live table that highlights the active row based on the train's current position and route.

4. **Safety & Collision Avoidance**
   - **SPAD (Signal Passed at Danger)** detection: Instantly trips the train if it passes a red signal.
   - **Collision Detection**: Stops the train if it enters an occupied block section or hits a designated obstacle.
   - **Permanent Speed Restrictions (PSR)**: Automatically enforces speed limits (e.g., 30 km/h on loop lines).

---

## 🛠️ Development Guide

### How the Simulation Works

The simulation runs in a continuous loop powered by `requestAnimationFrame()`. Every frame, the following steps occur:

1. **`updateLogic()`**: 
   - Evaluates obstacle placement based on user input.
   - Calculates track circuit (TIN) occupancy.
   - Determines signal aspects based on track conditions.
   - Updates the KAVACH Movement Authority (MA) and target speeds.
   - Applies train physics (acceleration/deceleration) and updates the train's X-coordinate.
   - Checks for SPAD or collisions.
2. **`draw()`**:
   - Clears the HTML5 Canvas.
   - Renders the grid, tracks, points, signals, RFID tags, and track labels.
   - Draws the locomotive at its newly calculated position.
3. **`updateUI()`**:
   - Synchronizes the DOM elements (DMI dashboard, TOC table) with the internal javascript state variables.

### Adding New Features

- **To modify the UI/Dashboard**: Edit `railway_signalling_simulation-6.html`. Ensure IDs are preserved if they are tied to JS logic.
- **To adjust colors/animations**: Edit `style.css`.
- **To change physics, track layouts, or signaling rules**: Edit `script.js`.
  - The `tins` array defines track circuits.
  - The `rfidTags` array defines scanner locations.
  - The `draw()` function handles all canvas drawing operations.

---

## 🚀 Future Roadmap

*(Ideas for upcoming development)*

1. **Multiple Trains**: Expand the simulation to handle 2 or more trains simultaneously to demonstrate KAVACH's anti-collision features in real-time.
2. **Dynamic Route Building**: Allow users to dynamically create new track layouts or upload track plans via JSON.
3. **Audio Alerts**: Implement KAVACH audio warnings for overspeeding, SPAD alerts, and approaching level crossings.
4. **Backend Integration**: Move track state to a backend server (Node.js/Python) to allow multiplayer station control (one user acts as Station Master, another as the Loco Pilot).
