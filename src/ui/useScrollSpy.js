import { useEffect, useState } from 'react';

// Reports which of the given section ids currently owns the middle band of
// the viewport. IntersectionObserver only, no scroll listeners.
export default function useScrollSpy(ids) {
  const [active, setActive] = useState(null);
  const key = ids.join('|');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return undefined;
    const els = key.split('|').map((id) => document.getElementById(id)).filter(Boolean);
    if (!els.length) return undefined;

    const visible = new Map();
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) visible.set(e.target.id, e.isIntersecting);
      const first = els.find((el) => visible.get(el.id));
      setActive(first ? first.id : null);
    }, { rootMargin: '-45% 0px -50% 0px' });

    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [key]);

  return active;
}
