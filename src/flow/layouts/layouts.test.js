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
