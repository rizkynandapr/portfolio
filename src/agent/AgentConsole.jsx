import { useEffect, useId, useRef, useState } from 'react';
import { IDENTITY } from '../data/profile.js';
import { onAgentOpen } from './agentBus.js';
import askAgent from './askAgent.js';
import './AgentConsole.css';

const MAX_INPUT = 500;
const MAX_TURNS = 12; // keep in step with the server's validation limit

const SUGGESTIONS = [
  'What is the strongest project here?',
  'How does the WhatsApp agent capture orders?',
  'Ceritain LegalitasAI dong',
  'What has Rizky shipped with RAG?',
];

// Replies render as plain text nodes — never as HTML — so model output can't
// inject markup into the page.
export default function AgentConsole() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const launcherRef = useRef(null);
  const titleId = useId();

  useEffect(() => onAgentOpen(() => setOpen(true)), []);

  useEffect(() => {
    if (!open) return undefined;
    inputRef.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') close(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, busy, error]);

  function close() {
    setOpen(false);
    launcherRef.current?.focus();
  }

  async function send(text) {
    const q = text.trim().slice(0, MAX_INPUT);
    if (!q || busy) return;

    // Drop the oldest exchange once the window is full; the server rejects more.
    let history = [...messages, { role: 'user', content: q }];
    while (history.length > MAX_TURNS - 1) history = history.slice(2);

    setMessages(history);
    setInput('');
    setError('');
    setBusy(true);

    const res = await askAgent(history);
    setBusy(false);
    if (res.ok) {
      setMessages([...history, { role: 'assistant', content: res.reply }]);
    } else {
      setError(res.error);
      setMessages(history.slice(0, -1)); // keep roles alternating for the next try
      setInput(q);
    }
  }

  const onSubmit = (e) => { e.preventDefault(); send(input); };

  return (
    <>
      <button
        ref={launcherRef}
        type="button"
        className="agent-launcher mono"
        aria-expanded={open}
        aria-controls="agent-console"
        onClick={() => (open ? close() : setOpen(true))}
        data-open={open ? 'true' : undefined}
      >
        <span className="pulse" aria-hidden="true" />
        {open ? 'Close agent' : 'Ask my agent'}
      </button>

      <section
        id="agent-console"
        className="agent"
        role="dialog"
        aria-modal="false"
        aria-labelledby={titleId}
        hidden={!open}
      >
        <header className="agent-head mono">
          <span id={titleId}><span className="agent-key">agent</span> // rnp-assistant</span>
          <button type="button" className="agent-close" onClick={close} aria-label="Close agent">×</button>
        </header>

        <div ref={logRef} className="agent-log" data-lenis-prevent aria-live="polite">
          <p className="agent-msg" data-role="assistant">
            Hi — I'm {IDENTITY.short}'s portfolio agent. Ask me about his projects,
            stack or experience. English or Bahasa Indonesia both work.
          </p>

          {messages.length === 0 && (
            <ul className="agent-suggest">
              {SUGGESTIONS.map((s) => (
                <li key={s}>
                  <button type="button" className="agent-chip mono" onClick={() => send(s)}>{s}</button>
                </li>
              ))}
            </ul>
          )}

          {messages.map((m, i) => (
            <p key={i} className="agent-msg" data-role={m.role}>
              <span className="agent-who mono">{m.role === 'user' ? 'you' : 'agent'}</span>
              {m.content}
            </p>
          ))}

          {busy && <p className="agent-msg agent-thinking mono" data-role="assistant">thinking<span aria-hidden="true">…</span></p>}
          {error && <p className="agent-error mono" role="alert">{error}</p>}
        </div>

        <form className="agent-form" onSubmit={onSubmit}>
          <label htmlFor="agent-input" className="sr-only">Ask about Rizky's work</label>
          <span className="agent-caret mono" aria-hidden="true">&gt;</span>
          <input
            id="agent-input"
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            maxLength={MAX_INPUT}
            placeholder="Ask about projects, stack, experience…"
            autoComplete="off"
            disabled={busy}
          />
          <button type="submit" className="agent-send mono" disabled={busy || !input.trim()}>Send</button>
        </form>

        <p className="agent-note mono">AI answers from this site's content — can be wrong. Email for anything that matters.</p>
      </section>
    </>
  );
}
