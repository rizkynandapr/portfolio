import { useState, useEffect, useRef } from 'react';
import './WorkflowDiagram.css';

// Auto-playing pipeline diagram. The active node advances on its own,
// with an animated dash-flow on the connector it just crossed.
// Clicking a node pauses autoplay for a while so people can read.
export default function WorkflowDiagram({ steps }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const resumeTimer = useRef(null);

  useEffect(() => {
    if (paused) return;
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return;
    const t = setInterval(() => {
      setActive((a) => (a + 1) % steps.length);
    }, 2600);
    return () => clearInterval(t);
  }, [paused, steps.length]);

  const handleClick = (i) => {
    setActive(i);
    setPaused(true);
    clearTimeout(resumeTimer.current);
    resumeTimer.current = setTimeout(() => setPaused(false), 9000);
  };

  useEffect(() => () => clearTimeout(resumeTimer.current), []);

  return (
    <div className="workflow-diagram">
      <div className="workflow-status mono">
        <span className={`workflow-status-dot ${paused ? 'is-paused' : ''}`} aria-hidden="true" />
        {paused ? 'paused — resumes shortly' : 'running'}
      </div>
      <div className="workflow-nodes">
        {steps.map((s, i) => (
          <div key={s.label} className="workflow-node-wrap">
            <button
              className={`workflow-node ${active === i ? 'workflow-node-active' : ''} ${i < active ? 'workflow-node-done' : ''}`}
              onClick={() => handleClick(i)}
              aria-pressed={active === i}
            >
              <span className="workflow-node-index mono">{String(i + 1).padStart(2, '0')}</span>
              <span className="workflow-node-label">{s.label}</span>
            </button>
            {i < steps.length - 1 && (
              <svg
                className={`workflow-arrow ${active === i ? 'workflow-arrow-flowing' : ''}`}
                width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"
              >
                <line x1="0" y1="5" x2="19" y2="5" className="workflow-arrow-line" />
                <path d="M18 1l5 4-5 4" fill="none" className="workflow-arrow-head" />
              </svg>
            )}
          </div>
        ))}
      </div>
      <div className="workflow-detail" key={active}>
        <p className="workflow-detail-text">{steps[active].detail}</p>
      </div>
    </div>
  );
}
