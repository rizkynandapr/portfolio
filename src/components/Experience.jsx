import { useScrollReveal } from '../hooks/useScrollReveal';
import './Experience.css';

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

export default function Experience() {
  const revealRef = useScrollReveal();
  return (
    <section id="experience" className="section experience">
      <div className="section-head">
        <p className="section-eyebrow">Track record</p>
        <h2 className="section-title">Where this has actually run.</h2>
      </div>

      <div className="timeline" ref={revealRef}>
        {ROLES.map((r, i) => (
          <div key={i} className="timeline-row">
            <div className="timeline-marker">
              <span className="timeline-period mono">{r.period}</span>
              <div className="timeline-line" />
            </div>
            <div className="timeline-content">
              <h3>{r.title}</h3>
              <p className="timeline-org">{r.org} · {r.location}</p>
              <ul>
                {r.points.map((pt, j) => <li key={j}>{pt}</li>)}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
