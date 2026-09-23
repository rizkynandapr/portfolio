import PROJECTS from '../data/projects.js';
import SectionHead from '../ui/SectionHead.jsx';
import './SystemsIndex.css';

// Every system on one screen, so a skimming reader sees the whole body of
// work before committing to any single pipeline walk-through.
export default function SystemsIndex() {
  return (
    <section id="systems" className="chapter systems" aria-labelledby="systems-title">
      <SectionHead index="01" title="Systems index" meta={`${PROJECTS.length} systems · public code`} />

      <h2 id="systems-title" className="systems-title">
        Things I built because the manual version got old.
      </h2>

      <ol className="systems-list">
        {PROJECTS.map((p) => (
          <li key={p.id}>
            <a href={`#work-${p.id}`} className="systems-row">
              <span className="systems-id mono">{p.id}</span>
              <span className="systems-name">
                <span className="systems-name-main">{p.name}</span>
                <span className="systems-tag">{p.tag}</span>
              </span>
              <span className="systems-kind mono">{p.kind}</span>
              <span className="systems-metric">
                <span className="systems-metric-value">{p.metric.value}</span>
                <span className="systems-metric-label mono">{p.metric.label}</span>
              </span>
              <span className="systems-go mono" aria-hidden="true">
                {p.flow ? 'Trace' : 'Open'} →
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
