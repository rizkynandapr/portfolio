// Client for /api/chat and /api/status. Every failure maps to something a
// visitor can act on.
const TIMEOUT_MS = 25_000;

const ERRORS = {
  429: 'Too many questions in a row. Give it a minute, or email Rizky directly.',
  504: 'That took too long. Try a shorter question?',
};

export async function agentStatus() {
  try {
    const res = await fetch('/api/status', { credentials: 'same-origin' });
    if (!res.ok) return 'unknown';
    const data = await res.json();
    return data?.live ? 'live' : 'offline';
  } catch {
    return 'unknown';
  }
}

export default async function askAgent(messages) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: messages.map(({ role, content }) => ({ role, content })) }),
      signal: ctrl.signal,
      credentials: 'same-origin',
    });
    if (res.status === 503) return { ok: false, offline: true };
    if (!res.ok) {
      return { ok: false, error: ERRORS[res.status] || 'Something broke on my end. Email works while I fix it.' };
    }
    const data = await res.json();
    if (typeof data?.reply !== 'string') return { ok: false, error: 'Empty reply. Try asking again.' };
    return { ok: true, reply: data.reply };
  } catch {
    return { ok: false, error: "Couldn't reach the agent. Check your connection, or email instead." };
  } finally {
    clearTimeout(timer);
  }
}
