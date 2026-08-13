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
    // The column is tall and narrow, so the traverse descends as it crosses —
    // otherwise nine labels land on one line and overlap into a smear.
    it('travels strictly left to right', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      for (let i = 1; i < out.length; i++) {
        expect(out[i].x).toBeGreaterThan(out[i - 1].x);
      }
    });

    it('descends strictly, so no two labels share a line', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      for (let i = 1; i < out.length; i++) {
        expect(out[i].y).toBeGreaterThan(out[i - 1].y);
      }
    });

    it('spans the full width, unlike the single-column vertical drop', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      const xs = out.map((p) => p.x);
      expect(Math.max(...xs) - Math.min(...xs)).toBeGreaterThan(VIEWPORT.width / 2);
    });

    it('every edge after index 0 is straight', () => {
      const out = LAYOUTS.horizontal(NODES, VIEWPORT);
      for (const p of out.slice(1)) {
        expect(p.edge).toBe('straight');
      }
    });
  });

  describe('branching', () => {
    // Two sustained columns is what reads as parallel in a narrow diagram
    // column; level pairs would collide their labels, so the tracks interleave.
    it('middle nodes occupy exactly two tracks either side of the spine', () => {
      const out = LAYOUTS.branching(NODES, VIEWPORT);
      const spineX = out[0].x;
      const middleX = new Set(out.slice(1, -1).map((p) => p.x));
      expect(middleX.size).toBe(2);
      const [a, b] = [...middleX];
      expect(Math.min(a, b)).toBeLessThan(spineX);
      expect(Math.max(a, b)).toBeGreaterThan(spineX);
    });

    it('gives every node its own row so labels never collide', () => {
      const out = LAYOUTS.branching(NODES, VIEWPORT);
      expect(new Set(out.map((p) => p.y)).size).toBe(out.length);
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
    // Two inputs sit side by side at the top, then the merged chain runs down
    // the centre — descending, so the chain's labels clear each other.
    // The inputs occupy their own columns AND their own rows: same-row inputs
    // collide their labels in a column this narrow.
    it('the first two nodes differ in both x and y (the inputs)', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      expect(out[0].x).not.toBe(out[1].x);
      expect(out[0].y).not.toBe(out[1].y);
    });

    it('both inputs sit above the whole chain', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      const chainTop = Math.min(...out.slice(2).map((p) => p.y));
      expect(out[0].y).toBeLessThan(chainTop);
      expect(out[1].y).toBeLessThan(chainTop);
    });

    it('every node from index 2 on shares the same x (the chain)', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      const chainX = out[2].x;
      for (const p of out.slice(2)) {
        expect(p.x).toBe(chainX);
      }
    });

    it('the chain descends and never sits on an input row', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      const inputY = out[0].y;
      for (let i = 3; i < out.length; i++) {
        expect(out[i].y).toBeGreaterThan(out[i - 1].y);
      }
      for (const p of out.slice(2)) {
        expect(p.y).toBeGreaterThan(inputY);
      }
    });

    it('has exactly one merge edge', () => {
      const out = LAYOUTS.convergent(NODES, VIEWPORT);
      expect(out.filter((p) => p.edge === 'merge')).toHaveLength(1);
    });
  });
});
