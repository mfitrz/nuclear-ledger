# NUCLEAR LEDGER

A terminal-style interface visualizing 72 years of nuclear detonations (1945-2017) as a classified operations dashboard.

**Live:** https://nuclear-ledger.vercel.app/

---

## Approach

The angle: nuclear testing as a military ledger. Each of the 101 events is a line entry, and the cumulative yield (~170,000 KT, equivalent to ~11,000 Hiroshima devices) is the headline figure that reframes what "testing" actually meant.

The terminal aesthetic creates deliberate friction. Most nuclear visualizations just plot a globe. This one treats the archive as evidence, then makes the user complicit: select a real historical test, choose a city, press DETONATE. See the physics-estimated casualty count. That discomfort is the point.

Two-section layout: a boot-sequence landing snaps into a split dashboard (globe left, blast map right). The globe plots all 101 detonations, colour-coded by country, marker size scaled to yield. The blast map lets you drop any selected weapon on a real city and see animated damage rings plus an impact breakdown (deaths, injuries, fallout area, economic damage).

---

## Stack

- React 18 + Vite 5
- GSAP - boot sequence typewriter, globe rotation, blast ring expansion, detonation screen auto-scroll
- Framer Motion - React state transitions (panels, overlays, buttons)
- react-simple-maps - SVG orthographic globe
- Leaflet + react-leaflet - real map tiles for blast radius visualization
- Tailwind CSS

GSAP and Framer Motion coexist intentionally: GSAP owns imperative timeline work, Framer Motion owns React state transitions. Using one for both would mean fighting each library's model half the time.

---

## Running Locally

```bash
cd nuclear-viz
npm install
npm run dev
```

Opens at `http://localhost:5173`. Build: `npm run build` (output to `dist/`).

---

## Design Trade-offs

**Blocked manual scroll.** The app intercepts wheel and touchmove at the container level so section navigation only happens via buttons. Unconventional, but necessary: the globe captures scroll for zooming, and letting it also trigger section snapping would eject users from the dashboard mid-zoom.

**Full-viewport detonation overlay.** The flash and fireball sequence takes over the entire screen rather than playing inside the blast panel. Globe context is lost, but the cinematic scale is the point.

**SVG globe over WebGL.** react-simple-maps renders in SVG, giving React-native click handlers and cluster pickers with no custom hit-testing. Performance ceiling is lower, but 101 markers never gets close to it.

---

## What I Cut

- Timeline scrubber / year filter would show the Cold War arms race accelerating then slowing down, which is the story the data is really telling
- Nukemap-accurate blast radii (used simplified 1.84 * yield^(1/3) km model instead)
- Animated fallout drift particles on the globe
- Global fallout spread and environmental impact visualization

---

## AI Workflow

Design ideation and theming were explored using **Stitch AI** — it helped shape the terminal aesthetic, colour palette, and overall visual direction before implementation began.

Built with Claude Code. What worked: specifying exact hex values in prompts, describing GSAP animation patterns with explicit easing and duration values, and providing the blast radius formula directly. Globe rotation re-centering required a few iterations - early generations interrupted mid-animation rather than killing the prior tween. The cluster-picker scroll isolation was tricky to describe; I had to frame the exact event propagation problem rather than just the desired outcome.

What didn't work: asking the model to "make it feel more tense" produced generic changes. I had to translate intent into specific CSS (text-shadow intensity, animation duration, letter-spacing) and re-prompt with concrete values.

---

## Data

101 records from the provided dataset. Blast radii and casualty figures are approximations using the `1.84 * yield^(1/3)` km model.
