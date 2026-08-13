import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App.jsx';
import PROJECTS from './data/projects.js';

// useSmoothScroll initialises Lenis, which calls `new ResizeObserver(...)` —
// not implemented in jsdom, so the effect throws. Mocked to a no-op; this
// smoke test only needs the DOM tree, not the scroll behaviour.
vi.mock('./stage/useSmoothScroll.js', () => ({ default: vi.fn() }));

// useChapter creates a real GSAP ScrollTrigger when enabled (desktop +
// motion allowed, which is the default here). ScrollTrigger.create() in
// jsdom triggers "Not implemented: Window's scrollTo()" console noise from
// jsdom itself. Mocked to always report the lead-in step (0), matching the
// convention already used in FlowChapter.test.jsx, so no ScrollTrigger is
// ever registered and the pristine-output requirement holds.
vi.mock('./stage/useChapter.js', () => ({ default: vi.fn(() => 0) }));

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

// Ordering rule (from src/App.jsx): Opening, Premise, one FlowChapter per
// project with a `flow` (in PROJECTS order), one Compact per project
// without a `flow` (in PROJECTS order), StackExp, About, Contact — all
// inside <Stage id="top">. Derived here from that rule, not from output.
const flowIds = PROJECTS.filter((p) => p.flow).map((p) => `work-${p.id}`);
const compactIds = PROJECTS.filter((p) => !p.flow).map((p) => `work-${p.id}`);
const EXPECTED_ID_ORDER = ['top', ...flowIds, ...compactIds, 'stack', 'about', 'contact'];

describe('App', () => {
  it('renders every project exactly once', () => {
    const { container } = render(<App />);

    for (const p of PROJECTS) {
      expect(screen.getByText(p.name)).toBeInTheDocument();
    }

    const sections = container.querySelectorAll('[id^="work-"]');
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
