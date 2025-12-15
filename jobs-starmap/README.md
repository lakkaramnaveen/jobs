# Steve Jobs StarMap

A fast, interactive, single-page **3D constellation timeline** of Steve Jobs’ life—built with **React + TypeScript + Vite + react-three-fiber**.  
Each “pivot point” is a star. Click to warp the camera directly to that moment. Turn on **Movie Mode** to autoplay the story like a cinematic slideshow.

## Features

- **3D StarMap navigation**: click any star to instantly “warp” to it
- **Orbit controls**: zoom in/out, rotate around the selected star
- **Organic constellation**: smooth curve (not rigid lines) + subtle drift
- **Hover magic**: stars pulse, glow, ripple, and sparkle on hover
- **Movie Mode (bottom-right)**: Play/Pause slideshow + adjustable speed + “film reel” jump dots
- **Auto-pause on manual navigation**: dragging/zooming, clicking stars, HUD items, reel dots pauses Movie Mode
- **Performance-first**:
  - `dpr={1}` (predictable GPU cost)
  - reduced expensive effects
  - optional lazy/on-demand image loading

## Tech Stack

- React + TypeScript
- Vite
- three.js via `@react-three/fiber`
- `@react-three/drei` (OrbitControls, Sparkles, HTML labels)

## Local Development

```bash
npm install
npm run dev
```
