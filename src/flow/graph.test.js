import { describe, it, expect } from 'vitest';
import { buildGraph, buildSchedule } from './graph.js';
import PROJECTS from '../data/projects.js';

const node = (label) => ({ label, detail: `${label} detail` });

const LINEAR = {
  flow: ['Webhook', 'Claude API', 'Supabase'].map(node),
  canvas: { at: [[0, 0], [1, 0], [2, 0]], edges: [[0, 1], [1, 2]] },
};

const LOOP = {
  flow: ['Generate (Sonnet)', 'Citation Validator', 'Answer + Sources'].map(node),
  canvas: { at: [[0, 0], [1, 0], [2, 0]], edges: [[0, 1], [1, 2], [1, 0, 'retry']] },
};

describe('buildGraph', () => {
  it('positions every node inside the canvas, left to right by column', () => {
    const g = buildGraph(LINEAR);
    for (const n of g.nodes) {
      expect(n.x).toBeGreaterThan(0);
      expect(n.x).toBeLessThan(g.width);
      expect(n.y).toBeGreaterThan(0);
      expect(n.y).toBeLessThan(g.height);
    }
    expect(g.nodes[1].x).toBeGreaterThan(g.nodes[0].x);
  });

  it('marks nodes with no incoming wire as triggers', () => {
    const g = buildGraph(LINEAR);
    expect(g.nodes.map((n) => n.trigger)).toEqual([true, false, false]);
  });

  it('does not count a retry loop as an incoming wire', () => {
    const g = buildGraph(LOOP);
    expect(g.nodes[0].trigger).toBe(true);
  });

  it('draws wires from an output port to an input port', () => {
    const g = buildGraph(LINEAR);
    expect(g.edges).toHaveLength(2);
    expect(g.edges[0].d.startsWith(`M ${g.nodes[0].x + 32} ${g.nodes[0].y}`)).toBe(true);
  });

  it('picks an icon and subtitle for every real node', () => {
    for (const p of PROJECTS.filter((x) => x.flow)) {
      for (const n of buildGraph(p).nodes) {
        expect(n.subtitle).toBeTruthy();
        expect(n.icon).not.toBe('dot');
      }
    }
  });
});

describe('buildSchedule', () => {
  it('runs each node then hands data down its wires, in flow order', () => {
    const ev = buildSchedule(buildGraph(LINEAR));
    expect(ev.map((e) => `${e.type}:${e.node}`)).toEqual(['run:0', 'done:0', 'run:1', 'done:1', 'run:2', 'done:2']);
    expect(ev[1].edges).toEqual([0]);
    expect(ev[5].edges).toEqual([]);
  });

  it('sends a retry back once, re-runs the target, then passes', () => {
    const ev = buildSchedule(buildGraph(LOOP));
    expect(ev.map((e) => `${e.type}:${e.node}`)).toEqual([
      'run:0', 'done:0',
      'run:1', 'retry:1', 'run:0', 'done:0', 'run:1', 'done:1',
      'run:2', 'done:2',
    ]);
  });
});
