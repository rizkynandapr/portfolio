import { useEffect, useState } from 'react';

const QUERY = '(prefers-reduced-motion: reduce)';

// Live preference — a user can flip this mid-session and the site must follow.
export default function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia(QUERY).matches);

  useEffect(() => {
    const mql = window.matchMedia(QUERY);
    const onChange = (e) => setReduced(e.matches);
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, []);

  return reduced;
}
