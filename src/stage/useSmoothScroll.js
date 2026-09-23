import { useEffect } from 'react';
import Lenis from 'lenis';

// Momentum smooth scrolling. Nothing is pinned or scrubbed any more, so Lenis
// runs its own rAF loop — no GSAP needed. Bails out under reduced motion.
export default function useSmoothScroll() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const lenis = new Lenis({
      duration: 1.05,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // expo-out
      smoothWheel: true,
      autoRaf: true,
    });

    // Route in-page anchor links (href="#systems") through Lenis.
    const onAnchorClick = (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const id = a.getAttribute('href');
      if (id.length <= 1) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -72 }); // clear the fixed nav
    };
    document.addEventListener('click', onAnchorClick);

    return () => {
      document.removeEventListener('click', onAnchorClick);
      lenis.destroy();
    };
  }, []);
}
