// Request validation for /api/chat. Everything the client sends is untrusted:
// shape, roles, ordering and length are all checked before a token is spent.

export const LIMITS = {
  maxMessages: 12,
  maxUserChars: 600,
  maxAssistantChars: 2000,
  maxTotalChars: 8000,
};

// Strip control characters except newline and tab.
// eslint-disable-next-line no-control-regex -- stripping control chars is the point
const CONTROL = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function validateMessages(input) {
  if (!Array.isArray(input) || input.length === 0) return fail('messages must be a non-empty array');
  if (input.length > LIMITS.maxMessages) return fail('too many messages');

  const clean = [];
  let total = 0;

  for (let i = 0; i < input.length; i++) {
    const m = input[i];
    if (!m || typeof m !== 'object') return fail('bad message');
    const { role, content } = m;
    if (role !== 'user' && role !== 'assistant') return fail('bad role');
    if (typeof content !== 'string') return fail('bad content');

    const expected = i % 2 === 0 ? 'user' : 'assistant';
    if (role !== expected) return fail('roles must alternate, starting with user');

    const text = content.replace(CONTROL, '').trim();
    const cap = role === 'user' ? LIMITS.maxUserChars : LIMITS.maxAssistantChars;
    if (!text) return fail('empty message');
    if (text.length > cap) return fail('message too long');

    total += text.length;
    clean.push({ role, content: text });
  }

  if (total > LIMITS.maxTotalChars) return fail('conversation too long');
  if (clean[clean.length - 1].role !== 'user') return fail('last message must be from user');

  return { ok: true, messages: clean };
}

function fail(error) {
  return { ok: false, error };
}
