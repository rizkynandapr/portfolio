import { useState, useEffect } from 'react';
import './Nav.css';

const LINKS = [
  { href: '#work', label: 'Projects' },
  { href: '#experience', label: 'Experience' },
  { href: '#stack', label: 'Stack' },
  { href: '#contact', label: 'Contact' },
];

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <nav className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <a href="#top" className="nav-mark">
          <span className="nav-mark-orb" aria-hidden="true" />
          Rizky Nanda
        </a>
        <div className="nav-links">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">{l.label}</a>
          ))}
        </div>
        <a href="mailto:rizkynandapr@gmail.com" className="nav-cta">Get in touch</a>
        <button className="nav-burger" onClick={() => setOpen(!open)} aria-label="Toggle menu" aria-expanded={open}>
          <span /><span />
        </button>
      </div>
      {open && (
        <div className="nav-mobile">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
          ))}
          <a href="mailto:rizkynandapr@gmail.com" onClick={() => setOpen(false)}>Get in touch</a>
        </div>
      )}
    </nav>
  );
}
