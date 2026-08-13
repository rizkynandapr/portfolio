import nodeState from './nodeState.js';
import './FlowDiagram.css';

// Renders positioned nodes as ink line-work: a hairline SVG spine with
// open circles, plus a mono label per node. No glow, no fill — the active
// node is marked by filling its circle, nothing else.
export default function FlowDiagram({ positions, activeIndex, flagIndex, viewport }) {
  const edges = buildEdges(positions);

  return (
    <div className="flow-diagram">
      <svg
        className="flow-svg"
        viewBox={`0 0 ${viewport.width} ${viewport.height}`}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
      >
        {edges.map(({ from, to, key }) => {
          const broken = flagIndex !== undefined && from === flagIndex;
          return (
            <path
              key={`e${key}`}
              data-edge={key}
              data-broken={broken ? 'true' : undefined}
              className="flow-edge"
              d={edgePath(positions[from], positions[to])}
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
            data-state={nodeState(i, activeIndex, flagIndex)}
          />
        ))}
      </svg>

      {/* Node names are also the pane <h3>; the pane text is the accessible copy. */}
      <ul className="flow-labels" aria-hidden="true">
        {positions.map((p, i) => (
          <li
            key={p.label}
            data-node={i}
            data-state={nodeState(i, activeIndex, flagIndex)}
            data-side={p.x > viewport.width / 2 ? 'right' : 'left'}
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

// Builds the diagram's edge list from each node's own incoming `edge` field
// instead of assuming array adjacency connects every node in sequence:
//   - null      -> nothing feeds this node (a spine origin or a parallel input)
//   - 'straight'-> the ordinary preceding link
//   - 'fork'    -> diverges from the spine origin (positions[0])
//   - 'merge'   -> rejoins from every real preceding input, or the immediate
//                  predecessor when there is only the lone spine origin before it
function buildEdges(positions) {
  const edges = [];

  positions.forEach((p, i) => {
    if (i === 0 || p.edge == null) return;

    if (p.edge === 'fork') {
      edges.push({ from: 0, to: i, key: `${i}` });
      return;
    }

    if (p.edge === 'merge') {
      const nullPreds = [];
      for (let j = 0; j < i; j++) {
        if (positions[j].edge === null) nullPreds.push(j);
      }
      // A single null predecessor is just the spine's own origin, not a
      // genuine second input (branching) — fall back to the immediate
      // predecessor. Two or more null predecessors are real parallel
      // inputs (convergent) and each gets its own edge into the merge node.
      const sources = nullPreds.length > 1 ? nullPreds : [i - 1];
      sources.forEach((from, idx) => edges.push({ from, to: i, key: `${i}-${idx}` }));
      return;
    }

    // 'straight': the immediately preceding node, unless that node is a
    // parallel sibling sharing this node's height (branching's two-abreast
    // rows) — connecting siblings would draw a rung between concurrent
    // tracks instead of a sequential link, so walk back to the last node
    // at a different height.
    let from = i - 1;
    while (from > 0 && positions[from].y === p.y) from -= 1;
    edges.push({ from, to: i, key: `${i}` });
  });

  return edges;
}

// A right-angle elbow for forks and merges, a straight line otherwise.
function edgePath(a, b) {
  if (Math.abs(a.x - b.x) < 0.5 || Math.abs(a.y - b.y) < 0.5) {
    return `M ${a.x} ${a.y} L ${b.x} ${b.y}`;
  }
  const midY = (a.y + b.y) / 2;
  return `M ${a.x} ${a.y} L ${a.x} ${midY} L ${b.x} ${midY} L ${b.x} ${b.y}`;
}
