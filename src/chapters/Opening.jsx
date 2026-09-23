import { IDENTITY, LINKS, NOW, TELEMETRY } from '../data/profile.js';
import { openAgent } from '../agent/agentBus.js';
import './Opening.css';

const PROOF = ['WhatsApp agents', 'RAG with guardrails', 'n8n pipelines', 'Evals in CI'];

export default function Opening() {
  return (
    <section id="top" className="chapter opening" aria-labelledby="opening-title">
      <div className="opening-grid">
        <div className="opening-copy">
          <p className="opening-boot">
            <span className="badge">AI Automation</span>
            <span className="mono">Engineer · {IDENTITY.base}</span>
          </p>

          <h1 id="opening-title" className="opening-title">
            I ship AI agents <span className="opening-soft">that survive</span>{' '}
            <span className="opening-signal">real customers.</span>
          </h1>

          <p className="opening-sub">
            I'm {IDENTITY.short}. Most of what I build lives inside WhatsApp: a
            customer sends a message, an agent answers, and the order lands in a
            sheet the owner actually checks. I write the prompts, wire up the n8n
            flows, and stick around until it stops breaking.
          </p>

          <ul className="opening-proof mono">
            {PROOF.map((p) => (
              <li key={p}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12 5 5 9-10" /></svg>
                {p}
              </li>
            ))}
          </ul>

          <div className="opening-actions">
            <a href={`mailto:${IDENTITY.email}`} className="btn btn-primary">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg>
              Email me
            </a>
            <a href={IDENTITY.cv} download className="btn">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" /></svg>
              Download CV
            </a>
            <button type="button" className="btn" onClick={openAgent}>
              <span className="opening-prompt" aria-hidden="true">&gt;_</span>
              Ask my agent
            </button>
          </div>

          <ul className="opening-links mono">
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener noreferrer" className="link-arrow">{l.label} ↗</a>
              </li>
            ))}
          </ul>
        </div>

        <figure className="portrait">
          <div className="portrait-frame">
            <picture>
              <source type="image/webp" srcSet="/img/rizky-640.webp 640w, /img/rizky-986.webp 986w" sizes="(max-width: 900px) 80vw, 460px" />
              <img
                src="/img/rizky-986.jpg"
                width="986"
                height="1114"
                alt="Rizky Nanda Praditia in a batik shirt, smiling and looking to the side"
                fetchPriority="high"
                decoding="async"
              />
            </picture>
            <span className="portrait-scan" aria-hidden="true" />
          </div>

          <figcaption className="portrait-id">
            <span className="portrait-id-name">{IDENTITY.name}</span>
            <span className="portrait-id-role mono">{IDENTITY.role}</span>
          </figcaption>

          <p className="portrait-chip portrait-chip-now">
            <span className="pulse" aria-hidden="true" />
            <span><strong>{NOW.status}</strong> · 5 Oct</span>
          </p>

          <p className="portrait-chip portrait-chip-metric">
            <span className="portrait-chip-value">{TELEMETRY[0].value}</span>
            <span className="mono">{TELEMETRY[0].label}<br />{TELEMETRY[0].context.split(' · ')[0]}</span>
          </p>
        </figure>
      </div>

      <dl className="telemetry" aria-label="Numbers from the projects below">
        {TELEMETRY.map((m, i) => (
          <div key={m.label} className="telemetry-cell">
            <dt className="telemetry-label mono">
              <span className="telemetry-index" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              {m.label}
            </dt>
            <dd className="telemetry-value">{m.value}</dd>
            <dd className="telemetry-context mono">{m.context}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
