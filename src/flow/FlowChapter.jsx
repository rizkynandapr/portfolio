import { useRef } from 'react';
import { LAYOUTS } from './layouts/index.js';
import FlowDiagram from './FlowDiagram.jsx';
import useAutoplay from './useAutoplay.js';
import useReducedMotion from '../stage/useReducedMotion.js';
import nodeState from './nodeState.js';
import FlowStepper from './FlowStepper.jsx';
import useIsMobile from '../stage/useIsMobile.js';
import SectionHead from '../ui/SectionHead.jsx';
import ReplayConsole from '../chapters/ReplayConsole.jsx';
import './FlowChapter.css';

const VIEWPORT = { width: 520, height: 760 };
const pad = (n) => String(n).padStart(2, '0');

// One project: a brief (problem, build, stack) and a trace that walks the
// real pipeline on its own. Nothing pins or hijacks scroll — the trace runs
// while it is on screen and any node can be picked to pause and read.
export default function FlowChapter({ project, index = 1 }) {
  const traceRef = useRef(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const steps = project.flow.length;
  const { active, select, paused } = useAutoplay({ ref: traceRef, steps, enabled: !reduced && !mobile });

  const layout = LAYOUTS[project.composition];
  const positions = layout(project.flow, VIEWPORT);

  return (
    <section
      id={`work-${project.id}`}
      className={`chapter flow-chapter ${reduced ? 'is-static' : ''}`}
      aria-labelledby={`work-${project.id}-title`}
    >
      <SectionHead index={`02.${index}`} title="Work" meta={`${project.kind ?? 'Project'} · ${project.period}`} />

      <header className="flow-brief">
        <div className="flow-brief-id">
          <p className="flow-brief-num"><span className="badge">SYS-{project.id}</span></p>
          <h2 id={`work-${project.id}-title`}>{project.name}</h2>
          <p className="flow-brief-tag">{project.tag}</p>

          {project.metric && (
            <div className="flow-brief-metric">
              <span className="flow-brief-metric-value">{project.metric.value}</span>
              <span className="flow-brief-metric-label mono">{project.metric.label}</span>
            </div>
          )}

          <ul className="flow-stack">
            {project.stack.map((s) => <li key={s} className="chip">{s}</li>)}
          </ul>

          <p className="flow-links">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="link-arrow mono">Live demo ↗</a>
            )}
            {project.links.code && (
              <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="link-arrow mono">Code ↗</a>
            )}
          </p>
        </div>

        <div className="flow-brief-prose">
          <p className="mono flow-eyebrow">The problem</p>
          <p className="flow-body">{project.problem}</p>
          <p className="mono flow-eyebrow">What I built</p>
          <p className="flow-body">{project.build}</p>
          {project.showcase === 'replay' && (
            <div className="flow-showcase"><ReplayConsole /></div>
          )}
        </div>
      </header>

      {mobile ? (
        <div className="flow-trace-mobile">
          <p className="flow-trace-label mono">Trace · <span>{project.flowLabel}</span></p>
          <FlowStepper project={project} />
        </div>
      ) : (
        <div ref={traceRef} className="flow-trace panel">
          <div className="flow-trace-bar mono">
            <span className="flow-trace-title"><span className="flow-trace-key">Trace</span><span>{project.flowLabel}</span></span>
            {!reduced && (
              <span className="flow-trace-status" data-paused={paused ? 'true' : undefined} aria-hidden="true">
                <span className="flow-trace-dot" />{paused ? 'paused' : 'running'}
              </span>
            )}
            <span className="flow-trace-progress" aria-hidden="true">
              node {pad(active + 1)} / {pad(steps)}
            </span>
          </div>

          <div className="flow-trace-grid">
            <div className="flow-trace-diagram">
              <FlowDiagram
                positions={positions}
                activeIndex={reduced ? -1 : active}
                flagIndex={project.flagIndex}
                viewport={VIEWPORT}
                onSelect={reduced ? undefined : select}
              />
            </div>

            <div className="flow-trace-side">
              <ol className="flow-panes" aria-live="polite">
                {project.flow.map((n, i) => (
                  <li
                    key={n.label}
                    data-pane={i}
                    data-state={nodeState(i, active, project.flagIndex)}
                    className="flow-pane"
                  >
                    <p className="flow-pane-counter mono">
                      Node {pad(i + 1)} / {pad(steps)}
                      {i === project.flagIndex && <span className="flow-pane-flag"> · guardrail</span>}
                    </p>
                    <h3 className="flow-pane-title">{n.label}</h3>
                    <p className="flow-pane-detail">{n.detail}</p>
                  </li>
                ))}
              </ol>

              {!reduced && (
                <ol className="flow-nodes" aria-label={`${project.name} pipeline nodes`}>
                  {project.flow.map((n, i) => (
                    <li key={n.label}>
                      <button
                        type="button"
                        className="flow-node mono"
                        data-state={nodeState(i, active, project.flagIndex)}
                        data-done={i < active ? 'true' : undefined}
                        aria-pressed={i === active}
                        onClick={() => select(i)}
                      >
                        <span className="flow-node-i">{pad(i + 1)}</span>
                        <span className="flow-node-label">{n.label}</span>
                      </button>
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
