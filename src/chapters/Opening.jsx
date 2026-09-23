import { IDENTITY, LINKS, TELEMETRY } from '../data/profile.js';
import { lazy, Suspense } from 'react';
import { openAgent } from '../agent/agentBus.js';
import './Opening.css';

// three.js is ~half the JS weight — load it after the page is interactive.
const NeuralScene = lazy(() => import('./NeuralScene.jsx'));

const PROOF = ['WhatsApp agents', 'RAG with guardrails', 'n8n pipelines'];

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
            I'm {IDENTITY.short}. I design prompts, build n8n pipelines, and connect
            LLMs to the systems businesses already run on — WhatsApp, CRMs,
            databases. Then I stay until it stops breaking.
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
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><rect x="3" y="5" width="18" height="14" /><path d="m3 7 9 6 9-6" /></svg>
              Email me
            </a>
            <a href={IDENTITY.cv} download className="btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16" /></svg>
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

        <div className="opening-visual" aria-hidden="true">
          <Suspense fallback={<div className="neural-scene" />}>
            <NeuralScene />
          </Suspense>
          <p className="opening-hint mono">
            <span className="pulse" /> drag to rotate · {IDENTITY.coords}
          </p>
        </div>
      </div>

      <dl className="telemetry" aria-label="Telemetry">
        {TELEMETRY.map((m, i) => (
          <div key={m.label} className="telemetry-cell">
            <dt className="telemetry-label mono">
              <span className="telemetry-index" aria-hidden="true">T{String(i + 1).padStart(2, '0')}</span>
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
