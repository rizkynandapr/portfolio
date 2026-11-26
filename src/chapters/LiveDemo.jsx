import { useEffect, useRef, useState } from 'react';
import './LiveDemo.css';

const host = (url) => url.replace(/^https:\/\//, '').replace(/\/$/, '');

// The real Hugging Face Space, inside the page. Nothing loads until the
// visitor presses Launch, so the iframe never costs a scroll frame or a
// network request for someone just reading. Closing it unloads it again.
export default function LiveDemo({ project }) {
  const [state, setState] = useState('off'); // off | waking | ready
  const [slow, setSlow] = useState(false);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const launch = () => {
    setState('waking');
    setSlow(false);
    clearTimeout(timer.current);
    // Free Spaces sleep when idle; say so if the wake-up is taking a while.
    timer.current = setTimeout(() => setSlow(true), 8000);
  };
  const close = () => {
    clearTimeout(timer.current);
    setState('off');
  };
  const ready = () => {
    clearTimeout(timer.current);
    setState('ready');
  };

  return (
    <div className="demo" data-state={state}>
      <div className="demo-bar mono">
        <span className="demo-dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="demo-url">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
          {host(project.embed)}
        </span>
        <span className="demo-status" data-state={state}>
          <span className="demo-status-dot" />
          {state === 'off' && 'standby'}
          {state === 'waking' && 'connecting'}
          {state === 'ready' && 'loaded'}
        </span>
        {/* A cross-origin frame never reports its own errors, so always offer the way out. */}
        <a className="demo-open" href={project.links.demo} target="_blank" rel="noopener noreferrer">
          {state === 'ready' ? 'Blank? Open ↗' : 'Open ↗'}
        </a>
        {state !== 'off' && (
          <button type="button" className="demo-close" onClick={close} aria-label={`Close the ${project.name} demo`}>✕</button>
        )}
      </div>

      <div className="demo-screen">
        {state === 'off' ? (
          <div className="demo-idle">
            <span className="demo-orbit" aria-hidden="true"><span /><span /><span /></span>
            <p className="demo-idle-kicker mono">Live model · Hugging Face Space</p>
            <p className="demo-idle-title">Test {project.name} right here</p>
            <p className="demo-idle-note">{project.tryHint}</p>
            <button type="button" className="demo-launch" onClick={launch}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 4.5v15l13-7.5z" /></svg>
              Launch demo
            </button>
            <p className="demo-idle-fine mono">Loads the real app on click · a sleeping Space can take ~30s to wake</p>
          </div>
        ) : (
          <>
            {state === 'waking' && (
              <div className="demo-boot" role="status">
                <span className="demo-boot-bar" aria-hidden="true" />
                <p className="mono">{slow ? 'Waking the Space up, first load after idle is slow…' : `Connecting to ${host(project.embed)}…`}</p>
              </div>
            )}
            <iframe
              className="demo-frame"
              src={project.embed}
              title={`${project.name} live demo`}
              onLoad={ready}
              loading="lazy"
              allow="clipboard-write"
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads"
            />
          </>
        )}
      </div>
    </div>
  );
}
