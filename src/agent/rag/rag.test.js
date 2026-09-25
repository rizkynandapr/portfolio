import { describe, it, expect } from 'vitest';
import { answer, retrieve, splitSentences, guessLang } from './answer.js';
import { buildCorpus } from './corpus.js';
import { tokenize } from './search.js';

const cases = [
  ['how does the citation validator work', /Every citation gets parsed/, 'LegalitasAI · Citation Validator'],
  ['Apa itu LegalitasAI?', /isn't allowed to answer without proof/, 'LegalitasAI'],
  ['what is ApplyIQ', /parsed right in the browser/, 'ApplyIQ'],
  ['talentscout scoring weights', /40% hard skills/, 'TalentScout · Weighted Scoring'],
  ['bagaimana cara onboarding klien baru di chatbot whatsapp', /duplicate the workflow/, 'WhatsApp AI Chatbot · Config Klien'],
  ['kerja di mana sekarang?', /Joining Cekat\.AI/, 'Right now'],
  ['what tools does he use', /Claude API, Cekat AI, n8n/, 'Stack and tools'],
  ['kuliah dimana', /S\.Kom in Informatics/, 'Education'],
  ['how can I contact him', /rizkynandapr@gmail\.com/, 'Contact'],
  ['clickbait accuracy', /98% accuracy/, 'Clickbait Detector'],
  ['teaching assistant', /36 undergraduates/, 'Teaching Assistant, Database Implementation, Universitas Muhammadiyah Yogyakarta'],
];

describe('site RAG', () => {
  it.each(cases)('%s', (q, expected, source) => {
    const a = answer(q);
    expect(a.text).toMatch(expected);
    expect(a.sources[0].title).toBe(source);
  });

  it('refuses to guess rates and offers email', () => {
    const a = answer('berapa tarifnya');
    expect(a.email).toBe(true);
    expect(a.text).toMatch(/nggak mau nebak/);
  });

  it('says so when the site has nothing on it', () => {
    const a = answer('best pizza in jakarta');
    expect(a.email).toBe(true);
    expect(a.sources).toHaveLength(0);
  });

  it('declines unrelated tasks', () => {
    expect(answer('write me a python script').text).toMatch(/only answer questions about Rizky/);
  });

  it('greets back in the same language', () => {
    expect(answer('halo').text).toMatch(/^Halo/);
    expect(answer('hi').text).toMatch(/^Hey/);
  });

  it('never invents text: every excerpt comes from the corpus', () => {
    const all = buildCorpus().map((c) => c.text + ' ' + (c.meta?.build ?? '')).join(' ');
    for (const [q] of cases) {
      const quoted = answer(q).text.match(/"([^"]{20,})"/);
      if (quoted) expect(all).toContain(quoted[1].replace(/…$/, '').slice(0, 60));
    }
  });

  it('keeps abbreviations and emails whole when splitting sentences', () => {
    expect(splitSentences('S.Kom in Informatics. Joining Cekat.AI soon. Mail a@b.com now.')).toHaveLength(3);
  });

  it('expands Indonesian terms and strips -nya', () => {
    expect(tokenize('pengalaman kerjanya', { expand: true })).toEqual(expect.arrayContaining(['experience', 'work']));
    expect(guessLang('gimana cara kerjanya?')).toBe('id');
  });

  it('retrieves a handful of chunks for the live prompt', () => {
    expect(retrieve('citation validator', 6).length).toBeGreaterThan(0);
    expect(retrieve('citation validator', 6).length).toBeLessThanOrEqual(6);
  });
});
