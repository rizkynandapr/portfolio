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
