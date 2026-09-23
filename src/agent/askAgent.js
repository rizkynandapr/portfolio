// Client for /api/chat. Maps every failure to a message a visitor can act on.
const TIMEOUT_MS = 25_000;

const ERRORS = {
  429: 'Too many questions in a row. Give it a minute, or email Rizky directly.',
  503: 'The agent is offline right now. Email still works.',
  504: 'That took too long. Try a shorter question?',
};

export default async function askAgent(messages) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages }),
      signal: ctrl.signal,
      credentials: 'same-origin',
    });
    if (!res.ok) {
      return { ok: false, error: ERRORS[res.status] || 'Something broke on my end. Email works while I fix it.' };
    }
    const data = await res.json();
    if (typeof data?.reply !== 'string') return { ok: false, error: 'Empty reply. Try asking again.' };
    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: 'Could not reach the agent. Check your connection, or email instead.' };
  } finally {
    clearTimeout(timer);
  }
}
