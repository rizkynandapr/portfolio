import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import FlowChapter from './FlowChapter.jsx';

const PROJECT = {
  id: '01',
  name: 'LegalitasAI',
  tag: 'RAG with a Citation Guardrail',
  period: '2026 · Open source',
  problem: 'A lawyer is expensive, and a normal LLM gives a confident answer that is sometimes wrong.',
  build: 'A RAG assistant that is not allowed to answer without proof, moving revoked-doc filtering into ranking took Hit Rate@5 from 63.6% to 81.8%.',
  canvas: { at: [[0, 0], [1, 0], [2, 0]], edges: [[0, 1], [1, 2]] },
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

afterEach(() => vi.useRealTimers());

beforeEach(() => {
  window.matchMedia = (q) => ({
    matches: false, media: q, onchange: null,
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  });
});

describe('FlowChapter', () => {
  it('lets a visitor pick any node on the canvas to read it', () => {
    const { container } = render(<FlowChapter project={PROJECT} />);
    screen.getByRole('button', { name: /02 Citation Validator/ }).click();
    return Promise.resolve().then(() => {
      expect(container.querySelector('[data-pane="1"]')).not.toHaveAttribute('data-state', 'dim');
    });
  });

  it('does nothing until Execute workflow is pressed, then runs every node', async () => {
    vi.useFakeTimers();
    const { container } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelectorAll('.n8n-node[data-status="idle"]')).toHaveLength(3);
    await act(async () => { vi.advanceTimersByTime(10000); });
    expect(container.querySelectorAll('.n8n-node[data-status="idle"]')).toHaveLength(3);

    await act(async () => { screen.getByRole('button', { name: /Execute workflow/ }).click(); });
    for (let t = 0; t < 40; t++) {
      await act(async () => { vi.advanceTimersByTime(250); });
    }
    expect(container.querySelectorAll('.n8n-node[data-status="success"]')).toHaveLength(3);
    expect(screen.getByRole('button', { name: /Run again/ })).toBeInTheDocument();
  });

  it('renders the replay showcase only for projects that ask for it', () => {
    const { container, rerender } = render(<FlowChapter project={PROJECT} />);
    expect(container.querySelector('.replay')).toBeNull();
    rerender(<FlowChapter project={{ ...PROJECT, showcase: 'replay' }} />);
    expect(container.querySelector('.replay')).not.toBeNull();
  });

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

  it('renders the author\'s problem and build prose verbatim', () => {
    render(<FlowChapter project={PROJECT} />);
    expect(screen.getByText(PROJECT.problem)).toBeInTheDocument();
    expect(screen.getByText(PROJECT.build)).toBeInTheDocument();
    expect(screen.getByText('The problem')).toBeInTheDocument();
    expect(screen.getByText('What I built')).toBeInTheDocument();
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

  it('marks the flag pane when the guardrail node is shown', async () => {
    const { container } = render(<FlowChapter project={PROJECT} />);
    await act(async () => { screen.getByRole('button', { name: /02 Citation Validator/ }).click(); });
    expect(container.querySelector(`[data-pane="${PROJECT.flagIndex}"]`)).toHaveAttribute('data-state', 'flag');
    expect(container.querySelector('[data-pane="2"]')).toHaveAttribute('data-state', 'dim');
  });

  it('renders no flag pane for a project with no flagIndex', () => {
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

});
