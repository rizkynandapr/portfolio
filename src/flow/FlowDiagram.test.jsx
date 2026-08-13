import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import FlowDiagram from './FlowDiagram.jsx';
import vertical from './layouts/vertical.js';
import convergent from './layouts/convergent.js';
import branching from './layouts/branching.js';
import horizontal from './layouts/horizontal.js';

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

  it('does not mark a midpoint label right-aligned', () => {
    const { container } = setup();
    const last = container.querySelector('[data-node="3"]'); // vertical: x = width / 2, at the midpoint, not past it
    expect(last).toHaveAttribute('data-side', 'left');
  });

  it('marks a label past the column midpoint as right-aligned', () => {
    const viewport = { width: 520, height: 760 };
    const nodes = [
      { label: 'Start', detail: 'a' },
      { label: 'Middle', detail: 'b' },
      { label: 'End', detail: 'c' },
    ];
    const positions = horizontal(nodes, viewport);
    const { container } = render(
      <FlowDiagram positions={positions} activeIndex={0} viewport={viewport} />
    );
    // horizontal's last node lands well past the midpoint of the column.
    expect(positions[2].x).toBeGreaterThan(viewport.width / 2);
    expect(container.querySelector('[data-node="2"]')).toHaveAttribute('data-side', 'right');
    expect(container.querySelector('[data-node="0"]')).toHaveAttribute('data-side', 'left');
  });
});

describe('FlowDiagram edge derivation', () => {
  const CONVERGENT_VIEWPORT = { width: 600, height: 800 };
  const CONVERGENT_NODES = [
    { label: 'Candidate CV', detail: 'a' },
    { label: 'Job Description', detail: 'b' },
    { label: 'Analyze Candidate', detail: 'c' },
    { label: 'Weighted Scoring', detail: 'd' },
    { label: 'Hiring Dashboard', detail: 'e' },
  ];

  it('convergent: draws no edge between the two parallel inputs', () => {
    const positions = convergent(CONVERGENT_NODES, CONVERGENT_VIEWPORT);
    const { container } = render(
      <FlowDiagram positions={positions} activeIndex={0} viewport={CONVERGENT_VIEWPORT} />
    );
    // Both inputs sit on the same y; an edge directly joining them would be
    // a horizontal path at that height. None of the drawn edges may run
    // straight between position[0] and position[1].
    const paths = [...container.querySelectorAll('[data-edge]')].map((el) => el.getAttribute('d'));
    const inputToInput = `M ${positions[0].x} ${positions[0].y} L ${positions[1].x} ${positions[1].y}`;
    const inputToInputReversed = `M ${positions[1].x} ${positions[1].y} L ${positions[0].x} ${positions[0].y}`;
    expect(paths).not.toContain(inputToInput);
    expect(paths).not.toContain(inputToInputReversed);
  });

  it('convergent: the merge node receives an edge from each input', () => {
    const positions = convergent(CONVERGENT_NODES, CONVERGENT_VIEWPORT);
    const { container } = render(
      <FlowDiagram positions={positions} activeIndex={0} viewport={CONVERGENT_VIEWPORT} />
    );
    expect(container.querySelector('[data-edge="2-0"]')).toBeInTheDocument();
    expect(container.querySelector('[data-edge="2-1"]')).toBeInTheDocument();
  });

  const BRANCHING_VIEWPORT = { width: 700, height: 900 };
  const BRANCHING_NODES = Array.from({ length: 8 }, (_, i) => ({
    label: `Node ${i}`,
    detail: `detail ${i}`,
  }));

  it('branching: no edge joins two nodes that share a y (no rungs between parallel tracks)', () => {
    const positions = branching(BRANCHING_NODES, BRANCHING_VIEWPORT);
    const { container } = render(
      <FlowDiagram positions={positions} activeIndex={0} viewport={BRANCHING_VIEWPORT} />
    );
    const edgeEls = [...container.querySelectorAll('[data-edge]')];
    for (const el of edgeEls) {
      const d = el.getAttribute('d');
      // A straight (non-elbow) horizontal path has one segment: "M x1 y1 L x2 y2"
      // with y1 === y2 — that is exactly a rung between two same-height dots.
      const match = d.match(/^M ([\d.]+) ([\d.]+) L ([\d.]+) ([\d.]+)$/);
      if (match) {
        const [, , y1, , y2] = match;
        expect(y1).not.toBe(y2);
      }
    }
  });
});
