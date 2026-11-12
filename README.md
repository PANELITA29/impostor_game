# IMPOSTOR — Social Deduction Party Game

> Offline-first Progressive Web App (PWA) for face-to-face social deduction party games. 100% free, private, and zero server dependency.

![React](https://img.shields.io/badge/React-19-blue?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![Vite](https://img.shields.io/badge/Vite-PWA-purple?logo=vite)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v3-teal?logo=tailwindcss)
![Tests](https://img.shields.io/badge/Vitest-19%20passed-green?logo=vitest)

---

## 🎮 Overview

**IMPOSTOR** is designed for in-person group gatherings, road trips, and parties where players pass a single mobile device or play together on a table without needing active internet connection or accounts.

- **Pass & Play Flow:** Smooth handover screen with anti-peeking privacy hold-to-reveal controls.
- **Chaos Mode:** Dynamic round conditions (classic impostor count, double chaos, or pure paranoia).
- **Audio Experience:** 100% procedural synthetic sound design using Web Audio API (no external MP3/WAV files required).
- **Midnight Social Mystery Aesthetic:** Reactive Balatro fluid background shader, interactive 3D WebGL card tilt, liquid metal effects, and high-contrast neon accents.
- **Dynamic Theming & Localization:** Supports English and Spanish, alongside 4 palette themes (*Midnight Emerald*, *Cyberpunk Amber*, *Crimson Hazard*, *Amethyst Void*).
- **PWA Ready:** Installable on iOS, Android, and Desktop with offline caching via Workbox and Screen Wake Lock protection during active rounds.

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/PANELITA29/impostor_game.git

# Navigate to project folder
cd impostor_game

# Install dependencies
npm install

# Start development server
npm run dev
```

Visit `http://localhost:5173` in your browser.

---

## 🧪 Testing & Validation

The core game logic and persistent storage layers are covered with unit tests using Vitest:

```bash
# Run test suite
npm test
```

### Coverage Highlights:
- Word selector anti-repetition cycles across custom and default categories.
- Classic & Chaos mode probabilistic distributions over 500+ simulated rounds.
- Local storage crash recovery and in-memory fallback on `QuotaExceededError`.

---

## 🛠️ Architecture & Tech Stack

- **Core & State:** TypeScript, Zustand (reactive state store), localStorage repository.
- **UI & Layout:** Tailwind CSS, Lucide Icons, Hugeicons.
- **Graphics & Shaders:** WebGL2 (Balatro fluid canvas, MetallicPaint, 3D Reflective Cards).
- **Audio:** Web Audio API synth oscillators, harmonic chords, and noise generators.
- **PWA & Hardware:** `vite-plugin-pwa`, Workbox Service Worker, Screen Wake Lock API.

---

## 📄 License

MIT License. Free to play, learn, and fork.
