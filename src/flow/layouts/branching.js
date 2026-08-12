import { PAD } from './constants.js';

// ApplyIQ — the flow splits into parallel work, then rejoins at the end.
// First and last nodes sit on the centre line; middle nodes alternate sides.
export default function branching(nodes, viewport) {
  const span = viewport.height - PAD * 2;
  const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;
  const cx = viewport.width / 2;
  const spread = viewport.width / 5;
  const last = nodes.length - 1;

  return nodes.map((n, i) => {
    const onSpine = i === 0 || i === last;
    return {
      ...n,
      x: onSpine ? cx : cx + (i % 2 === 0 ? -spread : spread),
      y: PAD + i * step,
      edge: i === 0 ? null : i === last ? 'merge' : 'fork',
    };
  });
}
