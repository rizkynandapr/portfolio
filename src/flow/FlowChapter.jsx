import { useRef } from 'react';
import { LAYOUTS } from './layouts/index.js';
import FlowDiagram from './FlowDiagram.jsx';
import useChapter from '../stage/useChapter.js';
import useReducedMotion from '../stage/useReducedMotion.js';
import nodeState from './nodeState.js';
import FlowStepper from './FlowStepper.jsx';
import useIsMobile from '../stage/useIsMobile.js';
import SectionHead from '../ui/SectionHead.jsx';
import './FlowChapter.css';

const VIEWPORT = { width: 520, height: 760 };
const pad = (n) => String(n).padStart(2, '0');

// One project: a static brief (problem, build, stack) followed by a pinned
// trace where scrolling walks the pipeline node by node. Only the trace pins,
// so the prose is read at normal scroll speed and never has to fit a viewport.
export default function FlowChapter({ project, index = 1, nextId }) {
  const traceRef = useRef(null);
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const steps = project.flow.length;
  const active = useChapter({ ref: traceRef, steps, enabled: !reduced && !mobile });

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
          <p className="flow-brief-num mono" aria-hidden="true">SYS-{project.id}</p>
          <h2 id={`work-${project.id}-title`}>{project.name}</h2>
          <p className="flow-brief-tag">{project.tag}</p>

          {project.metric && (
            <div className="flow-brief-metric brackets">
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
        </div>
      </header>

      {mobile ? (
        <div className="flow-trace-mobile">
          <p className="flow-trace-label mono">Trace // <span>{project.flowLabel}</span></p>
          <FlowStepper project={project} />
        </div>
      ) : (
        <div ref={traceRef} className="flow-trace">
          <div className="flow-trace-bar mono">
            <span><span className="flow-trace-key">Trace</span> // <span>{project.flowLabel}</span></span>
            <span className="flow-trace-progress" aria-hidden="true">
              node {pad(active + 1)} / {pad(steps)}
            </span>
            {nextId && !reduced && (
              <a href={`#${nextId}`} className="flow-trace-skip">Skip trace ↓</a>
            )}
          </div>

          <div className="flow-trace-grid">
            <div className="flow-trace-diagram panel brackets">
              <FlowDiagram
                positions={positions}
                activeIndex={active}
                flagIndex={project.flagIndex}
                viewport={VIEWPORT}
              />
            </div>

            <ol className="flow-panes">
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
          </div>
        </div>
      )}
    </section>
  );
}
