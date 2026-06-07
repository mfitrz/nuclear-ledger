# NUCLEAR LEDGER

A Fallout-inspired terminal interface visualizing 72 years of nuclear detonations (1945–2017) as a classified operations dashboard.

**Live:** [deployed URL here]

---

## Concept

The angle: nuclear testing as a **military ledger** — each event is a line entry, and the cumulative yield (≈170,000 KT, equivalent to ~11,000 Hiroshima devices) is the headline figure that reframes what "testing" actually meant.

The terminal aesthetic creates deliberate friction — this was serious, classified, consequential — and forces you to sit with the numbers rather than scroll past them. Most nuclear visualizations reach for a globe and call it done. This one treats the archive as evidence. The final interaction — selecting a real historical test, choosing a city, pressing DETONATE — makes the user complicit in imagining the consequence. That discomfort is the point.

---

## Running Locally

```bash
cd nuclear-viz
npm install
npm run dev
```

Open `http://localhost:5173`

**Build for production:**

```bash
npm run build
```

Output goes to `dist/` — serve with any static file host.

---

## Stack

- **React 18** + **Vite 5**
- **Tailwind CSS** — utility styling
- **GSAP** — all animations: typewriter boot sequence, globe rotation, blast ring expansion, detonation screen sequencing, counter animations
- **Framer Motion** — React state-driven enter/exit transitions (panels, cards, overlay buttons)
- **react-simple-maps** — SVG orthographic globe projection
- **Leaflet + react-leaflet** — real map tiles for the blast radius visualization
- World GeoJSON via `world-atlas` CDN (not bundled locally)

GSAP and Framer Motion coexist intentionally: GSAP owns imperative timeline work (rotation, radius expansion, the detonation sequence), Framer Motion owns React state transitions (panel appear/disappear). Using one for both would mean fighting each library's model half the time.

---

## Features

- **Boot sequence** — GSAP character-by-character typewriter landing page that scroll-snaps into the main dashboard
- **Globe (GLOBAL THREAT MAP)** — SVG orthographic globe with drag rotation, scroll/pinch zoom, and GSAP-animated re-centering on select; markers sized by yield (cube-root scale), colored by nation; overlapping test-site events clustered with a count badge and a picker drawer
- **Blast viz (IMPACT VISUALIZATION)** — Leaflet dark-tile map with GSAP-animated concentric blast zone circles (5 damage tiers: Fireball, Heavy Blast, Moderate Blast, Thermal Radiation, Light Blast); city target selector; interactive zoom
- **Detonation screen** — full-viewport cinematic overlay: white flash → fireball bloom → settle to black → staggered casualty/consequence readout with GSAP auto-scroll; auto-dismisses after 30 seconds
- **Info overlay** — per-event data panel on the globe (yield, type, site, fallout radius, crater radius, overpressure, atmospheric contamination class)
- **Impact card** — post-detonation summary panel on the blast map (immediate deaths, total casualties, structural damage estimate, blast area, fallout zone)
- **Responsive** — stacks vertically on mobile; abbreviated legends, touch-optimized picker, pinch-to-zoom on globe, mobile-specific blast zone legend

---

## Design Trade-offs

**Single-viewport locked dashboard over a scroll experience.** The main dashboard is a fixed-height split — globe left, blast map right — with no vertical scroll. The cost is less room for narrative or editorial text. The gain is that both visualizations stay spatially linked: clicking the globe immediately updates the map beside it, and neither panel ever scrolls out of view.

**Scroll-snap with blocked manual scroll.** The app intercepts `wheel` and `touchmove` events at the container level, so the user can only navigate sections via button. The cost is unconventional UX — first-time visitors may try to scroll and feel stuck. The gain is that the globe's own scroll-to-zoom works without fighting the page, and each section gets the full viewport cleanly.

**SVG globe over canvas or WebGL.** `react-simple-maps` renders via SVG. The cost is performance at high zoom with many markers. The gain is full React integration — per-marker click handlers, hover state, and the cluster picker work without custom hit-testing. For 101 events it's never a real bottleneck.

**Marker clustering at test sites.** Detonations within ~1° of each other are grouped into a single marker (Nevada Test Site alone would otherwise produce dozens of overlapping dots). The cost is one extra interaction step — clicking a cluster opens a picker instead of directly selecting. The gain is a readable globe.

**Leaflet for the blast map background.** Blast zones are Leaflet circle overlays animated by GSAP against real Carto dark tiles. The cost is bundle weight and non-trivial React/Leaflet bridging code. The gain is that users see actual streets and landmarks inside the blast radius — that geographic grounding makes the scale visceral in a way a blank canvas doesn't.

**Full-viewport detonation overlay.** The detonation sequence takes over the entire screen rather than animating within the blast panel. The cost is that the globe and dashboard disappear — spatial context is lost. The gain is full cinematic scale: the white flash and fireball use the whole viewport, which is the right trade for the tone.

**Hardcoded city targets with hand-tuned population density.** The 15 target cities each have a curated `density` and `gdp` value feeding the casualty model. The cost is a fixed, limited list with no free-text search. The gain is that the estimates are directionally grounded — a geocoded list without those values would produce meaningless numbers, and specific numbers are what makes the DETONATE flow land emotionally.

---

## What I Cut

- Interactive timeline / year filter (~2hr estimate)
- Nukemap-accurate blast radii (used simplified `1.84 * yield^0.333` km model instead)
- City name overlay on the impact viz
- Animated fallout drift particles on the globe
- Visualization of the impact of the fallout spread globally and the impact on people, wildlife, etc.

---

## AI Workflow Notes

Built with Claude Code. What worked well: specifying exact color hex values in prompts, describing GSAP animation patterns with explicit easing and duration values, and providing the blast radius formula directly. The globe rotation + re-centering on select required a few iterations to get GSAP `overwrite` behavior right — the model kept generating solutions that would interrupt mid-animation rather than killing the prior tween cleanly. The cluster-picker scroll isolation (blocking wheel events at the picker boundary without also blocking the globe's own scroll-to-zoom) was tricky to describe; I had to show the model the exact event propagation problem rather than just the desired outcome.

What didn't work: asking the model to "make it feel more tense" produced generic changes. I had to translate the intent into specific CSS (`text-shadow` intensity, animation duration, letter-spacing) and re-prompt with concrete values. Broad aesthetic direction doesn't land — mechanical specifics do.

---

## Data

`nuclear-detonations.json` — 101 records from the provided dataset. Declassified historical records. Blast radii and casualty figures are approximations using the `1.84 * yield^(1/3)` km model — not Nukemap-accurate, not intended for operational use.
