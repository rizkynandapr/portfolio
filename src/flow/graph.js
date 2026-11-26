import { iconFor, kindFor, SUBTITLES } from './nodeIcons.js';

// Canvas geometry, in canvas pixels. The canvas is drawn at this size and
// scaled to fit its container, so every coordinate here is exact.
export const NODE = 64;
const HALF = NODE / 2;
const ROW = 150;
const PAD_X = 80;
const PAD_TOP = 56;
const LABEL_SPACE = 84;
const LOOP_DROP = 104;

// Turns a project's flow + canvas spec into positioned nodes and edges.
//   canvas.at    -> [col, row] per node, same order as project.flow
//   canvas.edges -> [from, to] or [from, to, 'retry'] (a loop back)
export function buildGraph(project) {
  const { flow, canvas } = project;
  const cols = Math.max(...canvas.at.map(([c]) => c));
  const rows = Math.max(...canvas.at.map(([, r]) => r));
  const colW = cols > 0 ? Math.min(220, Math.max(148, 1000 / cols)) : 0;
  const hasLoop = canvas.edges.some((e) => e[2] === 'retry');

  const width = Math.round(cols * colW + PAD_X * 2);
  const height = Math.round(PAD_TOP + rows * ROW + HALF + LABEL_SPACE + (hasLoop ? LOOP_DROP - 30 : 0));

  const incoming = new Set(canvas.edges.filter((e) => e[2] !== 'retry').map((e) => e[1]));

  const nodes = flow.map((n, i) => {
    const [c, r] = canvas.at[i];
    const icon = iconFor(n.label);
    return {
      ...n,
      i,
      x: PAD_X + c * colW,
      y: PAD_TOP + HALF + r * ROW,
      icon,
      kind: kindFor(icon),
      subtitle: SUBTITLES[icon],
      trigger: !incoming.has(i),
    };
  });

  const edges = canvas.edges.map(([from, to, kind], k) => {
    const a = nodes[from];
    const b = nodes[to];
    const geo = kind === 'retry' ? loopPath(a, b) : wirePath(a, b);
    return { key: `${from}-${to}${kind ? `-${kind}` : ''}`, k, from, to, kind: kind ?? 'main', ...geo };
  });

  return { nodes, edges, width, height };
}

// Output port (right edge) to input port (left edge), n8n style.
function wirePath(a, b) {
  const x1 = a.x + HALF;
  const y1 = a.y;
  const x2 = b.x - HALF - 6; // stop short of the port for the arrowhead
  const y2 = b.y;
  const dx = Math.max(46, (x2 - x1) * 0.5);
  const d = `M ${x1} ${y1} C ${x1 + dx} ${y1} ${x2 - dx} ${y2} ${x2} ${y2}`;
  return { d, mid: { x: (x1 + x2) / 2, y: (y1 + y2) / 2 } };
}

// A loop back to an earlier node: out to the right, down under the labels,
// back along the floor, and up into the earlier node's input.
function loopPath(a, b) {
  const ax = a.x + HALF;
  const bx = b.x - HALF - 6;
  const y = a.y;
  const floor = y + LOOP_DROP;
  const r = 34;
  const d = [
    `M ${ax} ${y}`,
    `C ${ax + r} ${y} ${ax + r} ${floor} ${ax} ${floor}`,
    `L ${bx - 4} ${floor}`,
    `C ${bx - 4 - r} ${floor} ${bx - r - 4} ${b.y} ${bx} ${b.y}`,
  ].join(' ');
  return { d, mid: { x: (ax + bx) / 2, y: floor } };
}

// The order things happen in when "Execute workflow" is pressed: each node
// runs, then hands its data down every outgoing wire. A node with a retry
// edge fails its first check, sends work back, and passes the second time —
// the LegalitasAI validator regenerating an answer with a bad citation.
export function buildSchedule(graph) {
  const { nodes, edges } = graph;
  const out = (i) => edges.filter((e) => e.from === i && e.kind === 'main').map((e) => e.k);
  const events = [];

  nodes.forEach((n) => {
    const retry = edges.find((e) => e.from === n.i && e.kind === 'retry');
    events.push({ type: 'run', node: n.i });
    if (retry) {
      events.push({ type: 'retry', node: n.i, edge: retry.k, target: retry.to });
      events.push({ type: 'run', node: retry.to });
      events.push({ type: 'done', node: retry.to, edges: out(retry.to) });
      events.push({ type: 'run', node: n.i });
    }
    events.push({ type: 'done', node: n.i, edges: out(n.i) });
  });

  return events;
}
