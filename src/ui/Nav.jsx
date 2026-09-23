import PROJECTS from '../data/projects.js';
import { IDENTITY } from '../data/profile.js';
import useClock from './useClock.js';
import useScrollSpy from './useScrollSpy.js';
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

  return (
    <nav className="nav" aria-label="Primary">
      <a href="#top" className="nav-mark" aria-label={IDENTITY.short}>
        <span className="nav-callsign mono" aria-hidden="true">{IDENTITY.callsign}//</span>
        <span className="nav-name">{IDENTITY.short}</span>
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
        <a href={IDENTITY.cv} download className="nav-cv mono">CV ↓</a>
      </div>
    </nav>
  );
}
