import { useState } from 'react';
import nodeState from './nodeState.js';
import './FlowStepper.css';

// Mobile flow: no pinning, no scrub. One node per tap, with the rest of the
// pipeline listed underneath so the shape of the system stays visible.
export default function FlowStepper({ project }) {
  const [step, setStep] = useState(0);
  const total = project.flow.length;
  const isLast = step === total - 1;

  return (
    <div className="flow-stepper">
      <ol className="flow-stepper-bar" aria-hidden="true">
        {project.flow.map((n, i) => (
          <li key={n.label} data-on={i <= step ? 'true' : undefined} />
        ))}
      </ol>

      <ol className="flow-stepper-panes">
        {project.flow.map((n, i) => (
          <li
            key={n.label}
            data-pane={i}
            data-state={nodeState(i, step, project.flagIndex)}
            className="flow-stepper-pane"
          >
            <p className="flow-stepper-counter mono">
              Node {String(i + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
            </p>
            <h3 className="flow-stepper-title">{n.label}</h3>
            <p className="flow-stepper-detail">{n.detail}</p>
          </li>
        ))}
      </ol>

      {!isLast && (
        <button
          type="button"
          className="flow-stepper-next mono"
          onClick={() => setStep((s) => Math.min(s + 1, total - 1))}
        >
          Next node →
        </button>
      )}
    </div>
  );
}
