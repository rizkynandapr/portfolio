import { ROLES, STACK } from '../data/profile.js';
import SectionHead from '../ui/SectionHead.jsx';
import './StackExp.css';

export default function StackExp() {
  return (
    <section id="stack" className="chapter stackexp" aria-label="Stack and mission log">
      <SectionHead index="03" title="Stack & mission log" meta="Tools in daily use · where they ran" />

      <div className="stackexp-grid">
        <div>
          <h2 className="stackexp-title">The stack I run daily.</h2>
          <dl className="stackexp-groups">
            {STACK.map((g) => (
              <div key={g.label} className="stackexp-row">
                <dt className="mono">{g.label}</dt>
                <dd>
                  <ul className="stackexp-items">
                    {g.items.map((it) => <li key={it} className="chip">{it}</li>)}
                  </ul>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <div>
          <h2 className="stackexp-title">Where this has actually run.</h2>
          <ol className="stackexp-roles">
            {ROLES.map((r) => (
              <li key={r.org + r.title} className="stackexp-role" data-status={r.status}>
                <p className="stackexp-period mono">
                  {r.status === 'incoming'
                    ? <><span className="pulse" aria-hidden="true" /> Incoming · starts {r.start ?? r.period}</>
                    : r.period}
                </p>
                <h3>{r.title}</h3>
                <p className="stackexp-org"><span>{r.org}</span> · {r.location}</p>
                {r.points.length > 0 && (
                  <ul className="stackexp-points">
                    {r.points.map((pt) => <li key={pt}>{pt}</li>)}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
