<div align="center">
  <img src="assets/greenlogo.svg" alt="Curiculla Logo" width="280" height="280" style="border-radius: 60%; object-fit: cover;">
  <h1>Curiculla: A Comprehensive Web-Based Student Companion System</h1>
</div>

Curiculla is a lightweight front-end web application for conceptual purposes, specialized to be an all-in-one localized student-companion system. The platform is intended for tertiary-level students, providing a fast, user-friendly interface that combines scheduling, task prioritization, authentication, authentication management, and attendance recording to help students manage a heavy course load efficiently and protect their semester General Weighted Average (GWA).

---

## Features

* **Secure Client-Side Access:** Includes local user registration and credential validation to establish a browser profile.
* **Dynamic Timetable Generation:** Reads array-driven structures to dynamically build a personalized class schedule dashboard.
* **Interactive Attendance Grid:** Utilizes native JavaScript date calculations to generate an interactive monthly matrix where users toggle "present" or "absent" status.
* **Prioritized To-Do Stack:** An unshifted array pipeline that instantly bubbles high-priority deadlines (High, Medium, Low) to the top of your workspace to eliminate exam-night cramming.
* **Localized GWA Estimator:** A specialized module tailored specifically to local university unit-weighted metrics to help track true academic standings.
* **Zero Setup Tax & Offline Persistence:** Pre-coded specifically for academic workloads with no initial database configuration required. User profiles, schedules, and logs save securely directly into the browser's `localStorage`.

---

## Tech Stack

* **Frontend Structure:** Semantic HTML Layouts
* **Layout Styling:** CSS3 (CSS Grid for master containers, Flexbox for modular components)
* **Core System Engine:** JavaScript (Dynamic DOM manipulation and array-driven tracking)
* **Data Storage Sandbox:** Web Storage API (`localStorage`)

---

## Project Structure

```text
├── assets/                       # UI icons, profile graphics, and branding assets
├── files/
│   ├── attendance_tracker.html   # Monthly attendance compliance workspace
│   ├── attendance_tracker.js     # Calendar grid generation & checkbox log toggles
│   ├── auth.js                   # Client-side user state control logic
│   ├── gwa-calculator.html       # Unit-weighted grade calculation dashboard
│   ├── gwa-calculator.js         # Math computation logic for academic standings
│   ├── index.html                # Core student companion home panel
│   ├── home.js                   # Schedule rendering and dynamic interface loaders
│   ├── login.html                # Account access entry interface
│   ├── personalinfo.js           # Student profile state processing
│   ├── register.html             # Local account creation panel
│   ├── style.css                 # Monochromatic green UI layout & visual hierarchies
│   ├── todo_list.html            # Task priority management view
│   └── todo_list.js              # Stack-based prioritization array logic & status counters
├── README.md                     # Project documentation and setup guide
