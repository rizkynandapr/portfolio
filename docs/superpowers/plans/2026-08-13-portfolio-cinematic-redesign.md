# Portfolio Cinematic Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the portfolio's presentation layer as a single scroll-scrubbed stage in an ink-on-paper visual language, with all four project pipelines animating node-by-node.

**Architecture:** One `Stage` orchestrator hosts eleven chapters. The four project flows share a single data-driven `FlowChapter` component whose visual rhythm comes from four pure layout functions (vertical / horizontal / branching / convergent) that map node arrays to coordinates. GSAP ScrollTrigger drives pinning and scrub on desktop; below 768px pinning is dropped entirely and flows become tap-through steppers. Base CSS renders everything visible — JS only *adds* dimming, so the site degrades to a complete editorial document without JavaScript.

**Tech Stack:** React 19, Vite 8, GSAP ScrollTrigger, Lenis, Framer Motion 13 (discrete elements only), Vitest + Testing Library, @fontsource self-hosted fonts.

**Spec:** `docs/superpowers/specs/2026-08-13-portfolio-redesign-design.md`

## Global Constraints

- Colour tokens are exact: `--paper: #f2f1ed`, `--ink: #1d1c19`, `--press: #0b0a09`, `--rule: rgba(29,28,25,.14)`, `--flag: #8a4b2a`, `--ease: cubic-bezier(.22,1,.36,1)`.
- `--flag` appears in exactly two places: the active node marker, and the Citation Validator node (index 6) of LegalitasAI. Nowhere else.
- Fonts: Newsreader (display), IBM Plex Sans (body), IBM Plex Mono (mono). Self-hosted via `@fontsource`. No Google Fonts CDN requests.
- `color-scheme: light only`. No dark mode. The Contact chapter is the only `--press` surface.
- Base CSS state shows all content. JavaScript only adds dimming and scrub. The site must be fully readable with JS disabled.
- `prefers-reduced-motion: reduce` drops pinning entirely and renders every flow as a complete static diagram with all node text visible.
- Never animate a property that triggers layout (width, height, top, left, margin, padding). `transform`, `opacity`, and cheap paint properties (`fill`, `stroke`, `color`) are all permitted.
- Mobile breakpoint is `768px`. Below it, no pinning and no scrub.
- `three` must not appear in the production bundle.
- Copy is never rewritten. Move it verbatim.

## Deliberate deviations from the spec

Three things in the spec are intentionally not built as written. Flagged here so a reviewer can reject the reasoning rather than discover the gap:

1. **`src/ui/Chip.jsx` and `src/ui/Rule.jsx` are not created.** Spec §8.1 lists them. A chip is one `<li className="flow-chip mono">` and a rule is one `<hr className="rule-h">`; wrapping each in a component adds indirection without removing duplication. The classes live in `index.css` and `FlowChapter.css` instead. Build them later if a third caller appears.

2. **`framer-motion` is installed but unused by this plan.** Spec §8.4 assigns it discrete elements — cards, menus, enter/exit transitions. None of the eleven chapters needs one: the nav has no dropdown, the stepper's state change is a CSS opacity transition, and the flows are ScrollTrigger-driven. Leaving the dependency in place unused is honest; inventing a use for it is not. Remove it in a follow-up if nothing claims it.

3. **Chapter timelines are not lazily mounted.** Spec §8.5 asks that only the active chapter ± 1 hold a live ScrollTrigger. There are four triggers total; ScrollTrigger already skips work for off-screen triggers, so mount/unmount juggling would add a class of bugs (stale pin spacing, refresh races) to save a cost that has not been measured. If Task 11's manual scroll shows jank, revisit with a profile in hand.

---

### Task 1: Foundation — tokens, self-hosted fonts, grid

**Files:**
- Modify: `package.json`
- Modify: `index.html:9-11`
- Rewrite: `src/index.css`
- Create: `src/styles/fonts.js`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS custom properties `--paper`, `--ink`, `--press`, `--rule`, `--flag`, `--ease`, `--v1`, `--v2`, `--colA`, `--colB`, and font stacks `--font-display`, `--font-body`, `--font-mono`. Every later task uses these names.

- [ ] **Step 1: Install self-hosted fonts**

```bash
npm install @fontsource-variable/newsreader @fontsource/ibm-plex-sans @fontsource/ibm-plex-mono
```

- [ ] **Step 2: Create the font entry module**

Create `src/styles/fonts.js`:

```js
// Self-hosted font faces. Imported once from main.jsx so no CDN request is made.
import '@fontsource-variable/newsreader';
import '@fontsource/ibm-plex-sans/400.css';
import '@fontsource/ibm-plex-sans/500.css';
import '@fontsource/ibm-plex-mono/400.css';
import '@fontsource/ibm-plex-mono/500.css';
```

- [ ] **Step 3: Import fonts from main.jsx**

Add this as the first import line of `src/main.jsx`:

```js
import './styles/fonts.js';
```

- [ ] **Step 4: Remove the Google Fonts CDN links**

In `index.html`, delete lines 9–11 (the two `<link rel="preconnect">` tags and the `<link href="https://fonts.googleapis.com/...">` tag). Leave the rest of `<head>` untouched.

- [ ] **Step 5: Rewrite the token stylesheet**

Replace the entire contents of `src/index.css`:

```css
:root {
  color-scheme: light only;

  --paper: #f2f1ed;
  --ink:   #1d1c19;
  --press: #0b0a09;
  --rule:  rgba(29, 28, 25, .14);
  --flag:  #8a4b2a;

  --ease:  cubic-bezier(.22, 1, .36, 1);

  --font-display: 'Newsreader Variable', Newsreader, Georgia, serif;
  --font-body:    'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
  --font-mono:    'IBM Plex Mono', ui-monospace, SFMono-Regular, Menlo, monospace;

  /* Editorial grid — percentages, matching the reference's structure. */
  --v1: 4.75%;
  --v2: 95.25%;
  --colA: 8%;
  --colB: 24%;

  --dim: .18;
}

* { box-sizing: border-box; }

html { scroll-behavior: auto; }

/* Lenis drives smooth scrolling in JS; native smooth would conflict. */
html.lenis, html.lenis body { height: auto; }
.lenis.lenis-smooth { scroll-behavior: auto !important; }
.lenis.lenis-smooth [data-lenis-prevent] { overscroll-behavior: contain; }
.lenis.lenis-stopped { overflow: hidden; }

body {
  margin: 0;
  background: var(--paper);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.65;
  -webkit-font-smoothing: antialiased;
}

#root { position: relative; overflow-x: hidden; }

h1, h2, h3 {
  font-family: var(--font-display);
  font-weight: 400;
  letter-spacing: -.01em;
  line-height: 1.08;
  margin: 0;
}

p { margin: 0; }
a { color: inherit; text-decoration: none; }

.mono {
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}

.rule-h { height: 1px; background: var(--rule); border: 0; margin: 0; }
.rule-v { width: 1px; background: var(--rule); }

/* Base state: everything visible. JS adds dimming on top of this. */
[data-node], [data-pane] { opacity: 1; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
  }
  [data-node], [data-pane] { opacity: 1 !important; }
}
```

- [ ] **Step 6: Verify the build is clean and no CDN font request remains**

Run: `npm run build`
Expected: build succeeds, no errors.

Run: `grep -r "fonts.googleapis" index.html src/ ; echo "exit=$?"`
Expected: `exit=1` (no matches).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json index.html src/index.css src/styles/fonts.js src/main.jsx
git commit -m "feat: ink-on-paper design tokens and self-hosted fonts"
```

---

### Task 2: Vitest setup and the four layout functions

**Files:**
- Modify: `package.json`
- Modify: `vite.config.js`
- Create: `src/test/setup.js`
- Create: `src/flow/layouts/constants.js`
- Create: `src/flow/layouts/vertical.js`
- Create: `src/flow/layouts/horizontal.js`
- Create: `src/flow/layouts/branching.js`
- Create: `src/flow/layouts/convergent.js`
- Create: `src/flow/layouts/index.js`
- Test: `src/flow/layouts/layouts.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `layout(nodes, viewport) -> Positioned[]` — every layout function shares this signature.
    - `nodes`: `Array<{ label: string, detail: string }>`
    - `viewport`: `{ width: number, height: number }`
    - `Positioned`: `{ label, detail, x: number, y: number, edge: 'straight' | 'fork' | 'merge' | null }`
  - `LAYOUTS` — a record mapping composition name to layout function, exported from `src/flow/layouts/index.js`. Keys: `'vertical'`, `'horizontal'`, `'branching'`, `'convergent'`.

- [ ] **Step 1: Install the test toolchain**

```bash
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Add test scripts**

In `package.json`, add to the `"scripts"` object:

```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Configure Vitest**

Replace `vite.config.js`:

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
  },
})
```

- [ ] **Step 4: Create the test setup file**

Create `src/test/setup.js`:

```js
import '@testing-library/jest-dom/vitest';

// jsdom has no matchMedia. Default to "motion allowed"; individual tests override.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
```

- [ ] **Step 5: Write the failing test for all four layouts**

Create `src/flow/layouts/layouts.test.js`:

```js
import { describe, it, expect } from 'vitest';
import { LAYOUTS } from './index.js';

const VIEWPORT = { width: 1200, height: 800 };

function makeNodes(n) {
  return Array.from({ length: n }, (_, i) => ({
    label: `Node ${i}`,
    detail: `Detail for node ${i}`,
  }));
}

describe.each(Object.entries(LAYOUTS))('layout: %s', (name, layout) => {
  it('returns one position per node', () => {
    const nodes = makeNodes(8);
    expect(layout(nodes, VIEWPORT)).toHaveLength(8);
  });

  it('preserves label and detail', () => {
    const out = layout(makeNodes(5), VIEWPORT);
    expect(out[0].label).toBe('Node 0');
    expect(out[0].detail).toBe('Detail for node 0');
  });

  it('never places two nodes at the same coordinate', () => {
    const out = layout(makeNodes(9), VIEWPORT);
    const seen = new Set(out.map((p) => `${Math.round(p.x)},${Math.round(p.y)}`));
    expect(seen.size).toBe(out.length);
  });

  it('keeps every node inside the viewport', () => {
    const out = layout(makeNodes(9), VIEWPORT);
    for (const p of out) {
      expect(p.x).toBeGreaterThanOrEqual(0);
      expect(p.x).toBeLessThanOrEqual(VIEWPORT.width);
      expect(p.y).toBeGreaterThanOrEqual(0);
      expect(p.y).toBeLessThanOrEqual(VIEWPORT.height);
    }
  });

  it('gives the first node no incoming edge', () => {
    const out = layout(makeNodes(6), VIEWPORT);
    expect(out[0].edge).toBeNull();
  });

  it('handles a single node without dividing by zero', () => {
    const out = layout(makeNodes(1), VIEWPORT);
    expect(out).toHaveLength(1);
    expect(Number.isFinite(out[0].x)).toBe(true);
    expect(Number.isFinite(out[0].y)).toBe(true);
  });
});
```

- [ ] **Step 6: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Failed to resolve import "./index.js"`.

- [ ] **Step 7: Write the layout constants**

Create `src/flow/layouts/constants.js`:

```js
// Vertical/horizontal breathing room reserved at both ends of the diagram.
export const PAD = 40;
```

- [ ] **Step 8: Write the vertical layout**

Create `src/flow/layouts/vertical.js`:

```js
import { PAD } from './constants.js';

// LegalitasAI — a straight drop, one column. The plainest rhythm.
export default function vertical(nodes, viewport) {
  const span = viewport.height - PAD * 2;
  const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;
  return nodes.map((n, i) => ({
    ...n,
    x: viewport.width / 2,
    y: PAD + i * step,
    edge: i === 0 ? null : 'straight',
  }));
}
```

- [ ] **Step 9: Write the horizontal layout**

Create `src/flow/layouts/horizontal.js`:

```js
import { PAD } from './constants.js';

// WhatsApp Chatbot — one message travelling left to right across the stage.
export default function horizontal(nodes, viewport) {
  const span = viewport.width - PAD * 2;
  const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;
  return nodes.map((n, i) => ({
    ...n,
    x: PAD + i * step,
    y: viewport.height / 2,
    edge: i === 0 ? null : 'straight',
  }));
}
```

- [ ] **Step 10: Write the branching layout**

Create `src/flow/layouts/branching.js`:

```js
import { PAD } from './constants.js';

// ApplyIQ — the flow splits into genuine parallel work, then rejoins.
// First and last nodes sit alone on the spine; middle nodes pair into rows,
// two abreast, so a row's two nodes share a y and read as concurrent.
export default function branching(nodes, viewport) {
  const last = nodes.length - 1;
  const cx = viewport.width / 2;
  const spread = viewport.width / 5;
  const span = viewport.height - PAD * 2;

  // Fewer than three nodes leaves nothing to run in parallel.
  if (nodes.length <= 2) {
    const step = nodes.length > 1 ? span : 0;
    return nodes.map((n, i) => ({
      ...n,
      x: cx,
      y: PAD + i * step,
      edge: i === 0 ? null : 'straight',
    }));
  }

  const rows = Math.ceil((nodes.length - 2) / 2);
  const step = span / (rows + 1);

  return nodes.map((n, i) => {
    if (i === 0) return { ...n, x: cx, y: PAD, edge: null };
    if (i === last) return { ...n, x: cx, y: PAD + span, edge: 'merge' };

    const m = i - 1;
    return {
      ...n,
      x: cx + (m % 2 === 0 ? -spread : spread),
      y: PAD + (Math.floor(m / 2) + 1) * step,
      edge: m === 0 ? 'fork' : 'straight',
    };
  });
}
```

- [ ] **Step 11: Write the convergent layout**

Create `src/flow/layouts/convergent.js`:

```js
// TalentScout — two inputs on the left meet, then run as one chain to the right.
// Nodes 0 and 1 are the inputs; everything after is the chain.
export default function convergent(nodes, viewport) {
  const inputX = viewport.width * 0.18;
  const chainStart = viewport.width * 0.32;
  const chainSpan = viewport.width * 0.48;
  const chainCount = Math.max(nodes.length - 2, 1);
  const step = chainCount > 1 ? chainSpan / (chainCount - 1) : 0;
  const midY = viewport.height / 2;

  return nodes.map((n, i) => {
    if (i < 2) {
      return {
        ...n,
        x: inputX,
        y: viewport.height * (i === 0 ? 0.33 : 0.67),
        edge: null,
      };
    }
    const k = i - 2;
    return {
      ...n,
      x: chainStart + k * step,
      y: midY,
      edge: k === 0 ? 'merge' : 'straight',
    };
  });
}
```

- [ ] **Step 12: Write the layout registry**

Create `src/flow/layouts/index.js`:

```js
import vertical from './vertical.js';
import horizontal from './horizontal.js';
import branching from './branching.js';
import convergent from './convergent.js';

export const LAYOUTS = { vertical, horizontal, branching, convergent };
export const COMPOSITIONS = Object.keys(LAYOUTS);
```

- [ ] **Step 13: Run the tests to verify they pass**

Run: `npm test`
Expected: PASS — 24 tests (6 per layout × 4 layouts).

Note: `convergent` with a single node returns one input position, so the "first node has no incoming edge" and "single node" cases hold. If the duplicate-coordinate test fails for `convergent` at 9 nodes, the chain step is collapsing — check that `chainCount` uses `nodes.length - 2`.

- [ ] **Step 14: Commit**

```bash
git add package.json package-lock.json vite.config.js src/test src/flow
git commit -m "feat: add four pure flow layout functions with vitest"
```

---

### Task 3: Extract project data

**Files:**
- Create: `src/data/projects.js`
- Test: `src/data/projects.test.js`
- Read (do not modify yet): `src/components/Projects.jsx`

**Interfaces:**
- Consumes: `COMPOSITIONS` from `src/flow/layouts/index.js`.
- Produces: default export `PROJECTS` — an array of:
  ```
  {
    id: string,            // '01'..'05'
    name: string,
    tag: string,
    period: string,
    problem: string,
    build: string,
    stack: string[],
    links: { code?: string, demo?: string },
    flow?: Array<{ label: string, detail: string }>,
    flowLabel?: string,
    composition?: 'vertical' | 'horizontal' | 'branching' | 'convergent',
    flagIndex?: number,    // index of the node that gets --flag; only LegalitasAI has one
  }
  ```

- [ ] **Step 1: Write the failing data-integrity test**

Create `src/data/projects.test.js`:

```js
import { describe, it, expect } from 'vitest';
import PROJECTS from './projects.js';
import { COMPOSITIONS } from '../flow/layouts/index.js';

describe('PROJECTS', () => {
  it('has five projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(5);
  });

  it('gives every flow project a valid composition', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      expect(COMPOSITIONS).toContain(p.composition);
      expect(p.flowLabel).toBeTruthy();
    }
  });

  it('assigns each of the four compositions exactly once', () => {
    const used = PROJECTS.filter((p) => p.flow).map((p) => p.composition);
    expect(used.sort()).toEqual([...COMPOSITIONS].sort());
  });

  it('gives every node a label and a detail', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      for (const n of p.flow) {
        expect(n.label).toBeTruthy();
        expect(n.detail).toBeTruthy();
      }
    }
  });

  it('points flagIndex at LegalitasAI Citation Validator and nowhere else', () => {
    const flagged = PROJECTS.filter((p) => p.flagIndex !== undefined);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].name).toBe('LegalitasAI');
    expect(flagged[0].flow[flagged[0].flagIndex].label).toBe('Citation Validator');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/data`
Expected: FAIL — `Failed to resolve import "./projects.js"`.

- [ ] **Step 3: Create the data module**

Create `src/data/projects.js`. Copy the four flow arrays (`LEGALITASAI_FLOW`, `WA_CHATBOT_FLOW`, `APPLYIQ_FLOW`, `TALENTSCOUT_FLOW`) and the `PROJECTS` array **verbatim** from `src/components/Projects.jsx:6-110` — every string stays exactly as written, including the em dashes and the numbers.

Then make exactly these three additions to the `PROJECTS` entries, changing nothing else:

```js
// LegalitasAI (id '01')
composition: 'vertical',
flagIndex: 6,          // Citation Validator — the only --flag node on the site

// WhatsApp AI Chatbot (id '02')
composition: 'horizontal',

// ApplyIQ (id '03')
composition: 'branching',

// TalentScout (id '04')
composition: 'convergent',
```

Clickbait Detector (id `'05'`) gets no `composition` — it has no `flow`.

End the file with:

```js
export default PROJECTS;
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test src/data`
Expected: PASS — 5 tests.

If the `flagIndex` test fails, count the LegalitasAI flow again: `PDF Peraturan`(0), `Clean & Parse`(1), `Chunk per-Pasal`(2), `Hybrid Retrieval`(3), `Router (Haiku)`(4), `Generate (Sonnet)`(5), `Citation Validator`(6), `Answer + Sources`(7).

- [ ] **Step 5: Commit**

```bash
git add src/data
git commit -m "feat: extract project data with flow compositions"
```

---

### Task 4: FlowDiagram — the SVG ink renderer

**Files:**
- Create: `src/flow/FlowDiagram.jsx`
- Create: `src/flow/FlowDiagram.css`
- Test: `src/flow/FlowDiagram.test.jsx`

**Interfaces:**
- Consumes: `Positioned[]` from Task 2 layouts.
- Produces: `<FlowDiagram positions activeIndex flagIndex viewport />`
  - `positions`: `Positioned[]`
  - `activeIndex`: `number` — which node is at full opacity
  - `flagIndex`: `number | undefined` — node rendered in `--flag`
  - `viewport`: `{ width, height }` — used for the SVG viewBox
  - Each node element carries `data-node="<index>"` and `data-state` of `'active' | 'flag' | 'dim'`.
  - Each edge path carries `data-edge="<index>"` and `data-broken="true"` when it leaves the flag node.

- [ ] **Step 1: Write the failing test**

Create `src/flow/FlowDiagram.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlowDiagram from './FlowDiagram.jsx';
import vertical from './layouts/vertical.js';

const VIEWPORT = { width: 600, height: 800 };
const NODES = [
  { label: 'PDF Peraturan', detail: 'a' },
  { label: 'Clean & Parse', detail: 'b' },
  { label: 'Citation Validator', detail: 'c' },
  { label: 'Answer + Sources', detail: 'd' },
];

function setup(props = {}) {
  const positions = vertical(NODES, VIEWPORT);
  return render(
    <FlowDiagram positions={positions} activeIndex={0} viewport={VIEWPORT} {...props} />
  );
}

describe('FlowDiagram', () => {
  it('renders every node label as text', () => {
    setup();
    for (const n of NODES) {
      expect(screen.getByText(n.label)).toBeInTheDocument();
    }
  });

  it('marks the active node', () => {
    const { container } = setup({ activeIndex: 1 });
    expect(container.querySelector('[data-node="1"]')).toHaveAttribute('data-state', 'active');
    expect(container.querySelector('[data-node="0"]')).toHaveAttribute('data-state', 'dim');
  });

  it('marks the flag node when it is the active one', () => {
    const { container } = setup({ activeIndex: 2, flagIndex: 2 });
    expect(container.querySelector('[data-node="2"]')).toHaveAttribute('data-state', 'flag');
  });

  it('leaves the flag node with a broken outgoing edge', () => {
    const { container } = setup({ activeIndex: 2, flagIndex: 2 });
    expect(container.querySelector('[data-edge="3"]')).toHaveAttribute('data-broken', 'true');
  });

  it('draws one fewer edge than there are nodes', () => {
    const { container } = setup();
    expect(container.querySelectorAll('[data-edge]')).toHaveLength(NODES.length - 1);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/flow/FlowDiagram`
Expected: FAIL — `Failed to resolve import "./FlowDiagram.jsx"`.

- [ ] **Step 3: Write the component**

Create `src/flow/FlowDiagram.jsx`:

```jsx
import './FlowDiagram.css';

// Renders positioned nodes as ink line-work: a hairline SVG spine with
// open circles, plus a mono label per node. No glow, no fill — the active
// node is marked by filling its circle, nothing else.
export default function FlowDiagram({ positions, activeIndex, flagIndex, viewport }) {
  return (
    <div className="flow-diagram">
      <svg
        className="flow-svg"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {positions.map((p, i) => {
          if (i === 0) return null;
          const prev = positions[i - 1];
          const broken = flagIndex !== undefined && i - 1 === flagIndex;
          return (
            <path
              key={`e${i}`}
              data-edge={i}
              data-broken={broken ? 'true' : undefined}
              className={`flow-edge flow-edge-${p.edge ?? 'straight'}`}
              d={edgePath(prev, p)}
            />
          );
        })}

        {positions.map((p, i) => (
          <circle
            key={`c${i}`}
            className="flow-dot"
            cx={p.x}
            cy={p.y}
            r="5"
            data-dot={i}
            data-state={stateOf(i, activeIndex, flagIndex)}
          />
        ))}
      </svg>

      <ul className="flow-labels">
        {positions.map((p, i) => (
          <li
            key={p.label}
            data-node={i}
            data-state={stateOf(i, activeIndex, flagIndex)}
            className="flow-label mono"
            style={{ '--nx': `${(p.x / viewport.width) * 100}%`, '--ny': `${(p.y / viewport.height) * 100}%` }}
          >
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function stateOf(i, activeIndex, flagIndex) {
  if (i !== activeIndex) return 'dim';
  return i === flagIndex ? 'flag' : 'active';
}

// A right-angle elbow for forks and merges, a straight line otherwise.
function edgePath(a, b) {
  if (Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}
```

- [ ] **Step 4: Write the stylesheet**

Create `src/flow/FlowDiagram.css`:

```css
.flow-diagram { position: relative; width: 100%; height: 100%; }

.flow-svg { position: absolute; inset: 0; width: 100%; height: 100%; }

.flow-edge {
  fill: none;
  stroke: var(--ink);
  stroke-width: 1;
  opacity: .32;
  vector-effect: non-scaling-stroke;
}

/* The Citation Validator's outgoing edge never closes — the system refuses. */
.flow-edge[data-broken='true'] {
  stroke: var(--flag);
  stroke-dasharray: 3 7;
  opacity: .85;
}

.flow-dot {
  fill: var(--paper);
  stroke: var(--ink);
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
  transition: fill .3s var(--ease), stroke .3s var(--ease);
}
.flow-dot[data-state='active'] { fill: var(--ink); }
.flow-dot[data-state='flag']   { fill: var(--flag); stroke: var(--flag); }

.flow-labels { list-style: none; margin: 0; padding: 0; position: absolute; inset: 0; }

.flow-label {
  position: absolute;
  left: var(--nx);
  top: var(--ny);
  transform: translate(14px, -50%);
  white-space: nowrap;
  transition: opacity .45s var(--ease), color .3s var(--ease);
}
.flow-label[data-state='dim']    { opacity: var(--dim); }
.flow-label[data-state='active'] { opacity: 1; font-weight: 500; }
.flow-label[data-state='flag']   { opacity: 1; font-weight: 500; color: var(--flag); }

@media (prefers-reduced-motion: reduce) {
  .flow-label[data-state='dim'] { opacity: 1; }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test src/flow/FlowDiagram`
Expected: PASS — 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/flow/FlowDiagram.jsx src/flow/FlowDiagram.css src/flow/FlowDiagram.test.jsx
git commit -m "feat: add SVG ink flow diagram renderer"
```

---

### Task 5: Scroll plumbing — useReducedMotion, useChapter, Stage

**Files:**
- Create: `src/stage/useReducedMotion.js`
- Create: `src/stage/useChapter.js`
- Create: `src/stage/Stage.jsx`
- Create: `src/stage/Stage.css`
- Test: `src/stage/useReducedMotion.test.jsx`

**Interfaces:**
- Consumes: nothing from earlier tasks.
- Produces:
  - `useReducedMotion() -> boolean` — live, updates on media-query change.
  - `useChapter({ ref, steps, enabled }) -> number` — returns the active step index `0..steps-1`. Registers a pinned ScrollTrigger with `scrub: true` on `ref`, allocating `steps + 1` viewports: one lead-in screen where the chapter title holds before node 0 advances (spec §5.1), then one screen per node. Returns `0` and registers nothing when `enabled` is false.
  - `<Stage>{children}</Stage>` — the scroll host. Children are chapters.

- [ ] **Step 1: Write the failing test**

Create `src/stage/useReducedMotion.test.jsx`:

```jsx
import { describe, it, expect, vi, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import useReducedMotion from './useReducedMotion.js';

function mockMatchMedia(matches) {
  window.matchMedia = vi.fn().mockImplementation((query) => ({
    matches,
    media: query,
    onchange: null,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));
}

afterEach(() => { vi.restoreAllMocks(); });

describe('useReducedMotion', () => {
  it('returns false when motion is allowed', () => {
    mockMatchMedia(false);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(false);
  });

  it('returns true when the user asked for reduced motion', () => {
    mockMatchMedia(true);
    const { result } = renderHook(() => useReducedMotion());
    expect(result.current).toBe(true);
  });

  it('subscribes to media query changes', () => {
    mockMatchMedia(false);
    const { unmount } = renderHook(() => useReducedMotion());
    const mql = window.matchMedia.mock.results[0].value;
    expect(mql.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    unmount();
    expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/stage`
Expected: FAIL — `Failed to resolve import "./useReducedMotion.js"`.

- [ ] **Step 3: Write useReducedMotion**

Create `src/stage/useReducedMotion.js`:

```js
import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// Live preference — a user can flip this mid-session and the site must follow.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test src/stage`
Expected: PASS — 3 tests.

- [ ] **Step 5: Write useChapter**

Create `src/stage/useChapter.js`:

```js
import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Pins a chapter and reports which step the scroll position lands on.
// Scroll is divided into steps + 1 slots: slot 0 is the lead-in screen where
// the chapter title holds, then one slot per node. Returns 0 and registers
// nothing when disabled (mobile, or prefers-reduced-motion) — the caller
// renders statically.
export default function useChapter({ ref, steps, enabled }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!enabled || !ref.current || steps < 1) return;

    const slots = steps + 1;

    const trigger = ScrollTrigger.create({
      trigger: ref.current,
      start: 'top top',
      end: `+=${slots * window.innerHeight}`,
      pin: true,
      pinSpacing: true,
      scrub: true,
      onUpdate: (self) => {
        const slot = Math.min(slots - 1, Math.floor(self.progress * slots));
        setActive(Math.max(0, slot - 1)); // slot 0 is the lead-in; node 0 holds
      },
    });

    return () => trigger.kill();
  }, [ref, steps, enabled]);

  return active;
}
```

- [ ] **Step 6: Write the Stage host and its stylesheet**

Create `src/stage/Stage.jsx`:

```jsx
import './Stage.css';

// The single scroll host. Every chapter is a child; chapters that pin do so
// against this element's scroll, which is why there is no inner scroller.
export default function Stage({ children }) {
  return (
    <main id="top" className="stage">
      {children}
    </main>
  );
}
```

Create `src/stage/Stage.css`:

```css
.stage {
  position: relative;
  background: var(--paper);
}

.chapter {
  position: relative;
  min-height: 100svh;
  padding: 0 var(--v1);
  display: grid;
  align-content: center;
  border-top: 1px solid var(--rule);
}

.chapter-mark {
  position: absolute;
  top: 90px;
  left: var(--v1);
  display: flex;
  align-items: center;
  gap: 12px;
  opacity: .55;
}
.chapter-mark::before {
  content: '';
  width: 26px;
  height: 1px;
  background: var(--ink);
}

.chapter-dark {
  background: var(--press);
  color: var(--paper);
  --rule: rgba(242, 241, 237, .16);
}
```

- [ ] **Step 7: Verify nothing regressed**

Run: `npm test`
Expected: PASS — all tests from Tasks 2–5 (32 total).

- [ ] **Step 8: Commit**

```bash
git add src/stage
git commit -m "feat: add stage host, chapter scroll hook, reduced-motion hook"
```

---

### Task 6: FlowChapter — the scrubbed desktop chapter

**Files:**
- Create: `src/flow/FlowChapter.jsx`
- Create: `src/flow/FlowChapter.css`
- Test: `src/flow/FlowChapter.test.jsx`

**Interfaces:**
- Consumes: `LAYOUTS` (Task 2), `FlowDiagram` (Task 4), `useChapter` + `useReducedMotion` (Task 5), a project object (Task 3).
- Produces: `<FlowChapter project={project} />` — renders the pinned two-column stage: diagram left, copy right. Every node's `label` and `detail` is present in the DOM at all times; only opacity changes.

- [ ] **Step 1: Write the failing test**

Create `src/flow/FlowChapter.test.jsx`:

```jsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlowChapter from './FlowChapter.jsx';

vi.mock('../stage/useChapter.js', () => ({ default: () => 0 }));

const PROJECT = {
  id: '01',
  name: 'LegalitasAI',
  tag: 'RAG with a Citation Guardrail',
  period: '2026 · Open source',
  composition: 'vertical',
  flowLabel: 'One question, end to end',
  flagIndex: 1,
  links: { code: 'https://github.com/rizkynandapr/legalitasai' },
  stack: ['Python', 'Qdrant'],
  flow: [
    { label: 'PDF Peraturan', detail: 'Regulations come as scanned PDFs.' },
    { label: 'Citation Validator', detail: 'Every citation gets checked.' },
    { label: 'Answer + Sources', detail: 'What ships is the answer.' },
  ],
};

beforeEach(() => {
  window.matchMedia = (q) => ({
    matches: false, media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  });
});

describe('FlowChapter', () => {
  it('renders the project name and flow label', () => {
    render(<FlowChapter project={PROJECT} />);
    expect(screen.getByRole('heading', { name: 'LegalitasAI' })).toBeInTheDocument();
    expect(screen.getByText('One question, end to end')).toBeInTheDocument();
  });

  // The accessibility contract: nothing is inserted by scroll. It is all here
  // from the first paint, so screen readers and no-JS visitors get everything.
  it('renders every node detail in the DOM regardless of scroll position', () => {
    render(<FlowChapter project={PROJECT} />);
    for (const n of PROJECT.flow) {
      expect(screen.getByText(n.detail)).toBeInTheDocument();
    }
  });

  it('renders every stack chip', () => {
    render(<FlowChapter project={PROJECT} />);
    for (const s of PROJECT.stack) {
      expect(screen.getByText(s)).toBeInTheDocument();
    }
  });

  it('marks only the active pane', () => {
    const { container } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelector('[data-pane="0"]')).toHaveAttribute('data-state', 'active');
    expect(container.querySelector('[data-pane="1"]')).toHaveAttribute('data-state', 'dim');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/flow/FlowChapter`
Expected: FAIL — `Failed to resolve import "./FlowChapter.jsx"`.

- [ ] **Step 3: Write the component**

Create `src/flow/FlowChapter.jsx`:

```jsx
import { useRef } from 'react';
import { LAYOUTS } from './layouts/index.js';
import FlowDiagram from './FlowDiagram.jsx';
import useChapter from '../stage/useChapter.js';
import useReducedMotion from '../stage/useReducedMotion.js';
import './FlowChapter.css';

const VIEWPORT = { width: 520, height: 760 };

export default function FlowChapter({ project }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const steps = project.flow.length;
  const active = useChapter({ ref, steps, enabled: !reduced });

  const layout = LAYOUTS[project.composition];
  const positions = layout(project.flow, VIEWPORT);

  return (
    <section
      ref={ref}
      id={`work-${project.id}`}
      className={`chapter flow-chapter ${reduced ? 'is-static' : ''}`}
    >
      <p className="chapter-mark mono">Work {project.id}</p>

      <div className="flow-chapter-grid">
        <div className="flow-chapter-diagram">
          <FlowDiagram
            positions={positions}
            activeIndex={active}
            flagIndex={project.flagIndex}
            viewport={VIEWPORT}
          />
        </div>

        <div className="flow-chapter-copy">
          <header className="flow-chapter-head">
            <h2>{project.name}</h2>
            <p className="flow-chapter-tag">{project.tag}</p>
            <p className="flow-chapter-period mono">{project.period}</p>
            <p className="flow-chapter-flowlabel mono">{project.flowLabel}</p>
          </header>

          <ol className="flow-panes">
            {project.flow.map((n, i) => (
              <li
                key={n.label}
                data-pane={i}
                data-state={paneState(i, active, project.flagIndex)}
                className="flow-pane"
              >
                <p className="flow-pane-counter mono">
                  Node {String(i + 1).padStart(2, '0')} / {String(steps).padStart(2, '0')}
                </p>
                <h3 className="flow-pane-title">{n.label}</h3>
                <p className="flow-pane-detail">{n.detail}</p>
              </li>
            ))}
          </ol>

          <ul className="flow-chapter-stack">
            {project.stack.map((s) => (
              <li key={s} className="flow-chip mono">{s}</li>
            ))}
          </ul>

          <p className="flow-chapter-links">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="mono">Live demo ↗</a>
            )}
            {project.links.code && (
              <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="mono">Code ↗</a>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function paneState(i, active, flagIndex) {
  if (i !== active) return 'dim';
  return i === flagIndex ? 'flag' : 'active';
}
```

- [ ] **Step 4: Write the stylesheet**

Create `src/flow/FlowChapter.css`:

```css
.flow-chapter-grid {
  display: grid;
  grid-template-columns: var(--colB) 1fr;
  gap: 0;
  min-height: 76svh;
}

.flow-chapter-diagram {
  position: relative;
  border-right: 1px solid var(--rule);
  padding-right: 28px;
}

.flow-chapter-copy {
  padding: 0 0 0 44px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  max-width: 62ch;
}

.flow-chapter-head h2 { font-size: clamp(34px, 4vw, 54px); }
.flow-chapter-tag { font-size: 15px; opacity: .7; margin-top: 6px; }
.flow-chapter-period { opacity: .45; margin-top: 10px; }
.flow-chapter-flowlabel { opacity: .55; margin-top: 26px; }

.flow-panes { list-style: none; margin: 18px 0 0; padding: 0; position: relative; }

/* Panes stack in one place; only the active one is legible. Base state is
   visible — the dimming below is the only thing JS-driven state adds. */
.flow-pane {
  transition: opacity .45s var(--ease);
  padding: 12px 0;
}
.flow-pane[data-state='dim'] { opacity: var(--dim); }
.flow-pane[data-state='flag'] { border-left: 2px solid var(--flag); padding-left: 16px; }
.flow-pane[data-state='flag'] .flow-pane-title,
.flow-pane[data-state='flag'] .flow-pane-counter { color: var(--flag); opacity: 1; }

.flow-pane-counter { opacity: .42; }
.flow-pane-title { font-size: clamp(22px, 2.4vw, 32px); margin-top: 10px; }
.flow-pane-detail { font-size: 14.5px; line-height: 1.65; margin-top: 10px; max-width: 46ch; }

.flow-chapter-stack { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 28px 0 0; padding: 0; }
.flow-chip { border: 1px solid var(--rule); padding: 5px 11px; }

.flow-chapter-links { display: flex; gap: 18px; margin-top: 20px; }
.flow-chapter-links a { border-bottom: 1px solid var(--rule); padding-bottom: 3px; }

/* Reduced motion: every pane readable at once, no pinning, no stacking. */
.flow-chapter.is-static .flow-pane[data-state='dim'] { opacity: 1; }
.flow-chapter.is-static .flow-panes { display: grid; gap: 22px; }

@media (max-width: 768px) {
  .flow-chapter-grid { grid-template-columns: 1fr; }
  .flow-chapter-diagram { display: none; }
  .flow-chapter-copy { padding-left: 0; }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test src/flow/FlowChapter`
Expected: PASS — 4 tests.

- [ ] **Step 6: Commit**

```bash
git add src/flow/FlowChapter.jsx src/flow/FlowChapter.css src/flow/FlowChapter.test.jsx
git commit -m "feat: add scrubbed flow chapter"
```

---

### Task 7: FlowStepper — the mobile tap-through

**Files:**
- Create: `src/flow/FlowStepper.jsx`
- Create: `src/flow/FlowStepper.css`
- Create: `src/stage/useIsMobile.js`
- Modify: `src/flow/FlowChapter.jsx`
- Test: `src/flow/FlowStepper.test.jsx`

**Interfaces:**
- Consumes: a project object (Task 3).
- Produces:
  - `useIsMobile() -> boolean` — true below 768px, live on resize.
  - `<FlowStepper project={project} />` — one node at a time, advanced by a button. All node details stay in the DOM.

- [ ] **Step 1: Write the failing test**

Create `src/flow/FlowStepper.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FlowStepper from './FlowStepper.jsx';

const PROJECT = {
  id: '01',
  name: 'LegalitasAI',
  flow: [
    { label: 'PDF Peraturan', detail: 'Regulations come as scanned PDFs.' },
    { label: 'Clean & Parse', detail: 'Boilerplate gets stripped.' },
    { label: 'Answer + Sources', detail: 'What ships is the answer.' },
  ],
};

describe('FlowStepper', () => {
  it('starts on the first node', () => {
    const { container } = render(<FlowStepper project={PROJECT} />);
    expect(container.querySelector('[data-pane="0"]')).toHaveAttribute('data-state', 'active');
  });

  it('advances one node per tap', async () => {
    const user = userEvent.setup();
    const { container } = render(<FlowStepper project={PROJECT} />);
    await user.click(screen.getByRole('button', { name: /next node/i }));
    expect(container.querySelector('[data-pane="1"]')).toHaveAttribute('data-state', 'active');
  });

  it('hides the next button on the last node', async () => {
    const user = userEvent.setup();
    render(<FlowStepper project={PROJECT} />);
    const next = screen.getByRole('button', { name: /next node/i });
    await user.click(next);
    await user.click(next);
    expect(screen.queryByRole('button', { name: /next node/i })).not.toBeInTheDocument();
  });

  it('keeps every node detail in the DOM', () => {
    render(<FlowStepper project={PROJECT} />);
    for (const n of PROJECT.flow) {
      expect(screen.getByText(n.detail)).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/flow/FlowStepper`
Expected: FAIL — `Failed to resolve import "./FlowStepper.jsx"`.

- [ ] **Step 3: Write the mobile breakpoint hook**

Create `src/stage/useIsMobile.js`:

```js
import { useEffect, useState } from 'react';

const QUERY = '(max-width: 768px)';

export default function useIsMobile() {
  const [mobile, setMobile] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setMobile(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return mobile;
}
```

- [ ] **Step 4: Write the stepper**

Create `src/flow/FlowStepper.jsx`:

```jsx
import { useState } from 'react';
import './FlowStepper.css';

// Mobile flow: no pinning, no scrub. One node per tap, with the rest of the
// pipeline listed underneath so the shape of the system stays visible.
export default function FlowStepper({ project }) {
  const [step, setStep] = useState(0);
  const total = project.flow.length;
  const isLast = step === total - 1;

  return (
    <div className="flow-stepper">
      <ol className="flow-stepper-bar" aria-hidden="true">
        {project.flow.map((n, i) => (
          <li key={n.label} data-on={i <= step ? 'true' : undefined} />
        ))}
      </ol>

      <ol className="flow-stepper-panes">
        {project.flow.map((n, i) => (
          <li
            key={n.label}
            data-pane={i}
            data-state={i === step ? (i === project.flagIndex ? 'flag' : 'active') : 'dim'}
            className="flow-stepper-pane"
          >
            <p className="flow-stepper-counter mono">
              Node {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <h3 className="flow-stepper-title">{n.label}</h3>
            <p className="flow-stepper-detail">{n.detail}</p>
          </li>
        ))}
      </ol>

      {!isLast && (
        <button
          type="button"
          className="flow-stepper-next mono"
          onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
        >
          Next node →
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: Write the stylesheet**

Create `src/flow/FlowStepper.css`:

```css
.flow-stepper { margin-top: 22px; }

.flow-stepper-bar { list-style: none; display: flex; gap: 3px; margin: 0 0 18px; padding: 0; }
.flow-stepper-bar li { height: 2px; flex: 1; background: var(--rule); }
.flow-stepper-bar li[data-on] { background: var(--ink); }

.flow-stepper-panes { list-style: none; margin: 0; padding: 0; display: grid; gap: 14px; }

.flow-stepper-pane { transition: opacity .35s var(--ease); }
.flow-stepper-pane[data-state='dim'] { opacity: var(--dim); }
.flow-stepper-pane[data-state='flag'] { border-left: 2px solid var(--flag); padding-left: 14px; }
.flow-stepper-pane[data-state='flag'] .flow-stepper-title { color: var(--flag); }

.flow-stepper-counter { opacity: .45; }
.flow-stepper-title { font-size: 22px; margin-top: 8px; }
.flow-stepper-detail { font-size: 14px; line-height: 1.6; margin-top: 8px; }

.flow-stepper-next {
  margin-top: 20px;
  background: none;
  border: 1px solid var(--ink);
  color: var(--ink);
  padding: 11px 18px;
  cursor: pointer;
  font-family: var(--font-mono);
  font-size: 11px;
  letter-spacing: .14em;
  text-transform: uppercase;
}

@media (prefers-reduced-motion: reduce) {
  .flow-stepper-pane[data-state='dim'] { opacity: 1; }
}
```

- [ ] **Step 6: Switch FlowChapter to the stepper on mobile**

In `src/flow/FlowChapter.jsx`, add these two imports below the existing ones:

```jsx
import FlowStepper from './FlowStepper.jsx';
import useIsMobile from '../stage/useIsMobile.js';
```

Add `const mobile = useIsMobile();` directly below `const reduced = useReducedMotion();`.

Change the `useChapter` call so pinning is off on mobile:

```jsx
const active = useChapter({ ref, steps, enabled: !reduced && !mobile });
```

Replace the `<ol className="flow-panes">…</ol>` block with a conditional — when `mobile` is true, render the stepper instead:

```jsx
{mobile ? (
  <FlowStepper project={project} />
) : (
  <ol className="flow-panes">
    {project.flow.map((n, i) => (
      <li
        key={n.label}
        data-pane={i}
        data-state={paneState(i, active, project.flagIndex)}
        className="flow-pane"
      >
        <p className="flow-pane-counter mono">
          Node {String(i + 1).padStart(2, '0')} / {String(steps).padStart(2, '0')}
        </p>
        <h3 className="flow-pane-title">{n.label}</h3>
        <p className="flow-pane-detail">{n.detail}</p>
      </li>
    ))}
  </ol>
)}
```

- [ ] **Step 7: Run the tests to verify they pass**

Run: `npm test src/flow`
Expected: PASS — 13 tests across FlowDiagram, FlowChapter, FlowStepper.

- [ ] **Step 8: Commit**

```bash
git add src/flow/FlowStepper.jsx src/flow/FlowStepper.css src/flow/FlowStepper.test.jsx src/flow/FlowChapter.jsx src/stage/useIsMobile.js
git commit -m "feat: add mobile tap-through flow stepper"
```

---

### Task 8: Navigation and shared UI

**Files:**
- Create: `src/ui/Nav.jsx`
- Create: `src/ui/Nav.css`
- Test: `src/ui/Nav.test.jsx`

**Interfaces:**
- Consumes: nothing.
- Produces: `<Nav />` — fixed nav with `WORK · STACK · ABOUT · CV`. The CV link points at `/Rizky-Nanda-Praditia-CV.pdf` with the `download` attribute. This is the recruiter shortcut required by the spec.

- [ ] **Step 1: Write the failing test**

Create `src/ui/Nav.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Nav from './Nav.jsx';

describe('Nav', () => {
  it('exposes the four jump targets', () => {
    render(<Nav />);
    for (const label of ['Work', 'Stack', 'About']) {
      expect(screen.getByRole('link', { name: label })).toBeInTheDocument();
    }
  });

  it('offers the CV as a download', () => {
    render(<Nav />);
    const cv = screen.getByRole('link', { name: /cv/i });
    expect(cv).toHaveAttribute('href', '/Rizky-Nanda-Praditia-CV.pdf');
    expect(cv).toHaveAttribute('download');
  });

  it('links the wordmark back to the top', () => {
    render(<Nav />);
    expect(screen.getByRole('link', { name: 'Rizky Nanda' })).toHaveAttribute('href', '#top');
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/ui`
Expected: FAIL — `Failed to resolve import "./Nav.jsx"`.

- [ ] **Step 3: Write the component**

Create `src/ui/Nav.jsx`:

```jsx
import './Nav.css';

const LINKS = [
  { href: '#work-01', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#about', label: 'About' },
];

export default function Nav() {
  return (
    <nav className="nav">
      <a href="#top" className="nav-mark">Rizky Nanda</a>
      <ul className="nav-links">
        {LINKS.map((l) => (
          <li key={l.href}><a href={l.href} className="nav-link mono">{l.label}</a></li>
        ))}
        <li>
          <a href="/Rizky-Nanda-Praditia-CV.pdf" download className="nav-link nav-cv mono">CV ↓</a>
        </li>
      </ul>
    </nav>
  );
}
```

- [ ] **Step 4: Write the stylesheet**

Create `src/ui/Nav.css`:

```css
.nav {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: 40;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px var(--v1);
  border-bottom: 1px solid var(--rule);
  background: color-mix(in srgb, var(--paper) 88%, transparent);
  backdrop-filter: blur(6px);
}

.nav-mark { font-family: var(--font-display); font-size: 18px; }

.nav-links { list-style: none; display: flex; align-items: center; gap: 22px; margin: 0; padding: 0; }

.nav-link { opacity: .62; transition: opacity .2s var(--ease); }
.nav-link:hover, .nav-link:focus-visible { opacity: 1; }

.nav-cv { border: 1px solid var(--ink); padding: 7px 12px; opacity: 1; }

@media (max-width: 768px) {
  .nav-links { gap: 14px; }
  .nav-mark { font-size: 15px; }
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test src/ui`
Expected: PASS — 3 tests.

- [ ] **Step 6: Commit**

```bash
git add src/ui
git commit -m "feat: add editorial nav with CV shortcut"
```

---

### Task 9: The non-flow chapters

**Files:**
- Create: `src/chapters/Opening.jsx`
- Create: `src/chapters/Premise.jsx`
- Create: `src/chapters/Compact.jsx`
- Create: `src/chapters/StackExp.jsx`
- Create: `src/chapters/About.jsx`
- Create: `src/chapters/Contact.jsx`
- Create: `src/chapters/chapters.css`
- Test: `src/chapters/chapters.test.jsx`

**Interfaces:**
- Consumes: `PROJECTS` (Task 3) for `Compact`.
- Produces: six chapter components. `Compact` takes `project`; the rest take no props.

All copy below is moved verbatim from the existing components. Do not reword any of it.

- [ ] **Step 1: Write the failing test**

Create `src/chapters/chapters.test.jsx`:

```jsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Opening from './Opening.jsx';
import Premise from './Premise.jsx';
import StackExp from './StackExp.jsx';
import About from './About.jsx';
import Contact from './Contact.jsx';

describe('chapters', () => {
  it('Opening states the name and the headline', () => {
    render(<Opening />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Building AI agents');
  });

  it('Premise keeps both metrics', () => {
    render(<Premise />);
    expect(screen.getByText(/10/)).toBeInTheDocument();
    expect(screen.getByText(/80%/)).toBeInTheDocument();
  });

  it('StackExp lists every role and every tool group', () => {
    render(<StackExp />);
    expect(screen.getByText('Aksoro')).toBeInTheDocument();
    expect(screen.getByText('damirich.id')).toBeInTheDocument();
    expect(screen.getByText('AI / LLM')).toBeInTheDocument();
    expect(screen.getByText('Web & Infra')).toBeInTheDocument();
  });

  it('About keeps the UTC+7 line', () => {
    render(<About />);
    expect(screen.getByText(/UTC\+7/)).toBeInTheDocument();
  });

  it('Contact exposes email, LinkedIn and GitHub', () => {
    render(<Contact />);
    expect(screen.getByRole('link', { name: /rizkynandapr@gmail\.com/ })).toHaveAttribute(
      'href', 'mailto:rizkynandapr@gmail.com'
    );
    expect(screen.getByRole('link', { name: 'LinkedIn' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'GitHub' })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test src/chapters`
Expected: FAIL — `Failed to resolve import "./Opening.jsx"`.

- [ ] **Step 3: Write Opening**

Create `src/chapters/Opening.jsx`:

```jsx
import './chapters.css';

export default function Opening() {
  return (
    <section className="chapter chapter-opening">
      <h1 className="opening-title">
        Building AI agents<br />that work in the<br />real world.
      </h1>
      <p className="opening-sub">
        I'm Rizky Nanda. I design prompts, build n8n pipelines, and connect
        LLMs to the systems businesses already run on — WhatsApp, CRMs,
        databases. Then I stay until it stops breaking.
      </p>
    </section>
  );
}
```

- [ ] **Step 4: Write Premise**

Create `src/chapters/Premise.jsx`:

```jsx
import './chapters.css';

const ROLES = [
  'AI Automation Engineer',
  'n8n Pipeline Builder',
  'LLM Prompt Engineer',
];

export default function Premise() {
  return (
    <section className="chapter chapter-premise">
      <p className="chapter-mark mono">Premise</p>

      <ul className="premise-roles">
        {ROLES.map((r) => <li key={r} className="mono">{r}</li>)}
      </ul>

      <p className="premise-lead">
        I make bots survive real users.
      </p>

      <dl className="premise-metrics">
        <div>
          <dt className="premise-figure">10</dt>
          <dd className="mono">SMB clients shipped</dd>
        </div>
        <div>
          <dt className="premise-figure">80%</dt>
          <dd className="mono">of workflows automated</dd>
        </div>
      </dl>
    </section>
  );
}
```

- [ ] **Step 5: Write Compact**

Create `src/chapters/Compact.jsx`:

```jsx
import './chapters.css';

// Clickbait Detector — no pipeline, so no scrub. One card, one number.
export default function Compact({ project }) {
  return (
    <section id={`work-${project.id}`} className="chapter chapter-compact">
      <p className="chapter-mark mono">Work {project.id}</p>

      <h2 className="compact-title">{project.name}</h2>
      <p className="compact-tag">{project.tag}</p>
      <p className="compact-period mono">{project.period}</p>

      <p className="compact-body">{project.problem}</p>
      <p className="compact-body">{project.build}</p>

      <ul className="compact-stack">
        {project.stack.map((s) => <li key={s} className="flow-chip mono">{s}</li>)}
      </ul>

      <p className="compact-links">
        {project.links.demo && (
          <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="mono">Live demo ↗</a>
        )}
        {project.links.code && (
          <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="mono">Code ↗</a>
        )}
      </p>
    </section>
  );
}
```

- [ ] **Step 6: Write StackExp**

Create `src/chapters/StackExp.jsx`. Copy the `ROLES` array verbatim from `src/components/Experience.jsx:4-37` and the `GROUPS` array verbatim from `src/components/Stack.jsx:5-18`, then:

```jsx
import './chapters.css';

// ROLES  — paste verbatim from src/components/Experience.jsx:4-37
// GROUPS — paste verbatim from src/components/Stack.jsx:5-18

export default function StackExp() {
  return (
    <section id="stack" className="chapter chapter-stackexp">
      <p className="chapter-mark mono">Stack &amp; Track record</p>

      <div className="stackexp-grid">
        <div>
          <h2 className="stackexp-title">The stack I run daily.</h2>
          <dl className="stackexp-groups">
            {GROUPS.map((g) => (
              <div key={g.label} className="stackexp-row">
                <dt className="mono">{g.label}</dt>
                <dd>{g.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="stackexp-title">Where this has actually run.</h2>
          <ol className="stackexp-roles">
            {ROLES.map((r) => (
              <li key={r.org + r.title} className="stackexp-role">
                <p className="mono stackexp-period">{r.period}</p>
                <h3>{r.title}</h3>
                <p className="stackexp-org">{r.org} · {r.location}</p>
                <ul>
                  {r.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
```

Note: the tool icons from `src/components/icons/ToolIcons.jsx` are **not** used — the stack is a lined editorial table, not an icon grid, per spec §4.

- [ ] **Step 7: Write About**

Create `src/chapters/About.jsx`. Copy the prose verbatim from `src/components/About.jsx:9-26`:

```jsx
import './chapters.css';

export default function About() {
  return (
    <section id="about" className="chapter chapter-about">
      <p className="chapter-mark mono">About</p>

      <p className="about-lead">
        IT degree from Universitas Muhammadiyah Yogyakarta, then Hacktiv8's
        Data Science Bootcamp on top of it. Automation on one side, data on
        the other.
      </p>

      <div className="about-detail">
        <p>
          Most days I'm inside an n8n canvas or a prompt draft, wiring an AI
          agent to WhatsApp and waiting to see what breaks. Something always
          does — usually one node with a typo in its name, or a system prompt
          that reads fine to me and completely differently to the model.
          Finding that gap is most of the job.
        </p>
        <p>
          Open to remote work with international teams. I'm in UTC+7, which
          in practice means I've made peace with async standups.
        </p>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Write Contact**

Create `src/chapters/Contact.jsx`:

```jsx
import './chapters.css';

// The only --press surface on the site: paper inverts to ink.
export default function Contact() {
  return (
    <section id="contact" className="chapter chapter-dark chapter-contact">
      <p className="chapter-mark mono">Contact</p>

      <h2 className="contact-title">
        Have a broken workflow<br />or an idea worth automating?
      </h2>

      <a href="mailto:rizkynandapr@gmail.com" className="contact-email mono">
        rizkynandapr@gmail.com
      </a>

      <p className="contact-links">
        <a href="https://www.linkedin.com/in/rizky-nanda-praditia/" target="_blank" rel="noopener noreferrer" className="mono">LinkedIn</a>
        <a href="https://github.com/rizkynandapr" target="_blank" rel="noopener noreferrer" className="mono">GitHub</a>
        <a href="/Rizky-Nanda-Praditia-CV.pdf" download className="mono">CV ↓</a>
      </p>

      <p className="contact-foot mono">
        © 2026 Rizky Nanda Praditia · React + GSAP · Deployed on Vercel
      </p>
    </section>
  );
}
```

Note the footer credit drops "Three.js" — three is removed in Task 10.

- [ ] **Step 9: Write the chapters stylesheet**

Create `src/chapters/chapters.css`:

```css
/* Scroll allocation per spec §4. Non-flow chapters earn their screens by
   height; flow chapters get theirs from useChapter's pinned timeline. */
.chapter-opening  { min-height: 200svh; }
.chapter-premise  { min-height: 300svh; }
.chapter-compact  { min-height: 200svh; }
.chapter-stackexp { min-height: 400svh; }
.chapter-about    { min-height: 300svh; }
.chapter-contact  { min-height: 300svh; }

.opening-title { font-size: clamp(44px, 8vw, 104px); }
.opening-sub { margin-top: 30px; max-width: 52ch; font-size: 16px; line-height: 1.7; opacity: .8; }

.premise-roles { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; margin: 0 0 26px; padding: 0; }
.premise-roles li { border: 1px solid var(--rule); padding: 5px 11px; }
.premise-lead { font-family: var(--font-display); font-size: clamp(30px, 4.6vw, 62px); line-height: 1.06; }
.premise-metrics { display: flex; gap: 60px; margin: 44px 0 0; }
.premise-metrics dd { margin: 6px 0 0; opacity: .55; }
.premise-figure { font-family: var(--font-display); font-size: clamp(38px, 5vw, 68px); }

.compact-title { font-size: clamp(30px, 4vw, 50px); }
.compact-tag { margin-top: 6px; opacity: .7; }
.compact-period { margin-top: 10px; opacity: .45; }
.compact-body { margin-top: 18px; max-width: 58ch; font-size: 14.5px; line-height: 1.68; }
.compact-stack { list-style: none; display: flex; flex-wrap: wrap; gap: 8px; margin: 24px 0 0; padding: 0; }
.compact-links { display: flex; gap: 18px; margin-top: 18px; }

.stackexp-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 60px; }
.stackexp-title { font-size: clamp(24px, 2.8vw, 38px); margin-bottom: 26px; }
.stackexp-groups { margin: 0; }
.stackexp-row { display: grid; grid-template-columns: 34% 1fr; gap: 18px; padding: 14px 0; border-top: 1px solid var(--rule); }
.stackexp-row dt { opacity: .5; }
.stackexp-row dd { margin: 0; font-size: 14.5px; }
.stackexp-roles { list-style: none; margin: 0; padding: 0; }
.stackexp-role { padding: 18px 0; border-top: 1px solid var(--rule); }
.stackexp-period { opacity: .45; }
.stackexp-role h3 { font-size: 21px; margin-top: 8px; }
.stackexp-org { opacity: .6; font-size: 13.5px; margin-top: 4px; }
.stackexp-role ul { margin: 12px 0 0; padding-left: 18px; font-size: 14px; line-height: 1.6; }
.stackexp-role li { margin-bottom: 6px; }

.about-lead { font-family: var(--font-display); font-size: clamp(26px, 3.4vw, 44px); line-height: 1.16; max-width: 22ch; }
.about-detail { margin-top: 32px; max-width: 56ch; display: grid; gap: 16px; font-size: 15px; line-height: 1.72; opacity: .85; }

.chapter-contact { text-align: left; }
.contact-title { font-size: clamp(30px, 5vw, 66px); }
.contact-email { display: inline-block; margin-top: 34px; font-size: 15px; letter-spacing: .1em; border-bottom: 1px solid currentColor; padding-bottom: 4px; }
.contact-links { display: flex; gap: 22px; margin-top: 34px; }
.contact-foot { margin-top: 70px; opacity: .45; }

@media (max-width: 768px) {
  .stackexp-grid { grid-template-columns: 1fr; gap: 44px; }
  .premise-metrics { gap: 32px; }

  /* Mobile drops the scroll padding — spec §6 targets ~12 screens total. */
  .chapter-opening, .chapter-premise, .chapter-compact,
  .chapter-stackexp, .chapter-about, .chapter-contact { min-height: 100svh; }
}

@media (prefers-reduced-motion: reduce) {
  .chapter-opening, .chapter-premise, .chapter-compact,
  .chapter-stackexp, .chapter-about, .chapter-contact { min-height: 100svh; }
}
```

- [ ] **Step 10: Run the tests to verify they pass**

Run: `npm test src/chapters`
Expected: PASS — 5 tests.

- [ ] **Step 11: Commit**

```bash
git add src/chapters
git commit -m "feat: add opening, premise, compact, stack/exp, about, contact chapters"
```

---

### Task 10: Wire the stage and remove the old layer

**Files:**
- Rewrite: `src/App.jsx`
- Delete: `src/components/` (entire directory)
- Delete: `src/hooks/useScrollReveal.js`
- Move: `src/hooks/useSmoothScroll.js` → `src/stage/useSmoothScroll.js`
- Modify: `package.json`

**Interfaces:**
- Consumes: everything from Tasks 3–9.
- Produces: the assembled site.

- [ ] **Step 1: Move the smooth-scroll hook into the stage folder**

```bash
git mv src/hooks/useSmoothScroll.js src/stage/useSmoothScroll.js
git rm src/hooks/useScrollReveal.js
```

Change the export in `src/stage/useSmoothScroll.js` from a named export to a default export — replace the line `export function useSmoothScroll() {` with:

```js
export default function useSmoothScroll() {
```

- [ ] **Step 2: Rewrite App.jsx**

Replace `src/App.jsx` entirely:

```jsx
import PROJECTS from './data/projects.js';
import Stage from './stage/Stage.jsx';
import useSmoothScroll from './stage/useSmoothScroll.js';
import Nav from './ui/Nav.jsx';
import Opening from './chapters/Opening.jsx';
import Premise from './chapters/Premise.jsx';
import Compact from './chapters/Compact.jsx';
import StackExp from './chapters/StackExp.jsx';
import About from './chapters/About.jsx';
import Contact from './chapters/Contact.jsx';
import FlowChapter from './flow/FlowChapter.jsx';

const flowProjects = PROJECTS.filter((p) => p.flow);
const compactProjects = PROJECTS.filter((p) => !p.flow);

export default function App() {
  useSmoothScroll();

  return (
    <>
      <Nav />
      <Stage>
        <Opening />
        <Premise />
        {flowProjects.map((p) => <FlowChapter key={p.id} project={p} />)}
        {compactProjects.map((p) => <Compact key={p.id} project={p} />)}
        <StackExp />
        <About />
        <Contact />
      </Stage>
    </>
  );
}
```

- [ ] **Step 3: Delete the old component layer**

```bash
git rm -r src/components
```

This removes `NeuralScene.jsx`, `TypingText.jsx`, `WorkflowDiagram.jsx`, `EmailLink.jsx`, `icons/ToolIcons.jsx`, the seven old section components and all their CSS.

- [ ] **Step 4: Drop the three.js dependency**

```bash
npm uninstall three
```

- [ ] **Step 5: Verify three is gone and nothing still imports the deleted files**

Run: `grep -rn "three\|components/\|useScrollReveal\|NeuralScene\|TypingText" src/ index.html ; echo "exit=$?"`
Expected: `exit=1` (no matches).

Run: `npm run build`
Expected: build succeeds.

Run: `grep -rl "THREE" dist/assets/ ; echo "exit=$?"`
Expected: `exit=1` — three is not in the production bundle.

- [ ] **Step 6: Run the whole suite and the linter**

Run: `npm test`
Expected: PASS — all 53 tests (24 layouts, 5 projects, 5 FlowDiagram, 3 useReducedMotion, 4 FlowChapter, 4 FlowStepper, 3 Nav, 5 chapters).

Run: `npm run lint`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: assemble cinematic stage, remove three.js and old component layer"
```

---

### Task 11: Verification pass against the completion criteria

**Files:**
- Modify: `README.md`
- Test: manual, plus the existing suite

**Interfaces:**
- Consumes: the assembled site.
- Produces: a verified build.

- [ ] **Step 1: Confirm the site reads with JavaScript disabled**

Run: `npm run build && npm run preview`

In Chrome DevTools → Settings → Debugger → check "Disable JavaScript", then reload the preview URL.

Expected: every chapter is visible and readable top to bottom. Every node label and every node detail for all four pipelines is legible. Nothing is blank.

If any pane is invisible, a `data-state` default is wrong — the CSS base state must be `opacity: 1`, with dimming applied only when `data-state="dim"` is present.

- [ ] **Step 2: Confirm the reduced-motion path**

In DevTools → Rendering → "Emulate CSS prefers-reduced-motion: reduce", reload.

Expected: no pinning anywhere; the page scrolls straight through in roughly 10 screens; every flow shows all its node text at once.

- [ ] **Step 3: Confirm the mobile path**

In DevTools device toolbar, select iPhone 14 Pro (393px wide), reload.

Expected: no pinning; each flow shows a progress bar and a "Next node →" button; tapping advances one node; the diagram column is hidden.

- [ ] **Step 4: Confirm the desktop scrub and the flag moment**

At 1440px wide, scroll slowly through Work 01.

Expected: the chapter pins, nodes light one at a time, passed and upcoming nodes sit dim. At node 7 (Citation Validator) the dot, label and pane border turn `#8a4b2a` and the outgoing edge renders as a broken dashed line. This is the only colour anywhere on the site.

- [ ] **Step 5: Confirm contrast**

In DevTools, inspect a `.flow-pane-detail` element and read the contrast ratio in the Styles pane colour picker.

Expected: `--ink` on `--paper` ≈ 15:1. Inspect a `[data-state="flag"]` title: `--flag` on `--paper` ≈ 5.9:1. Both pass WCAG AA.

- [ ] **Step 6: Confirm the recruiter shortcut**

From the top of the page, click `Work` in the nav, then `CV`.

Expected: `Work` jumps to Work 01; `CV` downloads `Rizky-Nanda-Praditia-CV.pdf`.

- [ ] **Step 7: Update the README stack line**

In `README.md`, replace any mention of Three.js in the tech-stack description with GSAP ScrollTrigger. If the README does not mention the stack, skip this step.

- [ ] **Step 8: Final green check**

Run: `npm test`
Expected: PASS — 45 tests.

Run: `npm run lint`
Expected: no errors.

Run: `npm run build`
Expected: succeeds.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: verification pass for cinematic redesign"
```

---

## Completion Criteria

Mirrors spec §10. All must hold before this plan is done:

- [ ] All four flows scrub on desktop with distinct compositions (Task 6, verified Task 11 Step 4)
- [ ] Tap-through stepper works below 768px (Task 7, verified Task 11 Step 3)
- [ ] `prefers-reduced-motion` yields a complete static document (Task 11 Step 2)
- [ ] Site reads fully with JavaScript disabled (Task 11 Step 1)
- [ ] `three` absent from the production bundle (Task 10 Step 5)
- [ ] Nav `WORK · STACK · ABOUT · CV` reachable from anywhere (Task 8, verified Task 11 Step 6)
- [ ] CV download works (Task 11 Step 6)
- [ ] Contrast passes WCAG AA (Task 11 Step 5)
- [ ] `npm run build` and `npm run lint` clean (Task 11 Step 8)
- [ ] Layout and reduced-motion tests pass (Task 11 Step 8)
