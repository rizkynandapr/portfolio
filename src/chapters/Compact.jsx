import './chapters.css';

// Clickbait Detector — no pipeline, so no scrub. One card, one number.
export default function Compact({ project }) {
  return (
    <section id={`work-${project.id}`} className="chapter chapter-compact">
      <p className="chapter-mark mono">Work {project.id}</p>

      <h2 className="compact-title">{project.name}</h2>
      <p className="compact-tag">{project.tag}</p>
      <p className="compact-period mono">{project.period}</p>

      <p className="compact-body">{project.problem}</p>
      <p className="compact-body">{project.build}</p>

      <ul className="compact-stack">
        {project.stack.map((s) => <li key={s} className="flow-chip mono">{s}</li>)}
      </ul>

      <p className="compact-links">
        {project.links.demo && (
          <a href={project.links.demo} target="_blank" rel="noopener noreferrer" className="mono">Live demo ↗</a>
        )}
        {project.links.code && (
          <a href={project.links.code} target="_blank" rel="noopener noreferrer" className="mono">Code ↗</a>
        )}
      </p>
    </section>
  );
}
