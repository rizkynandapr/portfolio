import { useMemo, useState } from 'react';
import { buildGraph } from './graph.js';
import FlowCanvas from './FlowCanvas.jsx';
import FlowLog from './FlowLog.jsx';
import useExecution from './useExecution.js';
import useReducedMotion from '../stage/useReducedMotion.js';
import nodeState from './nodeState.js';
import SectionHead from '../ui/SectionHead.jsx';
import ReplayConsole from '../chapters/ReplayConsole.jsx';
import './FlowChapter.css';

const pad = (n) => String(n).padStart(2, '0');

// One project: a brief (problem, build, stack) and its pipeline as an n8n
// style canvas. Nothing moves until the visitor presses Execute workflow;
// any node can be clicked to read what it does.
export default function FlowChapter({ project, index = 1 }) {
  const reduced = useReducedMotion();
  const graph = useMemo(() => buildGraph(project), [project]);
  const exec = useExecution(graph, { reduced });
  const [selected, setSelected] = useState(0);
  const [picked, setPicked] = useState(false);
  const steps = project.flow.length;

  // While a run is going the detail follows the running node, unless the
  // visitor has clicked a node themselves.
  const shown = exec.current >= 0 && !picked ? exec.current : selected;
  const select = (i) => { setSelected(i); setPicked(true); };
  const execute = () => { setPicked(false); exec.execute(); };

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

      <div className="flow-trace panel">
        <div className="flow-trace-bar mono">
          <span className="flow-trace-title"><span className="flow-trace-key">Workflow</span><span>{project.flowLabel}</span></span>
          <span className="flow-trace-status" data-status={exec.status}>
            <span className="flow-trace-dot" />
            {exec.status === 'idle' && 'idle'}
            {exec.status === 'running' && `running · node ${pad(exec.current + 1)} / ${pad(steps)}`}
            {exec.status === 'done' && 'success'}
          </span>
          <span className="flow-trace-note">simulated run</span>
        </div>

        <FlowCanvas
          graph={graph}
          exec={exec}
          selected={shown}
          onSelect={select}
          onExecute={execute}
          name={project.name}
        />

        <div className="flow-trace-grid">
          <ol className="flow-panes" aria-live="polite">
            {project.flow.map((n, i) => (
              <li
                key={n.label}
                data-pane={i}
                data-state={nodeState(i, shown, project.flagIndex)}
                className="flow-pane"
              >
                <p className="flow-pane-counter mono">
                  Node {pad(i + 1)} / {pad(steps)} · {graph.nodes[i].subtitle}
                  {i === project.flagIndex && <span className="flow-pane-flag"> · guardrail</span>}
                </p>
                <h3 className="flow-pane-title">{n.label}</h3>
                <p className="flow-pane-detail">{n.detail}</p>
              </li>
            ))}
          </ol>

          <FlowLog log={exec.log} status={exec.status} total={steps} />
        </div>
      </div>
    </section>
  );
}
