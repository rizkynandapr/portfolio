import './chapters.css';

// ROLES  — verbatim from src/components/Experience.jsx:4-37
const ROLES = [
  {
    org: 'Aksoro',
    title: 'AI Trainer',
    period: 'Jun 2026 — Present',
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
    period: 'Dec 2023 — May 2024',
    location: 'Yogyakarta',
    points: [
      'Managed and optimized the database architecture for a team-developed web application',
      'Worked with cross-functional teams to keep data integrity and query performance in check',
    ],
  },
  {
    org: 'Universitas Muhammadiyah Yogyakarta',
    title: 'Teaching Assistant, Database Implementation',
    period: 'Sep 2022 — Jul 2023',
    location: 'Bantul',
    points: [
      'Supported 36 undergraduates through hands-on SQL and database design sessions',
      'Debugged query errors live and coached students on optimization trade-offs',
    ],
  },
];

// GROUPS — verbatim from src/components/Stack.jsx:5-18
const GROUPS = [
  {
    label: 'AI / LLM',
    items: ['Claude API', 'Cekat AI', 'n8n', 'TensorFlow', 'Hugging Face'],
  },
  {
    label: 'Languages & Data',
    items: ['Python', 'SQL', 'Pandas', 'Streamlit'],
  },
  {
    label: 'Web & Infra',
    items: ['React', 'Supabase', 'Vercel'],
  },
];

export default function StackExp() {
  return (
    <section id="stack" className="chapter chapter-stackexp">
      <p className="chapter-mark mono">Stack &amp; Track record</p>

      <div className="stackexp-grid">
        <div>
          <h2 className="stackexp-title">The stack I run daily.</h2>
          <dl className="stackexp-groups">
            {GROUPS.map((g) => (
              <div key={g.label} className="stackexp-row">
                <dt className="mono">{g.label}</dt>
                <dd>{g.items.join(' · ')}</dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="stackexp-title">Where this has actually run.</h2>
          <ol className="stackexp-roles">
            {ROLES.map((r) => (
              <li key={r.org + r.title} className="stackexp-role">
                <p className="mono stackexp-period">{r.period}</p>
                <h3>{r.title}</h3>
                <p className="stackexp-org"><span>{r.org}</span> · {r.location}</p>
                <ul>
                  {r.points.map((pt) => <li key={pt}>{pt}</li>)}
                </ul>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
