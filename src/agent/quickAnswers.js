// Answers for the suggested questions. They come straight from what the site
// already says, so they work instantly, cost nothing, and still work when the
// live model is switched off. Anything else goes to /api/chat.

export const QUICK = [
  {
    q: 'Which project should I look at first?',
    a: "Start with LegalitasAI. It's a RAG assistant for Indonesian business regulations that won't answer unless it can cite the exact Pasal, and a validator checks every citation before the answer goes out. Moving the revoked-regulation filter into the ranking step took Hit Rate@5 from 63.6% to 81.8%.\n\nIf you care more about day-to-day business automation, the WhatsApp AI Chatbot is the one to open next.",
  },
  {
    q: 'How does the WhatsApp agent capture orders?',
    a: "A customer messages the shop on WhatsApp and n8n picks it up. It pulls the last six exchanges for that customer from a Google Sheet, then sends the history and the new message to Claude, which has to reply in JSON: the reply text, whether this is an order, and the order details.\n\nIf it is an order, it goes into an Orders sheet and the owner gets a WhatsApp alert straight away. A separate job runs every morning and nudges leads that went quiet for 24 to 72 hours.",
  },
  {
    q: 'Ceritain LegalitasAI dong',
    a: "LegalitasAI itu asisten RAG buat regulasi usaha di Indonesia. Bedanya dengan chatbot biasa, dia nggak boleh jawab tanpa bukti. Setiap klaim harus menyebut Pasal dan Ayat, lalu ada validator yang ngecek sitasi itu beneran ada di dokumen yang diambil. Kalau nggak bisa dibuktikan, dia menolak jawab.\n\nDatanya PDF hasil scan dari portal pemerintah, jadi sebagian besar kerjanya justru ngakalin OCR yang berantakan. Ada 43 test, CI dengan eval gate, dan Hit Rate@5 naik dari 63,6% ke 81,8%.",
  },
  {
    q: 'What did Rizky do at Aksoro?',
    a: "He was an AI Trainer there from June to September 2026. He wrote and debugged system prompts for client bots that handled FAQs, lead qualification and order tracking, and built the n8n automations that connected those bots to WhatsApp and CRMs. He also reworked knowledge sources and routing so fewer wrong answers got escalated.\n\nThe contract finished in September. He joins the IT Delivery team at Cekat.AI on 5 October.",
  },
];

export const SUGGESTIONS = QUICK.map((x) => x.q);

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const INDEX = new Map(QUICK.map((x) => [norm(x.q), x.a]));

export function findQuickAnswer(text) {
  return INDEX.get(norm(text)) ?? null;
}

export function offlineReply(lang) {
  return lang === 'id'
    ? 'Jawaban live lagi dimatikan, jadi pertanyaan bebas belum bisa aku jawab. Pertanyaan yang ada di bawah tetap jalan. Atau kirim pertanyaanmu langsung ke Rizky lewat email, nanti dia yang jawab.'
    : "Live answers are switched off at the moment, so I can't take free-form questions. The suggested ones below still work, or you can send your question to Rizky by email and he'll answer it himself.";
}

// Rough guess, only used to pick the language of the offline reply.
const ID_WORDS = /\b(apa|gimana|bagaimana|siapa|kenapa|dong|nggak|gak|yang|dan|itu|kak|bisa|ada|kerja|proyek)\b/i;
export function guessLang(text) {
  return ID_WORDS.test(text) ? 'id' : 'en';
}
