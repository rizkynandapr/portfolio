import { PAD } from './constants.js';

// ApplyIQ — the flow splits into genuine parallel work, then rejoins.
// First and last nodes sit alone on the spine; middle nodes alternate between
// a left and a right track. The right track is offset half a row so the two
// tracks interleave rather than sitting level: level pairs collide their
// labels in a column this narrow. Two sustained columns is what reads as
// parallel here, not two dots at matching heights.
export default function branching(nodes, viewport) {
  const last = nodes.length - 1;
  const cx = viewport.width / 2;
  const spread = viewport.width / 5;
  const span = viewport.height - PAD * 2;

  // Fewer than three nodes leaves nothing to run in parallel.
  if (nodes.length <= 2) {
    const step = nodes.length > 1 ? span : 0;
    return nodes.map((n, i) => ({
      ...n,
      x: cx,
      y: PAD + i * step,
      edge: i === 0 ? null : 'straight',
    }));
  }

  const rows = Math.ceil((nodes.length - 2) / 2);
  const step = span / (rows + 1);

  return nodes.map((n, i) => {
    if (i === 0) return { ...n, x: cx, y: PAD, edge: null };
    if (i === last) return { ...n, x: cx, y: PAD + span, edge: 'merge' };

    const m = i - 1;
    const onRightTrack = m % 2 === 1;
    return {
      ...n,
      x: cx + (onRightTrack ? spread : -spread),
      y: PAD + (Math.floor(m / 2) + 1) * step + (onRightTrack ? step * 0.45 : 0),
      edge: m === 0 ? 'fork' : 'straight',
    };
  });
}
