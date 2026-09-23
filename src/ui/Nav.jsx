import PROJECTS from '../data/projects.js';
import { IDENTITY } from '../data/profile.js';
import useClock from './useClock.js';
import useScrollSpy from './useScrollSpy.js';
import useTheme from './useTheme.js';
import './Nav.css';

const WORK_IDS = PROJECTS.map((p) => `work-${p.id}`);

const LINKS = [
  { href: '#systems', label: 'Systems', match: ['systems'] },
  { href: '#work-01', label: 'Work', match: WORK_IDS },
  { href: '#stack', label: 'Stack', match: ['stack'] },
  { href: '#about', label: 'About', match: ['about'] },
  { href: '#contact', label: 'Contact', match: ['contact'] },
];

const SPY_IDS = LINKS.flatMap((l) => l.match);

export default function Nav() {
  const time = useClock(IDENTITY.timezone);
  const active = useScrollSpy(SPY_IDS);
  const [theme, toggleTheme] = useTheme();

  return (
    <nav className="nav" aria-label="Primary">
      <a href="#top" className="nav-mark" aria-label={IDENTITY.short}>
        <span className="nav-logo" aria-hidden="true">{IDENTITY.callsign}<span className="nav-logo-dot" /></span>
        <span className="nav-name">Rizky <span className="nav-name-soft">Nanda</span></span>
      </a>

      <ul className="nav-links">
        {LINKS.map((l, i) => {
          const on = l.match.includes(active);
          return (
            <li key={l.href}>
              <a
                href={l.href}
                className={`nav-link mono ${on ? 'is-active' : ''}`}
                aria-current={on ? 'location' : undefined}
              >
                <span className="nav-link-index" aria-hidden="true">0{i + 1}</span>
                {l.label}
              </a>
            </li>
          );
        })}
      </ul>

      <div className="nav-right">
        <span className="nav-clock mono" title="Local time in Yogyakarta">
          <span className="pulse" aria-hidden="true" />
          YOG {time} <span className="nav-tz">UTC+7</span>
        </span>
        <button
          type="button"
          className="nav-icon"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" /></svg>
          )}
        </button>
        <a href={IDENTITY.cv} download className="nav-cv mono">CV ↓</a>
      </div>
    </nav>
  );
}
