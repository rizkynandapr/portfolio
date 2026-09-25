// Turns a question into a grounded answer without a language model:
// a few intents first (hello, thanks, contact, availability), then BM25
// retrieval, then a short answer built from the best-matching sentences,
// with links to where each piece lives on the page.
import { IDENTITY } from '../../data/profile.js';
import { buildCorpus } from './corpus.js';
import { createIndex, tokenize } from './search.js';

const CORPUS = buildCorpus();
const search = createIndex(CORPUS);
const MIN_SCORE = 2.2;

const ID_HINT = /\b(berapa|apakah|mau|dia|udah|sudah|aja|saja|tolong|kapan|kalau|kalo|apa|gimana|bagaimana|siapa|kenapa|mengapa|dong|nggak|gak|enggak|yang|itu|kak|bisa|ada|kerja|proyek|sekarang|dimana|di mana|ceritain|jelaskan|tentang|punya|pernah|halo|makasih)\b/i;
export const guessLang = (text) => (ID_HINT.test(text) ? 'id' : 'en');

const t = (lang, en, id) => (lang === 'id' ? id : en);

const INTENTS = [
  {
    test: /^\s*(hi|hello|hey|yo|halo|hai|hallo|pagi|siang|sore|malam|assalamualaikum|permisi)\b[\s!.?]*$/i,
    reply: (lang) => t(lang,
      "Hey. Ask me about Rizky's projects, the tools he uses, or where he's worked.",
      'Halo! Tanya aja soal proyek Rizky, tools yang dia pakai, atau pengalaman kerjanya.'),
  },
  {
    test: /\b(thanks|thank you|thx|makasih|terima kasih|trims|tq)\b/i,
    reply: (lang) => t(lang, 'Anytime.', 'Sama-sama!'),
  },
  {
    test: /^\s*(please\s+|tolong\s+|can you\s+|could you\s+|bisa\s+)?(write|generate|create|make|code|draft|translate|summari[sz]e|buatkan|buatin|bikinin|tuliskan|terjemahkan|kerjakan)\b/i,
    reply: (lang) => t(lang,
      "I only answer questions about Rizky's work, so I'll pass on that one. Want to hear about one of his projects instead?",
      'Aku cuma jawab pertanyaan soal kerjaan Rizky, jadi yang itu aku lewati dulu ya. Mau aku ceritain salah satu proyeknya?'),
  },
  {
    test: /\b(available|availability|freelance\w*|rates?|pric\w*|salar\w*|cost\w*|fees?|budget|gaji\w*|harga\w*|tarif\w*|biaya\w*|bayar\w*|terbuka|open to|hire|hiring|rekrut\w*)\b/i,
    reply: (lang) => t(lang,
      "The site doesn't say anything about rates or availability, so I'd rather not guess. Email Rizky and he'll tell you straight.",
      'Soal tarif atau ketersediaan nggak ada di situs ini, jadi aku nggak mau nebak. Langsung email Rizky aja, nanti dia jawab sendiri.'),
    email: true,
  },
  {
    test: /\b(salary|gaji|umur|age|agama|religion|married|menikah|pacar|girlfriend|alamat rumah|home address|phone number|nomor hp|no hp)\b/i,
    reply: (lang) => t(lang,
      "That's personal and not on the site. If it matters for work, email Rizky.",
      'Itu hal pribadi dan nggak ada di situs. Kalau penting buat urusan kerja, email Rizky aja.'),
  },
];

// Split on sentence ends only: a period followed by a space and a capital,
// digit or quote. Keeps "S.Kom", "Cekat.AI", "0.99" and emails intact.
export function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+(?=["'A-Z0-9])/).map((s) => s.trim()).filter(Boolean);
}

const ROUTES = [
  { id: 'stack', test: /\b(stack|tools?|tech|technolog\w*|skills?|keahlian|kemampuan|teknologi|framework\w*|pakai apa|bahasa pemrograman)\b/i },
  { id: 'now', test: /\b(now|currently|current (job|role|company)|right now|these days|sekarang|saat ini|lagi kerja|cekat)\b/i },
  { id: 'contact', test: /\b(contact|reach|email|e-mail|cv|resume|hubungi|kontak|menghubungi)\b/i },
  { id: 'education', test: /(educat\w*|degree|universit\w*|college|stud(y|ied)|kuliah|pendidikan|kampus|lulusan|bootcamp)\b/i },
  { id: 'identity', test: /\b(who is|who's|tell me about (him|rizky)|siapa|kenalin|perkenalkan)\b/i },
];

function bestSentences(text, query, max = 2, maxChars = 340) {
  const q = new Set(tokenize(query, { expand: true }));
  const sentences = splitSentences(text);
  if (sentences.length <= max) return sentences.join(' ');
  const scored = sentences.map((s, i) => ({ s, i, score: tokenize(s).filter((w) => q.has(w)).length }));
  const top = [...scored].sort((a, b) => b.score - a.score || a.i - b.i).slice(0, max).sort((a, b) => a.i - b.i);
  let out = top.map((x) => x.s).join(' ');
  if (out.length > maxChars) out = out.slice(0, maxChars).replace(/\s+\S*$/, '') + '…';
  return out;
}

function lead(chunk, lang) {
  const m = chunk.meta;
  switch (chunk.kind) {
    case 'project':
      return t(lang, `${m.name} (${m.tag}). From his write-up:`, `${m.name} (${m.tag}). Dari tulisan Rizky:`);
    case 'node':
      return t(lang, `In ${m.project}, the "${m.label}" step:`, `Di ${m.project}, langkah "${m.label}":`);
    case 'role':
      return m.status === 'incoming'
        ? t(lang, `He joins ${m.org} as ${m.title} on ${m.start}.`, `Dia mulai di ${m.org} sebagai ${m.title} tanggal ${m.start}.`)
        : t(lang, `${m.title} at ${m.org}, ${m.period}. What he did there:`, `${m.title} di ${m.org}, ${m.period}. Yang dia kerjakan:`);
    case 'story':
      return t(lang, 'In his own words:', 'Kata Rizky sendiri:');
    case 'principle':
      return t(lang, `${chunk.title}. In his words:`, `${chunk.title}. Kata Rizky:`);
    case 'stack':
      return t(lang, "Here's the stack he lists:", 'Ini stack yang dia pakai:');
    case 'now':
      return t(lang, "Here's where things stand:", 'Posisinya sekarang:');
    case 'contact':
      return t(lang, 'Easiest way to reach him:', 'Cara paling gampang menghubungi dia:');
    case 'education':
      return t(lang, 'Education:', 'Pendidikan:');
    default:
      return '';
  }
}

const FIRST_PERSON = new Set(['story', 'principle', 'project', 'node']);

// Returns { text, sources: [{ title, href }], email?: true }
export function answer(query) {
  const q = String(query ?? '').trim();
  const lang = guessLang(q);
  if (!q) return { text: t(lang, 'Ask me something about his work.', 'Tanya apa aja soal kerjaan Rizky.'), sources: [] };

  const intent = INTENTS.find((i) => i.test.test(q));
  if (intent) return { text: intent.reply(lang), sources: [], email: Boolean(intent.email) };

  const hits = search(q, 5);
  let top = hits[0];

  // Broad questions about him (not about a project) go to the obvious chunk.
  const mentionsProject = CORPUS.some((c) => c.kind === 'project' && q.toLowerCase().includes(c.meta.name.toLowerCase()));
  const route = mentionsProject ? null : ROUTES.find((r) => r.test.test(q));
  if (route) {
    const chunk = CORPUS.find((c) => c.id === route.id);
    if (chunk) top = { chunk, score: Math.max(top?.score ?? 0, MIN_SCORE) };
  }

  // "What is LegalitasAI?" should get the project, not whichever of its
  // pipeline steps happened to score highest.
  if (top?.chunk.kind === 'node') {
    const nodeWords = tokenize(top.chunk.meta.label);
    const asksAboutStep = nodeWords.some((w) => tokenize(q, { expand: true }).includes(w));
    if (!asksAboutStep) {
      const project = CORPUS.find((c) => c.kind === 'project' && c.meta.name === top.chunk.meta.project);
      if (project) top = { ...top, chunk: project };
    }
  }
  if (!top || top.score < MIN_SCORE) {
    return {
      text: t(lang,
        "I couldn't find that on this site. I only know what's written here, so for anything else, email Rizky and he'll answer himself.",
        'Aku nggak nemu itu di situs ini. Aku cuma tahu yang tertulis di sini, jadi untuk hal lain, email Rizky aja, nanti dia jawab sendiri.'),
      sources: [],
      email: true,
    };
  }

  const source = top.chunk.kind === 'project' ? top.chunk.meta.build : top.chunk.text;
  const whole = ['stack', 'now', 'contact', 'education', 'identity'].includes(top.chunk.kind);
  const excerpt = whole ? source : bestSentences(source, q);
  let body = FIRST_PERSON.has(top.chunk.kind) ? `"${excerpt}"` : excerpt;
  if (top.chunk.kind === 'project' && top.chunk.meta.metric && !excerpt.includes(top.chunk.meta.metric.value)) {
    const m = top.chunk.meta.metric;
    body += t(lang, ` The number he leads with: ${m.value}, ${m.label}.`, ` Angka utamanya: ${m.value}, ${m.label}.`);
  }
  const role = top.chunk.kind === 'role' && top.chunk.meta.points.length
    ? top.chunk.meta.points.slice(0, 3).map((p) => `- ${p}`).join('\n')
    : null;

  const text = [lead(top.chunk, lang), role ?? body].filter(Boolean).join(role ? '\n' : ' ');

  const seen = new Set();
  const sources = [top, ...hits]
    .filter((h) => h.score >= top.score * 0.5)
    .map((h) => ({ title: h.chunk.title, href: h.chunk.href }))
    .filter((s) => (seen.has(s.title) ? false : seen.add(s.title)))
    .slice(0, 3);

  return { text, sources };
}

// Top chunks for a query, for keeping a live model's prompt small.
export function retrieve(query, k = 6) {
  return search(query, k).map((h) => h.chunk);
}

export { CORPUS, IDENTITY };
