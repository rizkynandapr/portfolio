const pad = (n) => String(n).padStart(2, '0');

// Execution log beside the node detail: one line per node as it runs,
// newest at the bottom, like n8n's execution panel. It narrates the run that
// was just triggered; it does not invent timings or item counts.
export default function FlowLog({ log, status, total }) {
  const lines = log.slice(-6);

  return (
    <div className="flow-log" aria-hidden="true">
      <p className="flow-log-head mono">
        <span>Execution log</span>
        <span data-status={status}>
          {status === 'idle' && 'waiting for trigger'}
          {status === 'running' && 'running'}
          {status === 'done' && 'succeeded'}
        </span>
      </p>
      <ol className="flow-log-lines mono">
        {status === 'idle' && (
          <li className="flow-log-line" data-kind="idle">
            <span className="flow-log-i">›</span>
            <span className="flow-log-label">Press Execute workflow to run it</span>
            <span className="flow-log-status" />
          </li>
        )}
        {lines.map((l) => (
          l.kind === 'complete' ? (
            <li key={l.id} className="flow-log-line" data-kind="complete">
              <span className="flow-log-i">✓</span>
              <span className="flow-log-label">Workflow executed · {pad(total)}/{pad(total)} nodes</span>
              <span className="flow-log-status">success</span>
            </li>
          ) : (
            <li key={l.id} className="flow-log-line" data-kind={l.kind}>
              <span className="flow-log-i">{pad(l.node + 1)}</span>
              <span className="flow-log-label">
                {l.label}
                {l.note && <span className="flow-log-note"> → {l.note}</span>}
              </span>
              <span className="flow-log-status">
                {l.kind === 'run' && <>running<span className="flow-log-caret" /></>}
                {l.kind === 'ok' && 'ok'}
                {l.kind === 'retry' && 'citation not found'}
              </span>
            </li>
          )
        ))}
      </ol>
    </div>
  );
}
