// Everything about Rizky that is not a project. Shared by the UI and by the
// /api/chat knowledge block, so the site and the agent can never disagree.

export const IDENTITY = {
  name: 'Rizky Nanda Praditia',
  short: 'Rizky Nanda',
  callsign: 'RNP',
  role: 'AI Automation Engineer',
  base: 'Yogyakarta, Indonesia',
  coords: '07.80°S 110.36°E',
  timezone: 'Asia/Jakarta',
  email: 'rizkynandapr@gmail.com',
  cv: '/Rizky-Nanda-Praditia-CV.pdf',
};

export const LINKS = [
  { label: 'GitHub', href: 'https://github.com/rizkynandapr' },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/rizky-nanda-praditia/' },
  { label: 'Hugging Face', href: 'https://huggingface.co/nandutt' },
];

// Every figure here is backed by a project write-up on the page.
export const TELEMETRY = [
  { value: '81.8%', label: 'Hit Rate@5', context: 'LegalitasAI · up from 63.6%' },
  { value: '<30m', label: 'Client onboarding', context: 'WhatsApp agent template' },
  { value: '98%', label: 'Model accuracy', context: 'LSTM · ~32k headlines' },
  { value: '43', label: 'Tests in CI', context: 'Eval-gated · 7 ADRs' },
  { value: '10', label: 'SMB clients shipped', context: 'WhatsApp · CRM · n8n' },
  { value: '5', label: 'Systems with public code', context: 'Every repo linked below' },
];

export const ROLES = [
  {
    org: 'Cekat.AI',
    title: 'IT Delivery',
    period: 'Oct 2026',
    start: '5 Oct 2026',
    status: 'incoming',
    location: 'BSD, Tangerang',
    points: [],
  },
  {
    org: 'Aksoro',
    title: 'AI Trainer',
    period: 'Jun – Sep 2026',
    location: 'Yogyakarta',
    points: [
      'Design, write, and debug system prompts for FAQ handling, lead qualification, and order tracking across client accounts',
      'Build n8n automation connecting AI agents to WhatsApp, CRM, and internal client systems',
      'Restructure Knowledge Source and routing logic to cut down on wrong-answer escalations',
      'Iterate on prompts against client feedback and evaluation results, then troubleshoot the API integrations underneath',
    ],
  },
  {
    org: 'damirich.id',
    title: 'Database Administrator (Internship)',
    period: 'Dec 2023 – May 2024',
    location: 'Yogyakarta',
    points: [
      'Managed and optimized the database architecture for a team-developed web application',
      'Worked with cross-functional teams to keep data integrity and query performance in check',
    ],
  },
  {
    org: 'Universitas Muhammadiyah Yogyakarta',
    title: 'Teaching Assistant, Database Implementation',
    period: 'Sep 2022 – Jul 2023',
    location: 'Bantul',
    points: [
      'Supported 36 undergraduates through hands-on SQL and database design sessions',
      'Debugged query errors live and coached students on optimization trade-offs',
    ],
  },
];

export const STACK = [
  { label: 'AI / LLM', items: ['Claude API', 'Cekat AI', 'n8n', 'RAG (BM25 + dense)', 'Langfuse', 'TensorFlow', 'Hugging Face'] },
  { label: 'Languages & Data', items: ['Python', 'SQL', 'Pandas', 'FastAPI', 'Streamlit'] },
  { label: 'Web & Infra', items: ['React', 'Supabase', 'Qdrant', 'Docker', 'Vercel'] },
  { label: 'Channels', items: ['WhatsApp Cloud API', 'Google Sheets', 'Webhooks'] },
];

export const EDUCATION = [
  'S.Kom in Informatics, Universitas Muhammadiyah Yogyakarta',
  'Data Science Bootcamp, Hacktiv8',
];

// Where things stand right now. Shown in the About card and given to the agent.
export const NOW = {
  status: 'Joining Cekat.AI',
  detail: 'IT Delivery team, starting 5 Oct 2026',
  previous: 'AI Trainer at Aksoro, Jun – Sep 2026 (contract finished)',
  base: 'Yogyakarta, heading to BSD in October',
};

// The About story, first person. Every fact here also appears elsewhere on the page.
export const STORY = [
  "I started on the database side. At UMY I was the teaching assistant for Database Implementation, which mostly meant debugging 36 students' SQL live and explaining why one query ran faster than another. After that came six months as a DBA intern at damirich.id, and then Hacktiv8's data science bootcamp. The first model I put online for anyone to try was a clickbait detector on Hugging Face.",
  "Chat pulled me in after that. At Aksoro I wrote and debugged system prompts for client bots that handled FAQs, qualified leads and tracked orders. Most days I'm inside an n8n canvas or a prompt draft, waiting to see what breaks. Something always does. Usually it's one node with a typo in its name, or a prompt that reads fine to me and means something else to the model. Finding that gap is most of the job.",
  "My Aksoro contract finished in September. On 5 October I join the IT Delivery team at Cekat.AI.",
];

export const PRINCIPLES = [
  {
    title: 'Prompts that hold up with real customers',
    body: "When a bot gives a wrong answer, I trace it back to the prompt line or knowledge entry that caused it and fix that. At Aksoro that's how we cut down wrong-answer escalations.",
  },
  {
    title: 'Built on the tools you already use',
    body: 'WhatsApp Cloud API, Google Sheets, a CRM, Supabase. The business keeps its tools and the agent learns to work inside them, so nobody has to change how they run the shop.',
  },
  {
    title: "Proof before anyone trusts it",
    body: "LegalitasAI won't answer if it can't cite the Pasal. Its CI has an eval gate, and seven ADRs record what I tried, what I rejected, and why.",
  },
];
