import { lazy, Suspense } from 'react';
import './Hero.css';

const NeuralScene = lazy(() => import('./NeuralScene'));

export default function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-inner">
        <div className="hero-copy">
          <p className="hero-eyebrow mono">
            <span className="hero-status-dot" aria-hidden="true" />
            AI Automation Engineer · Yogyakarta, ID
          </p>
          <h1 className="hero-title">
            Building AI agents<br />
            that work in the<br />
            <span className="hero-holo">real world.</span>
          </h1>
          <p className="hero-sub">
            I'm Rizky Nanda. I design prompts, build n8n pipelines, and connect
            LLMs to the systems businesses already run on — WhatsApp, CRMs,
            databases. Then I stay until it stops breaking.
          </p>
          <div className="hero-actions">
            <a href="#work" className="btn-primary">Explore projects</a>
            <a href="mailto:rizkynandapr@gmail.com" className="btn-ghost">Contact me</a>
          </div>
        </div>

        <div className="hero-visual">
          <Suspense fallback={<div className="neural-scene" aria-hidden="true" />}>
            <NeuralScene />
          </Suspense>
          <p className="hero-hint mono">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20"/></svg>
            drag to rotate
          </p>
        </div>
      </div>

      <div className="hero-scroll-cue mono" aria-hidden="true">scroll ↓</div>
    </section>
  );
}
