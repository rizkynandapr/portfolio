import { useLayoutEffect } from 'react';
import useReducedMotion from '../stage/useReducedMotion.js';
import { startReveal } from './reveal.js';
import { startPointer } from './pointer.js';
import './motion.css';

// One switch for every page-level effect. Runs in a layout effect so targets
// are tagged before first paint (no flash of content that then hides), and
// tears everything down — restoring original text — the moment the visitor
// asks for reduced motion.
export default function useMotion() {
  const reduced = useReducedMotion();

  useLayoutEffect(() => {
    // Scroll progress runs regardless: it is position feedback, not motion.
    const root = document.documentElement;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = root.scrollHeight - window.innerHeight;
      root.style.setProperty('--progress', max > 0 ? (window.scrollY / max).toFixed(4) : '0');
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  useLayoutEffect(() => {
    if (reduced) return undefined;
    const stopReveal = startReveal();
    const stopPointer = startPointer();
    return () => {
      stopReveal();
      stopPointer();
    };
  }, [reduced]);
}
