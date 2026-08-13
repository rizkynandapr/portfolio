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

describe('layout shape and edge semantics', () => {
  const NODES = makeNodes(9);

  describe('vertical', () => {
    it('every node shares the same x', () => {
      const out = LAYOUTS.vertical(NODES, VIEWPORT);
      const xs = new Set(out.map((p) => p.x));
      expect(xs.size).toBe(1);
    });

    it('every edge after index 0 is straight', () => {
      const out = LAYOUTS.vertical(NODES, VIEWPORT);
      for (const p of out.slice(1)) {
        expect(p.edge).toBe('straight');
      }
    });
  });

  describe('horizontal', () => {
    it('every node shares the same y', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      const ys = new Set(out.map((p) => p.y));
      expect(ys.size).toBe(1);
    });

    it('every edge after index 0 is straight', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      for (const p of out.slice(1)) {
        expect(p.edge).toBe('straight');
      }
    });
  });

  describe('branching', () => {
    it('at least one pair of nodes shares a y (genuine parallelism)', () => {
      const out = LAYOUTS.branching(NODES, VIEWPORT);
      const counts = new Map();
      for (const p of out) counts.set(p.y, (counts.get(p.y) ?? 0) + 1);
      expect([...counts.values()].some((c) => c > 1)).toBe(true);
    });

    it('first and last nodes share the spine x; no middle node sits on it', () => {
      const out = LAYOUTS.branching(NODES, VIEWPORT);
      const spineX = out[0].x;
      expect(out[out.length - 1].x).toBe(spineX);
      for (const p of out.slice(1, -1)) {
        expect(p.x).not.toBe(spineX);
      }
    });

    it('has exactly one fork and exactly one merge edge', () => {
      const out = LAYOUTS.branching(NODES, VIEWPORT);
      expect(out.filter((p) => p.edge === 'fork')).toHaveLength(1);
      expect(out.filter((p) => p.edge === 'merge')).toHaveLength(1);
    });
  });

  describe('convergent', () => {
    it('the first two nodes share x and differ in y (the inputs)', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      expect(out[0].x).toBe(out[1].x);
      expect(out[0].y).not.toBe(out[1].y);
    });

    it('every node from index 2 on shares the same y (the chain)', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      const chainY = out[2].y;
      for (const p of out.slice(2)) {
        expect(p.y).toBe(chainY);
      }
    });

    it('has exactly one merge edge', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      expect(out.filter((p) => p.edge === 'merge')).toHaveLength(1);
    });
  });
});
