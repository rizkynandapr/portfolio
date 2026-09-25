import { useEffect, useId, useRef, useState } from 'react';
import { IDENTITY } from '../data/profile.js';
import { onAgentOpen } from './agentBus.js';
import askAgent, { agentStatus } from './askAgent.js';
import { SUGGESTIONS, findQuickAnswer } from './quickAnswers.js';
import { answer as localAnswer } from './rag/answer.js';
import './AgentConsole.css';

const MAX_INPUT = 500;
const MAX_TURNS = 12; // keep in step with the server's validation limit
const QUICK_DELAY_MS = 450; // a beat before a quick answer, so it doesn't feel canned

const mailto = (q) =>
  `mailto:${IDENTITY.email}?subject=${encodeURIComponent('Question from your portfolio')}&body=${encodeURIComponent(q)}`;

// Answers come from the site itself: hand-written replies for the suggested
// questions, and an in-browser search (BM25 over the page content) for
// everything else, with links to the sections it quotes. No model, no tokens.
// If ANTHROPIC_API_KEY is ever set on the server, free-form questions go to
// /api/chat instead. Replies render as text nodes, never HTML.
export default function AgentConsole() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState('unknown'); // 'unknown' | 'live' | 'offline'
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const logRef = useRef(null);
  const launcherRef = useRef(null);
  const checked = useRef(false);
  const titleId = useId();

  useEffect(() => onAgentOpen(() => setOpen(true)), []);

  // Ask the server once, on first open, whether live answers are available.
  useEffect(() => {
    if (!open || checked.current) return;
    checked.current = true;
    agentStatus().then(setStatus);
  }, [open]);

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

    const quick = findQuickAnswer(q);
    if (quick) {
      await new Promise((r) => setTimeout(r, QUICK_DELAY_MS));
      setBusy(false);
      setMessages([...history, { role: 'assistant', content: quick }]);
      return;
    }

    const fromSite = () => {
      const a = localAnswer(q);
      return { role: 'assistant', content: a.text, sources: a.sources, email: a.email ? q : undefined };
    };

    if (status !== 'live') {
      await new Promise((r) => setTimeout(r, QUICK_DELAY_MS));
      setBusy(false);
      setMessages([...history, fromSite()]);
      return;
    }

    const res = await askAgent(history);
    setBusy(false);
    if (res.ok) {
      setMessages([...history, { role: 'assistant', content: res.reply }]);
    } else if (res.offline) {
      setStatus('offline');
      setMessages([...history, fromSite()]);
    } else {
      setError(res.error);
      setMessages(history.slice(0, -1)); // keep roles alternating for the next try
      setInput(q);
    }
  }

  const onSubmit = (e) => { e.preventDefault(); send(input); };
  const asked = new Set(messages.filter((m) => m.role === 'user').map((m) => m.content));
  const remaining = SUGGESTIONS.filter((s) => !asked.has(s));

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
          <span className="agent-head-right">
            {status !== 'unknown' && (
              <span className="agent-status" data-status={status}>
                <span className="agent-status-dot" aria-hidden="true" />
                {status === 'live' ? 'live' : 'site search'}
              </span>
            )}
            <button type="button" className="agent-close" onClick={close} aria-label="Close agent">×</button>
          </span>
        </header>

        <div ref={logRef} className="agent-log" data-lenis-prevent aria-live="polite">
          <p className="agent-msg" data-role="assistant">
            Hey. I'm a small agent that knows what's on this site: {IDENTITY.short.split(' ')[0]}'s
            projects, his stack, where he's worked. Ask in English or Bahasa Indonesia.
          </p>

          {messages.map((m, i) => (
            <div key={i} className="agent-msg" data-role={m.role}>
              <span className="agent-who mono">{m.role === 'user' ? 'you' : 'agent'}</span>
              {m.content}
              {m.sources?.length > 0 && (
                <span className="agent-sources">
                  {m.sources.map((src) => (
                    <a key={src.title} href={src.href} className="agent-source mono">↳ {src.title}</a>
                  ))}
                </span>
              )}
              {m.email && (
                <a className="agent-mail mono" href={mailto(m.email)}>Email this question ↗</a>
              )}
            </div>
          ))}

          {busy && <p className="agent-msg agent-thinking mono" data-role="assistant">typing<span aria-hidden="true">…</span></p>}
          {error && <p className="agent-error mono" role="alert">{error}</p>}

          {remaining.length > 0 && !busy && (
            <div className="agent-suggest-wrap">
              {messages.length > 0 && <p className="agent-suggest-label mono">Or try</p>}
              <ul className="agent-suggest" data-compact={messages.length > 0 ? 'true' : undefined}>
                {remaining.map((s) => (
                  <li key={s}>
                    <button type="button" className="agent-chip mono" onClick={() => send(s)}>{s}</button>
                  </li>
                ))}
              </ul>
            </div>
          )}
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

        <p className="agent-note mono">Answers come from this site and can still be wrong. For anything important, email Rizky.</p>
      </section>
    </>
  );
}
