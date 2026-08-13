import { useRef } from 'react';
import { LAYOUTS } from './layouts/index.js';
import FlowDiagram from './FlowDiagram.jsx';
import useChapter from '../stage/useChapter.js';
import useReducedMotion from '../stage/useReducedMotion.js';
import './FlowChapter.css';

const VIEWPORT = { width: 520, height: 760 };

export default function FlowChapter({ project }) {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  const steps = project.flow.length;
  const active = useChapter({ ref, steps, enabled: !reduced });

  const layout = LAYOUTS[project.composition];
  const positions = layout(project.flow, VIEWPORT);

  return (
    <section
      ref={ref}
      id={`work-${project.id}`}
      className={`chapter flow-chapter ${reduced ? 'is-static' : ''}`}
    >
      <p className="chapter-mark mono">Work {project.id}</p>

      <div className="flow-chapter-grid">
        <div className="flow-chapter-diagram">
          <FlowDiagram
            positions={positions}
            activeIndex={active}
            flagIndex={project.flagIndex}
            viewport={VIEWPORT}
          />
        </div>

        <div className="flow-chapter-copy">
          <header className="flow-chapter-head">
            <h2>{project.name}</h2>
            <p className="flow-chapter-tag">{project.tag}</p>
            <p className="flow-chapter-period mono">{project.period}</p>
            <p className="flow-chapter-flowlabel mono">{project.flowLabel}</p>
          </header>

          <ol className="flow-panes">
            {project.flow.map((n, i) => (
              <li
                key={n.label}
                data-pane={i}
                data-state={paneState(i, active, project.flagIndex)}
                className="flow-pane"
              >
                <p className="flow-pane-counter mono">
                  Node {String(i + 1).padStart(2, '0')} / {String(steps).padStart(2, '0')}
                </p>
                <h3 className="flow-pane-title">{n.label}</h3>
                <p className="flow-pane-detail">{n.detail}</p>
              </li>
            ))}
          </ol>

          <ul className="flow-chapter-stack">
            {project.stack.map((s) => (
              <li key={s} className="flow-chip mono">{s}</li>
            ))}
          </ul>

          <p className="flow-chapter-links">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="mono">Live demo ↗</a>
            )}
            {project.links.code && (
              <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="mono">Code ↗</a>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}

function paneState(i, active, flagIndex) {
  if (i !== active) return 'dim';
  return i === flagIndex ? 'flag' : 'active';
}
