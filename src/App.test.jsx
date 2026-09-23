import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import PROJECTS from './data/projects.js';

// useSmoothScroll initialises Lenis, which calls `new ResizeObserver(...)` —
// not implemented in jsdom, so the effect throws. Mocked to a no-op; this
// smoke test only needs the DOM tree, not the scroll behaviour.
vi.mock('./stage/useSmoothScroll.js', () => ({ default: vi.fn() }));

// useAutoplay observes intersection and runs timers; the smoke test only
// needs the DOM tree, so it is pinned to node 0 and never ticks.
vi.mock('./flow/useAutoplay.js', () => ({ default: vi.fn(() => ({ active: 0, select: () => {}, paused: false, running: false })) }));

beforeEach(() => {
  // Desktop, motion-allowed viewport: matches:false for every media query.
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
});

// Ordering rule (from src/App.jsx): Opening, SystemsIndex, one FlowChapter per
// project with a `flow` (in PROJECTS order), one Compact per project
// without a `flow` (in PROJECTS order), StackExp, About, Contact — all
// inside <Stage id="top">. Derived here from that rule, not from output.
const flowIds = PROJECTS.filter((p) => p.flow).map((p) => `work-${p.id}`);
const compactIds = PROJECTS.filter((p) => !p.flow).map((p) => `work-${p.id}`);
const EXPECTED_ID_ORDER = ['top', 'systems', ...flowIds, ...compactIds, 'stack', 'about', 'contact'];

describe('App', () => {
  it('renders every project exactly once', () => {
    const { container } = render(<App />);

    for (const p of PROJECTS) {
      // Once as a chapter heading; the systems index lists it as a link row.
      expect(screen.getByRole('heading', { level: 2, name: p.name })).toBeInTheDocument();
    }

    const sections = container.querySelectorAll('section[id^="work-"]');
    expect(sections).toHaveLength(PROJECTS.length);
  });

  it('assembles chapters in the documented order', () => {
    const { container } = render(<App />);

    const knownIds = new Set(EXPECTED_ID_ORDER);
    const idsInDocumentOrder = [...container.querySelectorAll('[id]')]
      .map((el) => el.id)
      .filter((id) => knownIds.has(id));

    expect(idsInDocumentOrder).toEqual(EXPECTED_ID_ORDER);
  });

  it('resolves every in-page nav link to an element that exists', () => {
    const { container } = render(<App />);

    const navLinks = container.querySelectorAll('.nav a[href^="#"]');
    expect(navLinks.length).toBeGreaterThan(0);

    for (const link of navLinks) {
      const id = link.getAttribute('href').slice(1);
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });
});

describe('App — systems index', () => {
  it('links every index row to its project chapter', () => {
    const { container } = render(<App />);
    const rows = container.querySelectorAll('#systems a[href^="#work-"]');
    expect(rows).toHaveLength(PROJECTS.length);
    for (const row of rows) {
      expect(container.querySelector(row.getAttribute('href'))).not.toBeNull();
    }
  });

  it('gives every flow chapter a clickable node list', () => {
    const { container } = render(<App />);
    for (const p of PROJECTS.filter((x) => x.flow)) {
      const nodes = container.querySelectorAll(`#work-${p.id} .flow-node`);
      expect(nodes).toHaveLength(p.flow.length);
    }
  });
});
