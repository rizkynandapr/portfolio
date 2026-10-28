import { describe, it, expect } from 'vitest';
import { QUICK, findQuickAnswer } from './quickAnswers.js';
import { guessLang } from './rag/answer.js';
import PROJECTS from '../data/projects.js';

describe('quickAnswers', () => {
  it('matches suggestions regardless of case and punctuation', () => {
    expect(findQuickAnswer('which project should i look at first')).toBe(QUICK[0].a);
    expect(findQuickAnswer('  CERITAIN LEGALITASAI DONG!! ')).toBe(QUICK[2].a);
    expect(findQuickAnswer('something else entirely')).toBeNull();
  });

  it('only quotes numbers that the site itself states', () => {
    const legal = PROJECTS.find((p) => p.name === 'LegalitasAI');
    expect(legal.build).toContain('63.6%');
    expect(legal.build).toContain('81.8%');
    expect(legal.build).toContain('43 tests');
  });

  it('keeps answers free of em dashes', () => {
    for (const { a } of QUICK) expect(a).not.toMatch(/—/);
  });

  it('gives every question a known topic and a unique wording', async () => {
    const { TOPICS } = await import('./quickAnswers.js');
    for (const x of QUICK) expect(TOPICS).toContain(x.topic);
    expect(new Set(QUICK.map((x) => x.q)).size).toBe(QUICK.length);
  });

  it('only quotes project numbers that the project write-ups state', () => {
    const text = PROJECTS.map((p) => [p.build, p.problem, p.metric.label, ...(p.flow ?? []).map((n) => n.detail)].join(' ')).join(' ');
    for (const n of ['93', '78', '1.55%', '1.24%', '1.99%', '35 km', '40%', '30%', '20%', '10%']) expect(text).toContain(n);
  });

  it('guesses Indonesian from common words', () => {
    expect(guessLang('gimana cara kerjanya?')).toBe('id');
    expect(guessLang('how does it work?')).toBe('en');
  });
});
