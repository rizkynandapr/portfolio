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

  it('guesses Indonesian from common words', () => {
    expect(guessLang('gimana cara kerjanya?')).toBe('id');
    expect(guessLang('how does it work?')).toBe('en');
  });
});
