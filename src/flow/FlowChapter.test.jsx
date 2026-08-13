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
