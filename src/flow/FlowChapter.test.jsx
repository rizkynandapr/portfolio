import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlowChapter from './FlowChapter.jsx';
import useChapter from '../stage/useChapter.js';

vi.mock('../stage/useChapter.js', () => ({ default: vi.fn() }));

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
  vi.mocked(useChapter).mockReturnValue(0);
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

  it('marks the flag pane when it is the active one, and dims a non-flag pane', () => {
    vi.mocked(useChapter).mockReturnValue(PROJECT.flagIndex);
    const { container } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelector(`[data-pane="${PROJECT.flagIndex}"]`)).toHaveAttribute('data-state', 'flag');
    expect(container.querySelector('[data-pane="2"]')).toHaveAttribute('data-state', 'dim');
  });

  it('renders no flag pane for a project with no flagIndex', () => {
    vi.mocked(useChapter).mockReturnValue(0);
    const noFlag = { ...PROJECT, flagIndex: undefined };
    const { container } = render(<FlowChapter project={noFlag} />);
    expect(container.querySelector('[data-state="flag"]')).not.toBeInTheDocument();
  });

  it('applies is-static when the user prefers reduced motion', () => {
    window.matchMedia = (q) => ({
      matches: q === '(prefers-reduced-motion: reduce)', media: q, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    });
    const { container } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelector('.flow-chapter')).toHaveClass('is-static');
  });

  it('renders the desktop pane list (not the stepper) when the viewport does not match the mobile query', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: false, media: q, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    });
    const { container } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelector('.flow-panes')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next node/i })).not.toBeInTheDocument();
    window.matchMedia = originalMatchMedia;
  });

  it('renders the stepper (not the desktop pane list) when the mobile media query matches', () => {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = (q) => ({
      matches: q === '(max-width: 768px)', media: q, onchange: null,
      addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
    });
    render(<FlowChapter project={PROJECT} />);
    expect(screen.getByRole('button', { name: /next node/i })).toBeInTheDocument();
    expect(document.querySelector('.flow-panes')).not.toBeInTheDocument();
    for (const n of PROJECT.flow) {
      expect(screen.getByText(n.detail)).toBeInTheDocument();
    }
    window.matchMedia = originalMatchMedia;
  });
});
