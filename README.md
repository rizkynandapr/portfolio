# Portfolio — Rizky Nanda Praditia

Personal site for an AI automation engineer, built as a single scroll-scrubbed
editorial stage in an ink-on-paper visual language.

The four project pipelines are not screenshots — each one is drawn as a live SVG
diagram that reveals itself node by node as you scroll, with a different
composition per project so the four never feel like the same effect repeated.

## Stack

React 19 · Vite 8 · GSAP ScrollTrigger (pinning and scrub) · Lenis (smooth
scroll) · self-hosted Newsreader / IBM Plex Sans / IBM Plex Mono

## Commands

```bash
npm install
npm run dev       # dev server
npm test          # vitest
npm run lint      # oxlint
npm run build     # production build
npm run preview   # serve the build
```

## How it is put together

```
src/
  data/projects.js     project content and per-project flow composition
  stage/               scroll host, pinned-chapter hook, motion preferences
  flow/                the scrubbed pipeline: diagram, chapter, mobile stepper
    layouts/           four pure functions mapping nodes to coordinates
  chapters/            opening, premise, compact, stack/experience, about, contact
  ui/                  navigation
```

`src/flow/layouts/` is where the four rhythms live. Each is a pure function
taking `(nodes, viewport)` and returning coordinates, so they are tested
without a DOM.

## Behaviour worth knowing

- **Below 768px** pinning is switched off entirely and each pipeline becomes a
  tap-through stepper. Pinning plus `100svh` misbehaves when iOS Safari's
  address bar collapses, and four live scrub timelines drain battery.
- **`prefers-reduced-motion: reduce`** drops pinning and renders every pipeline
  as a complete static diagram with all node text visible at once.
- Node text is always in the DOM regardless of scroll position — scroll changes
  a `data-state` attribute and CSS turns that into opacity, so screen readers
  reach every node.

## Design notes

The design spec and implementation plan live in `docs/superpowers/`.
