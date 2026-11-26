const GLYPHS = '01<>/\\_[]{}#$%&*+=?ABCDEFGHJKLMNPRSTUVXYZ';

// Decodes a label in place, left to right, like a HUD readout locking on.
// Mutates only the existing text node's value, so React keeps its node and
// the final string is always the original.
export function scramble(el, { delay = 0, duration = 650 } = {}) {
  const node = [...el.childNodes].find((n) => n.nodeType === 3);
  if (!node) return () => {};

  const target = node.nodeValue;
  let raf = 0;
  let start = 0;

  const frame = (t) => {
    if (!start) start = t;
    const p = Math.min(1, (t - start) / duration);
    const locked = Math.floor(p * target.length);
    let out = target.slice(0, locked);
    for (let i = locked; i < target.length; i++) {
      out += target[i] === ' ' ? ' ' : GLYPHS[(Math.random() * GLYPHS.length) | 0];
    }
    node.nodeValue = out;
    if (p < 1) raf = requestAnimationFrame(frame);
    else node.nodeValue = target;
  };

  const timer = setTimeout(() => { raf = requestAnimationFrame(frame); }, delay);

  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    node.nodeValue = target;
  };
}
