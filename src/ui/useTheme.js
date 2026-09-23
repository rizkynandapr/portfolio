import { useCallback, useEffect, useState } from 'react';

const read = () => (document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark');

// Theme lives on <html data-theme>. public/theme.js sets it before paint;
// this hook only flips it and remembers the choice (best-effort storage).
export default function useTheme() {
  const [theme, setTheme] = useState(read);

  useEffect(() => {
    const mo = new MutationObserver(() => setTheme(read()));
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => mo.disconnect();
  }, []);

  const toggle = useCallback(() => {
    const next = read() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('theme', next); } catch { /* storage blocked */ }
  }, []);

  return [theme, toggle];
}
