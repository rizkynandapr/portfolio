// Hand-written answers for the suggested questions. Everything else is
// answered by the in-browser search in ./rag (or by /api/chat if a key is set).

export const QUICK = [
  {
    topic: 'Projects',
    q: 'Which project should I look at first?',
    a: "Start with LegalitasAI. It's a RAG assistant for Indonesian business regulations that won't answer unless it can cite the exact Pasal, and a validator checks every citation before the answer goes out. Moving the revoked-regulation filter into the ranking step took Hit Rate@5 from 63.6% to 81.8%.\n\nIf you care more about day-to-day business automation, the WhatsApp AI Chatbot is the one to open next.",
  },
  {
    topic: 'Projects',
    q: 'How does the WhatsApp agent capture orders?',
    a: "A customer messages the shop on WhatsApp and n8n picks it up. It pulls the last six exchanges for that customer from a Google Sheet, then sends the history and the new message to Claude, which has to reply in JSON: the reply text, whether this is an order, and the order details.\n\nIf it is an order, it goes into an Orders sheet and the owner gets a WhatsApp alert straight away. A separate job runs every morning and nudges leads that went quiet for 24 to 72 hours.",
  },
  {
    topic: 'Projects',
    q: 'Ceritain LegalitasAI dong',
    a: "LegalitasAI itu asisten RAG buat regulasi usaha di Indonesia. Bedanya dengan chatbot biasa, dia nggak boleh jawab tanpa bukti. Setiap klaim harus menyebut Pasal dan Ayat, lalu ada validator yang ngecek sitasi itu beneran ada di dokumen yang diambil. Kalau nggak bisa dibuktikan, dia menolak jawab.\n\nDatanya PDF hasil scan dari portal pemerintah, jadi sebagian besar kerjanya justru ngakalin OCR yang berantakan. Ada 43 test, CI dengan eval gate, dan Hit Rate@5 naik dari 63,6% ke 81,8%.",
  },
  {
    topic: 'Experience',
    q: 'What did Rizky do at Aksoro?',
    a: "He was an AI Trainer there from June to September 2026. He wrote and debugged system prompts for client bots that handled FAQs, lead qualification and order tracking, and built the n8n automations that connected those bots to WhatsApp and CRMs. He also reworked knowledge sources and routing so fewer wrong answers got escalated.\n\nThe contract finished in September. Since 5 October he has been on the IT Delivery team at Cekat.AI, setting up client agents in the Cekat dashboard.",
  },
  {
    topic: 'Experience',
    q: 'What does Rizky do at Cekat.AI?',
    a: "He's on the IT Delivery team at Cekat.AI and has been since 5 October 2026. He builds and launches AI customer service agents for client businesses in the Cekat dashboard, from the first system prompt to go-live. He writes and tunes the prompts and knowledge sources behind each agent, connects the agents to client systems with n8n, webhooks and APIs, and is the technical contact for a client while their agent is being set up.",
  },
  {
    topic: 'Experience',
    q: 'Apa pengalaman Rizky sebelum masuk ke AI?',
    a: "Awalnya di database. Di UMY dia jadi asisten dosen mata kuliah Database Implementation, membantu 36 mahasiswa praktik SQL dan desain database, termasuk debug query mereka secara langsung. Setelah itu enam bulan magang sebagai Database Administrator di damirich.id, lalu ikut bootcamp Data Science di Hacktiv8.\n\nModel pertama yang dia taruh online adalah Clickbait Detector di Hugging Face. Dari situ dia pindah ke chatbot dan automation di Aksoro, sekarang di Cekat.AI.",
  },
  {
    topic: 'Projects',
    q: 'What is UMKM-Bench?',
    a: "A small benchmark for one question: what happens to an LLM customer service bot when Indonesian customers type the way they really type on WhatsApp? It has 84 messages to three made-up shops, each written three ways: formal, slang, and slang with typos. 24 of them are traps, like a discount the customer only remembers or a prompt injection.\n\nThere's no LLM judge. A scorer checks intent, product, quantity and city, and whether the reply sticks to the shop data. Across 8 models, the big ones barely noticed the slang, while GPT-5.4 nano dropped from 93 to 78, mostly on the typos.",
  },
  {
    topic: 'Projects',
    q: 'Ceritain RMT52 dong',
    a: "RMT52 itu app estimasi harga rumah di Bandung. Kamu cukup tulis satu kalimat, misalnya \"rumah di dadali, 4 kamar, budget 3m\", lalu app mengisi form-nya sendiri supaya bisa kamu cek. Model XGBoost menghitung harga beserta rentangnya, model KNN mencari area mirip yang lebih murah, dan peta pasar mewarnai tiap kecamatan berdasarkan harga median.\n\nData listing-nya cuma punya satu koordinat per area, jadi Rizky mengecek semuanya ke OpenStreetMap. Ada 10 titik yang salah, salah satunya meleset 35 km. App-nya live di Hugging Face Spaces.",
  },
  {
    topic: 'Projects',
    q: 'Why does the BBCA forecast lose to a naive guess?',
    a: "Because daily stock prices barely move, so \"tomorrow closes where today closed\" is a hard baseline to beat. On the first live run, SARIMA's next-day error was 1.55% MAPE against 1.24% for that naive guess.\n\nRizky left the result on the page on purpose. His old bootcamp notebook claimed 1.99% MAPE, but that test was broken: the model had already seen the test days. The app now runs an honest walk-forward backtest on every press, so anyone can see how the model really does.",
  },
  {
    topic: 'Projects',
    q: 'Which projects can I try live?',
    a: "Three run as live apps on Hugging Face Spaces: RMT52 Bandung Housing, BBCA Forecast Desk and the Clickbait Detector. UMKM-Bench is published as a Kaggle benchmark you can browse. Every project on the page also links to its code on GitHub.",
  },
  {
    topic: 'Projects',
    q: 'How does TalentScout score candidates?',
    a: "It takes two inputs, the candidate's CV and the job description. An LLM reads them side by side, pulls out structured data and runs a gap analysis against the requirements. Then fixed weights turn that into one score: 40% hard skills, 30% experience, 20% education, 10% achievements. The weights stay the same for every candidate, so two people reviewing the same CV get the same number. The result is an HTML dashboard a hiring manager can act on.",
  },
  {
    topic: 'Skills',
    q: 'What does he use day to day?',
    a: "On the AI side: Claude API, Cekat AI, n8n, RAG with BM25 plus dense retrieval, Langfuse, TensorFlow and Hugging Face. For code and data: Python, SQL, Pandas, XGBoost, statsmodels and FastAPI. For web and infra: React, Gradio, Streamlit, Supabase, Qdrant, Docker and Vercel. The channels he connects to are mostly the WhatsApp Cloud API, Google Sheets and webhooks.",
  },
  {
    topic: 'Skills',
    q: 'How does he test his AI systems?',
    a: "He measures them against something, instead of trusting a demo. LegalitasAI has 43 tests and a CI eval gate, and a validator checks every citation before an answer goes out. UMKM-Bench scores replies with rules instead of an LLM judge, so the score doesn't depend on another model's mood. And the BBCA Forecast Desk compares the model with a naive baseline on every run, even when the model loses.",
  },
  {
    topic: 'Skills',
    q: 'Bisa bikin RAG?',
    a: "Bisa. Contoh paling lengkapnya LegalitasAI. Dokumennya dipotong per Pasal supaya satu aturan tidak terbelah, lalu pencariannya menggabungkan BM25 dan embedding dense dengan RRF. Aturan yang sudah dicabut disaring di tahap ranking. Perubahan itu menaikkan Hit Rate@5 dari 63,6% ke 81,8%. Ada juga validator yang mengecek setiap sitasi sebelum jawaban dikirim. Kalau sitasinya tidak bisa dibuktikan, sistemnya menolak menjawab.",
  },
  {
    topic: 'Contact',
    q: 'How can I reach Rizky?',
    a: "Email is fastest: rizkynandapr@gmail.com. He's also on LinkedIn (rizky-nanda-praditia), GitHub (rizkynandapr) and Hugging Face (nandutt). You can download his CV from the button in the top bar.",
  },
  {
    topic: 'Contact',
    q: 'Is he open to other work?',
    a: "This site doesn't say, so it's best to ask him directly. Email rizkynandapr@gmail.com with what you have in mind.",
  },
  {
    topic: 'Contact',
    q: 'How do you answer questions?',
    a: "When the badge at the top says \"site search\", I'm a small search engine running in your browser. Everything on this site is split into short chunks, and your question is matched against them with BM25. A short word list helps Indonesian questions find English text. The suggested questions have answers Rizky wrote himself. If nothing on the site matches, I'll say so and offer to email him. When the badge says \"live\", free-form questions go to Claude, which only gets the parts of this site that match your question.",
  },
];

export const TOPICS = ['Projects', 'Experience', 'Skills', 'Contact'];
export const FEATURED = 4; // shown before "More questions"
export const SUGGESTIONS = QUICK.map((x) => x.q);

const norm = (s) => s.toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
const INDEX = new Map(QUICK.map((x) => [norm(x.q), x.a]));

export function findQuickAnswer(text) {
  return INDEX.get(norm(text)) ?? null;
}
