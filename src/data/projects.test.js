import { describe, it, expect } from 'vitest';
import PROJECTS from './projects.js';
import { COMPOSITIONS } from '../flow/layouts/index.js';

describe('PROJECTS', () => {
  it('has five projects with unique ids', () => {
    expect(PROJECTS).toHaveLength(5);
    expect(new Set(PROJECTS.map((p) => p.id)).size).toBe(5);
  });

  it('gives every flow project a valid composition', () => {
    for (const p of PROJECTS.filter((p) => p.flow)) {
      expect(COMPOSITIONS).toContain(p.composition);
      expect(p.flowLabel).toBeTruthy();
    }
  });

  it('assigns each of the four compositions exactly once', () => {
    const used = PROJECTS.filter((p) => p.flow).map((p) => p.composition);
    expect(used.sort()).toEqual([...COMPOSITIONS].sort());
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
});
