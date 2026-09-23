import SectionHead from '../ui/SectionHead.jsx';
import './Compact.css';

// A project with no pipeline to trace — one brief, one number.
export default function Compact({ project, index = 1 }) {
  return (
    <section id={`work-${project.id}`} className="chapter compact" aria-labelledby={`work-${project.id}-title`}>
      <SectionHead index={`02.${index}`} title="Work" meta={`${project.kind ?? 'Project'} · ${project.period}`} />

      <div className="compact-grid">
        <div>
          <p className="compact-num mono" aria-hidden="true">SYS-{project.id}</p>
          <h2 id={`work-${project.id}-title`} className="compact-title">{project.name}</h2>
          <p className="compact-tag">{project.tag}</p>
          <p className="compact-period mono">{project.period}</p>

          {project.metric && (
            <div className="compact-metric">
              <span className="compact-metric-value">{project.metric.value}</span>
              <span className="compact-metric-label mono">{project.metric.label}</span>
            </div>
          )}
        </div>

        <div>
          <p className="compact-body">{project.problem}</p>
          <p className="compact-body">{project.build}</p>

          <ul className="compact-stack">
            {project.stack.map((s) => <li key={s} className="chip">{s}</li>)}
          </ul>

          <p className="compact-links">
            {project.links.demo && (
              <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="btn btn-primary">Live demo ↗</a>
            )}
            {project.links.code && (
              <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="btn">Code ↗</a>
            )}
          </p>
        </div>
      </div>
    </section>
  );
}
