import { PAD } from './constants.js';

// WhatsApp Chatbot — one message travelling left to right across the stage.
// It also descends as it travels: the diagram column is tall and narrow, so a
// flat row cannot separate nine labels without them colliding. The left-to-right
// drift is what distinguishes this rhythm from the vertical drop.
export default function horizontal(nodes, viewport) {
  const spanX = viewport.width - PAD * 2;
  const spanY = viewport.height - PAD * 2;
  const last = Math.max(nodes.length - 1, 1);

  return nodes.map((n, i) => ({
    ...n,
    x: PAD + (i / last) * spanX,
    y: PAD + (i / last) * spanY,
    edge: i === 0 ? null : 'straight',
  }));
}
