import './Nav.css';

const LINKS = [
  { href: '#work-01', label: 'Work' },
  { href: '#stack', label: 'Stack' },
  { href: '#about', label: 'About' },
];

export default function Nav() {
  return (
    <nav className="nav">
      <a href="#top" className="nav-mark">Rizky Nanda</a>
      <ul className="nav-links">
        {LINKS.map((l) => (
          <li key={l.href}><a href={l.href} className="nav-link mono">{l.label}</a></li>
        ))}
        <li>
          <a href="/Rizky-Nanda-Praditia-CV.pdf" download className="nav-link nav-cv mono">CV ↓</a>
        </li>
      </ul>
    </nav>
  );
}
