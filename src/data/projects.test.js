import { describe, it, expect } from 'vitest';
import vercel from '../../vercel.json';
import PROJECTS from './projects.js';

describe('PROJECTS', () => {
  it('has eight projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(8);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(8);
  });

  it('gives every flow project a canvas with one position per node', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      expect(p.flowLabel).toBeTruthy();
      expect(p.canvas.at).toHaveLength(p.flow.length);
    }
  });

  it('only wires nodes that exist, never a node to itself', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      for (const [from, to] of p.canvas.edges) {
        expect(p.flow[from]).toBeDefined();
        expect(p.flow[to]).toBeDefined();
        expect(from).not.toBe(to);
      }
    }
  });

  it('places no two nodes on the same canvas cell', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      const cells = new Set(p.canvas.at.map(([c, r]) => `${c},${r}`));
      expect(cells.size).toBe(p.flow.length);
    }
  });

  it('loops back only from the LegalitasAI validator, to Generate', () => {
    const loops = PROJECTS.flatMap((p) => (p.canvas?.edges ?? []).filter((e) => e[2] === 'retry').map((e) => [p, e]));
    expect(loops).toHaveLength(1);
    const [p, [from, to]] = loops[0];
    expect(from).toBe(p.flagIndex);
    expect(p.flow[to].label).toBe('Generate (Sonnet)');
  });

  it('gives every node a label and a detail', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      for (const n of p.flow) {
        expect(n.label).toBeTruthy();
        expect(n.detail).toBeTruthy();
      }
    }
  });

  it('points flagIndex at LegalitasAI Citation Validator and nowhere else', () => {
    const flagged = PROJECTS.filter((p) => p.flagIndex !== undefined);
    expect(flagged).toHaveLength(1);
    expect(flagged[0].name).toBe('LegalitasAI');
    expect(flagged[0].flow[flagged[0].flagIndex].label).toBe('Citation Validator');
  });

  // Embeds must stay inside what the CSP in vercel.json allows to be framed.
  it('only embeds https Hugging Face Spaces, which the CSP allows', () => {
    const csp = vercel.headers[0].headers.find((h) => h.key === 'Content-Security-Policy').value;
    expect(csp).toContain('frame-src https://*.hf.space');
    const embeds = PROJECTS.filter((p) => p.embed);
    expect(embeds.length).toBeGreaterThan(0);
    for (const p of embeds) {
      expect(p.embed).toMatch(/^https:\/\/[a-z0-9-]+\.hf\.space$/);
      expect(p.tryHint).toBeTruthy();
    }
  });
});
