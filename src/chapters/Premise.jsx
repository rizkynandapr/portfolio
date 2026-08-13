import './chapters.css';

const ROLES = [
  'AI Automation Engineer',
  'n8n Pipeline Builder',
  'LLM Prompt Engineer',
];

export default function Premise() {
  return (
    <section className="chapter chapter-premise">
      <p className="chapter-mark mono">Premise</p>

      <ul className="premise-roles">
        {ROLES.map((r) => <li key={r} className="mono">{r}</li>)}
      </ul>

      <p className="premise-lead">
        I make bots survive real users.
      </p>

      <dl className="premise-metrics">
        <div>
          <dt className="premise-figure">10</dt>
          <dd className="mono">SMB clients shipped</dd>
        </div>
        <div>
          <dt className="premise-figure">80%</dt>
          <dd className="mono">of workflows automated</dd>
        </div>
      </dl>
    </section>
  );
}
