import { PAD } from './constants.js';

// LegalitasAI — a straight drop, one column. The plainest rhythm.
export default function vertical(nodes, viewport) {
  const span = viewport.height - PAD * 2;
  const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;
  return nodes.map((n, i) => ({
    ...n,
    x: viewport.width / 2,
    y: PAD + i * step,
    edge: i === 0 ? null : 'straight',
  }));
}
