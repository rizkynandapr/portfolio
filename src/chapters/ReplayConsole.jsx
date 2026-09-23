import { useEffect, useRef, useState } from 'react';
import useReducedMotion from '../stage/useReducedMotion.js';
import './ReplayConsole.css';

// A scripted replay of the WhatsApp agent's order path, using demo data.
// It shows what the system does — webhook, history, structured model output,
// order capture, owner alert — instead of describing it.
const SCRIPT = [
  { t: '09:41:02', tag: 'wa.in', kind: 'user', text: 'Kak, ponco hijau ukuran L masih ada?' },
  { t: '09:41:02', tag: 'n8n', kind: 'sys', text: 'webhook ok · history(6) loaded' },
  { t: '09:41:04', tag: 'claude', kind: 'json', text: '{ "is_order": false }' },
  { t: '09:41:04', tag: 'wa.out', kind: 'agent', text: 'Masih ada kak, stok L tinggal 4. Mau order berapa?' },
  { t: '09:42:17', tag: 'wa.in', kind: 'user', text: '2 ya kak, kirim ke Sleman' },
  { t: '09:42:19', tag: 'claude', kind: 'json', text: '{ "is_order": true, "qty": 2, "city": "Sleman" }' },
  { t: '09:42:19', tag: 'sheets', kind: 'ok', text: 'Orders.append → row 214' },
  { t: '09:42:20', tag: 'owner', kind: 'ok', text: 'alert sent: 2× Ponco hijau L → Sleman' },
];

const STEP_MS = 1300;
const HOLD_MS = 4200;

export default function ReplayConsole() {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(reduced ? SCRIPT.length : 1);
  const [onScreen, setOnScreen] = useState(true);
  const ref = useRef(null);

  // Pause the replay when it is scrolled away — no timers ticking off-screen.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined' || !ref.current) return undefined;
    const io = new IntersectionObserver(([e]) => setOnScreen(e.isIntersecting));
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (reduced) { setShown(SCRIPT.length); return undefined; }
    if (!onScreen) return undefined;
    const done = shown >= SCRIPT.length;
    const id = setTimeout(() => setShown(done ? 1 : shown + 1), done ? HOLD_MS : STEP_MS);
    return () => clearTimeout(id);
  }, [shown, reduced, onScreen]);

  const running = !reduced && shown < SCRIPT.length;

  return (
    <figure ref={ref} className="replay panel brackets">
      <figcaption className="replay-head mono">
        <span className="replay-title">
          <span className="replay-dot" data-running={running ? 'true' : undefined} aria-hidden="true" />
          replay // wa-agent · order path
        </span>
        <span className="replay-flag">demo data</span>
      </figcaption>

      <ol className="replay-log" aria-label="Replay of the WhatsApp agent capturing an order, with demo data">
        {SCRIPT.map((line, i) => (
          <li
            key={i}
            className="replay-line"
            data-kind={line.kind}
            data-shown={i < shown ? 'true' : undefined}
            aria-hidden={i < shown ? undefined : 'true'}
          >
            <span className="replay-t mono">{line.t}</span>
            <span className="replay-tag mono">{line.tag}</span>
            <span className="replay-text">{line.text}</span>
          </li>
        ))}
      </ol>

      <div className="replay-foot mono" aria-hidden="true">
        <span>{String(Math.min(shown, SCRIPT.length)).padStart(2, '0')} / {String(SCRIPT.length).padStart(2, '0')} events</span>
        <span className="replay-bar"><span style={{ width: `${(shown / SCRIPT.length) * 100}%` }} /></span>
      </div>
    </figure>
  );
}
