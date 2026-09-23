import { useCallback, useEffect, useRef, useState } from 'react';

// Walks a pipeline node by node on a timer — only while the trace is on
// screen. Picking a node pauses the walk long enough to read, then resumes.
// Disabled (reduced motion, mobile) it stays on node 0 and never ticks.
export default function useAutoplay({ ref, steps, enabled, interval = 2600, resumeAfter = 9000 }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const resume = useRef(null);

  useEffect(() => {
    if (!enabled || !ref.current || typeof IntersectionObserver === 'undefined') return undefined;
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), { threshold: 0.35 });
    io.observe(ref.current);
    return () => io.disconnect();
  }, [ref, enabled]);

  useEffect(() => {
    if (!enabled || paused || !visible || steps < 2) return undefined;
    const t = setInterval(() => setActive((a) => (a + 1) % steps), interval);
    return () => clearInterval(t);
  }, [enabled, paused, visible, steps, interval]);

  useEffect(() => () => clearTimeout(resume.current), []);

  const select = useCallback((i) => {
    setActive(i);
    setPaused(true);
    clearTimeout(resume.current);
    resume.current = setTimeout(() => setPaused(false), resumeAfter);
  }, [resumeAfter]);

  return { active, select, paused, running: enabled && visible && !paused };
}
