// Counts a metric up from zero when it scrolls into view. Only plain single
// numbers count ("81.8%", "<30m", "15"); compound values ("93 → 78",
// "40/30/20/10") are left exactly as written.
const SINGLE = /^([^\d]*?)(\d+(?:\.\d+)?)([^\d]*)$/;

const easeOutExpo = (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));

export function prepareCount(el) {
  const node = [...el.childNodes].find((n) => n.nodeType === 3);
  if (!node) return null;
  const original = node.nodeValue;
  const m = original.trim().match(SINGLE);
  if (!m) return null;

  const [, prefix, num, suffix] = m;
  const decimals = (num.split('.')[1] || '').length;
  const value = Number(num);
  const format = (v) => `${prefix}${v.toFixed(decimals)}${suffix}`;

  node.nodeValue = format(0);

  // Stagger siblings in the same row of instruments.
  const siblings = el.closest('.telemetry-cell, li, div')?.parentElement?.children;
  const index = siblings ? [...siblings].indexOf(el.closest('.telemetry-cell, li, div')) : 0;
  const delay = (el.closest('.opening') ? 900 : 120) + Math.max(index, 0) * 90;

  return {
    el,
    run: { node, value, format, delay, original },
    restore: () => { node.nodeValue = original; },
  };
}

export function runCount({ run }) {
  const { node, value, format, delay, original } = run;
  const duration = 1300;
  let raf = 0;
  let start = 0;

  const frame = (t) => {
    if (!start) start = t;
    const p = Math.min(1, (t - start) / duration);
    node.nodeValue = p < 1 ? format(value * easeOutExpo(p)) : original;
    if (p < 1) raf = requestAnimationFrame(frame);
  };
  const timer = setTimeout(() => { raf = requestAnimationFrame(frame); }, delay);

  return () => {
    clearTimeout(timer);
    cancelAnimationFrame(raf);
    node.nodeValue = original;
  };
}
