import { PAD } from './constants.js';

// WhatsApp Chatbot — one message travelling left to right across the stage.
export default function horizontal(nodes, viewport) {
  const span = viewport.width - PAD * 2;
  const step = nodes.length > 1 ? span / (nodes.length - 1) : 0;
  return nodes.map((n, i) => ({
    ...n,
    x: PAD + i * step,
    y: viewport.height / 2,
    edge: i === 0 ? null : 'straight',
  }));
}
