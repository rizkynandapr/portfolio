import { EDUCATION, NOW, PRINCIPLES, STORY, TELEMETRY } from '../data/profile.js';
import SectionHead from '../ui/SectionHead.jsx';
import './About.css';

export default function About() {
  return (
    <section id="about" className="chapter about" aria-labelledby="about-title">
      <SectionHead index="04" title="About" meta="Database labs to WhatsApp agents" />

      <div className="about-grid">
        <div className="about-main">
          <h2 id="about-title" className="about-title">From SQL labs to WhatsApp agents.</h2>

          <div className="about-story">
            {STORY.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
          </div>

          <ul className="about-principles">
            {PRINCIPLES.map((pr, i) => (
              <li key={pr.title} className="about-card">
                <span className="about-card-i mono" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                <h3>{pr.title}</h3>
                <p>{pr.body}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="about-now" aria-label="Right now">
          <p className="about-now-label mono"><span className="pulse" aria-hidden="true" /> Right now</p>
          <p className="about-now-status">{NOW.status}</p>
          <p className="about-now-detail">{NOW.detail}</p>

          <dl className="about-now-list">
            <div><dt className="mono">Before</dt><dd>{NOW.previous}</dd></div>
            <div><dt className="mono">Base</dt><dd>{NOW.base}</dd></div>
          </dl>

          <dl className="about-now-metrics">
            {TELEMETRY.slice(0, 4).map((m) => (
              <div key={m.label}>
                <dd>{m.value}</dd>
                <dt className="mono">{m.label}</dt>
              </div>
            ))}
          </dl>

          <ul className="about-edu mono">
            {EDUCATION.map((e) => <li key={e}>{e}</li>)}
          </ul>
        </aside>
      </div>
    </section>
  );
}
