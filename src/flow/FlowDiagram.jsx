import './FlowDiagram.css';

// Renders positioned nodes as ink line-work: a hairline SVG spine with
// open circles, plus a mono label per node. No glow, no fill — the active
// node is marked by filling its circle, nothing else.
export default function FlowDiagram({ positions, activeIndex, flagIndex, viewport }) {
  return (
    <div className="flow-diagram">
      <svg
        className="flow-svg"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {positions.map((p, i) => {
          if (i === 0) return null;
          const prev = positions[i - 1];
          const broken = flagIndex !== undefined && i - 1 === flagIndex;
          return (
            <path
              key={`e${i}`}
              data-edge={i}
              data-broken={broken ? 'true' : undefined}
              className={`flow-edge flow-edge-${p.edge ?? 'straight'}`}
              d={edgePath(prev, p)}
            />
          );
        })}

        {positions.map((p, i) => (
          <circle
            key={`c${i}`}
            className="flow-dot"
            cx={p.x}
            cy={p.y}
            r="5"
            data-dot={i}
            data-state={stateOf(i, activeIndex, flagIndex)}
          />
        ))}
      </svg>

      <ul className="flow-labels">
        {positions.map((p, i) => (
          <li
            key={p.label}
            data-node={i}
            data-state={stateOf(i, activeIndex, flagIndex)}
            className="flow-label mono"
            style={{ '--nx': `${(p.x / viewport.width) * 100}%`, '--ny': `${(p.y / viewport.height) * 100}%` }}
          >
            {p.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function stateOf(i, activeIndex, flagIndex) {
  if (i !== activeIndex) return 'dim';
  return i === flagIndex ? 'flag' : 'active';
}

// A right-angle elbow for forks and merges, a straight line otherwise.
function edgePath(a, b) {
  if (Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}
