// Pointer-driven touches: a spotlight that follows the cursor across cards,
// a gentle 3D tilt on the portrait, and buttons that lean toward the cursor.
// Fine pointers only — touch screens get none of it.
const SPOT = '.systems-row, .about-card, .telemetry-cell, .stackexp-role, .flow-brief-metric, .compact-metric, .about-now';
const MAGNET = '.opening-actions .btn, .contact-actions .btn, .nav-cv';

export function startPointer(root = document) {
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return () => {};

  const spots = [...root.querySelectorAll(SPOT)];
  spots.forEach((el) => el.classList.add('spot'));

  const portrait = root.querySelector('.portrait');
  const magnets = [...root.querySelectorAll(MAGNET)];

  let raf = 0;
  let last = null;

  const apply = () => {
    raf = 0;
    const e = last;
    if (!e) return;

    const spot = e.target.closest?.('.spot');
    if (spot) {
      const r = spot.getBoundingClientRect();
      spot.style.setProperty('--mx', `${e.clientX - r.left}px`);
      spot.style.setProperty('--my', `${e.clientY - r.top}px`);
    }

    if (portrait) {
      const r = portrait.getBoundingClientRect();
      const inside = e.clientX > r.left - 40 && e.clientX < r.right + 40 && e.clientY > r.top - 40 && e.clientY < r.bottom + 40;
      if (inside) {
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        portrait.style.setProperty('--rx', `${(-ny * 7).toFixed(2)}deg`);
        portrait.style.setProperty('--ry', `${(nx * 9).toFixed(2)}deg`);
        portrait.style.setProperty('--gx', `${((nx + 0.5) * 100).toFixed(1)}%`);
        portrait.style.setProperty('--gy', `${((ny + 0.5) * 100).toFixed(1)}%`);
        portrait.style.setProperty('--px', (nx * 14).toFixed(1));
        portrait.style.setProperty('--py', (ny * 10).toFixed(1));
        portrait.dataset.tilt = '';
      } else if (portrait.dataset.tilt !== undefined) {
        resetPortrait(portrait);
      }
    }

    for (const b of magnets) {
      const r = b.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dx = e.clientX - cx;
      const dy = e.clientY - cy;
      const near = Math.abs(dx) < r.width / 2 + 24 && Math.abs(dy) < r.height / 2 + 24;
      b.style.translate = near ? `${(dx * 0.18).toFixed(1)}px ${(dy * 0.28).toFixed(1)}px` : '';
    }
  };

  const onMove = (e) => {
    last = e;
    if (!raf) raf = requestAnimationFrame(apply);
  };
  const onLeave = () => { if (portrait) resetPortrait(portrait); };

  document.addEventListener('pointermove', onMove, { passive: true });
  document.documentElement.addEventListener('pointerleave', onLeave);

  return () => {
    cancelAnimationFrame(raf);
    document.removeEventListener('pointermove', onMove);
    document.documentElement.removeEventListener('pointerleave', onLeave);
    spots.forEach((el) => el.classList.remove('spot'));
    magnets.forEach((b) => { b.style.translate = ''; });
    if (portrait) resetPortrait(portrait);
  };
}

function resetPortrait(el) {
  ['--rx', '--ry', '--gx', '--gy', '--px', '--py'].forEach((k) => el.style.removeProperty(k));
  delete el.dataset.tilt;
}
