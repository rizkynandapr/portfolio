import { IDENTITY, LINKS } from '../data/profile.js';
import { openAgent } from '../agent/agentBus.js';
import SectionHead from '../ui/SectionHead.jsx';
import CopyEmail from '../ui/CopyEmail.jsx';
import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="chapter contact" aria-label="Contact">
      <SectionHead index="05" title="Open channel" meta="Replies within a day, UTC+7" />

      <h2 className="contact-title">
        Have a broken workflow or an idea worth <span className="contact-signal">automating?</span>
      </h2>

      <div className="contact-actions">
        <CopyEmail email={IDENTITY.email} />
        <button type="button" className="btn" onClick={openAgent}>
          <span className="contact-prompt" aria-hidden="true">&gt;_</span> Ask my agent first
        </button>
      </div>

      <ul className="contact-links mono">
        {LINKS.map((l) => (
          <li key={l.label}><a href={l.href} target="_blank" rel="noopener noreferrer" className="link-arrow">{l.label}</a></li>
        ))}
        <li><a href={IDENTITY.cv} download className="link-arrow">CV ↓</a></li>
      </ul>

      <footer className="contact-foot mono">
        <span>© 2026 {IDENTITY.name}</span>
        <span>{IDENTITY.coords}</span>
        <span>React · GSAP · Vercel</span>
      </footer>
    </section>
  );
}
