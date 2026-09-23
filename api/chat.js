// POST /api/chat — the portfolio agent.
//
// Security posture:
//   - the Anthropic key only ever lives in server env (ANTHROPIC_API_KEY)
//   - same-origin requests only; JSON only; 16 KB body cap
//   - strict message validation before any tokens are spent
//   - per-IP and global rate limits (Redis-backed when configured)
//   - capped output tokens and an upstream timeout
//   - errors never echo upstream details back to the client
import { validateMessages } from './_lib/validate.js';
import { rateLimit } from './_lib/rateLimit.js';
import { buildSystemPrompt } from './_lib/knowledge.js';

export const config = { maxDuration: 30 };

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-haiku-4-5';
const MAX_TOKENS = 450;
const MAX_BODY = 16 * 1024;
const UPSTREAM_TIMEOUT_MS = 20_000;

let systemPrompt;

export default async function handler(req, res) {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return send(res, 405, { error: 'method_not_allowed' });
  }
  if (!sameOrigin(req)) return send(res, 403, { error: 'forbidden' });
  if (!String(req.headers['content-type'] || '').startsWith('application/json')) {
    return send(res, 415, { error: 'unsupported_media_type' });
  }

  let body;
  try {
    body = await readJson(req);
  } catch {
    return send(res, 400, { error: 'bad_request' });
  }

  const checked = validateMessages(body?.messages);
  if (!checked.ok) return send(res, 400, { error: 'invalid_messages', detail: checked.error });

  let limited;
  try {
    limited = await rateLimit(clientId(req));
  } catch (err) {
    console.error('[chat] ratelimit store failed', err?.message);
    return send(res, 503, { error: 'unavailable' });
  }
  if (!limited.ok) {
    res.setHeader('Retry-After', String(limited.retryAfter));
    return send(res, 429, { error: 'rate_limited', retryAfter: limited.retryAfter });
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return send(res, 503, { error: 'agent_offline' });

  systemPrompt ??= buildSystemPrompt();

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), UPSTREAM_TIMEOUT_MS);

  try {
    const upstream = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      signal: ctrl.signal,
      headers: {
        'content-type': 'application/json',
        'x-api-key': key,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: MODEL,
        max_tokens: MAX_TOKENS,
        temperature: 0.3,
        system: [{ type: 'text', text: systemPrompt, cache_control: { type: 'ephemeral' } }],
        messages: checked.messages,
      }),
    });

    if (!upstream.ok) {
      console.error('[chat] upstream', upstream.status, (await upstream.text()).slice(0, 300));
      return send(res, 502, { error: 'upstream_error' });
    }

    const data = await upstream.json();
    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('')
      .trim();

    if (!reply) return send(res, 502, { error: 'empty_reply' });
    return send(res, 200, { reply });
  } catch (err) {
    const timedOut = err?.name === 'AbortError';
    console.error('[chat] request failed', timedOut ? 'timeout' : err?.message);
    return send(res, timedOut ? 504 : 502, { error: timedOut ? 'timeout' : 'upstream_error' });
  } finally {
    clearTimeout(timer);
  }
}

// Works on Vercel's Node runtime and on a bare Node/connect response in dev.
function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

function sameOrigin(req) {
  const origin = req.headers.origin;
  if (!origin) return false;
  let host;
  try { host = new URL(origin).host; } catch { return false; }

  const allowed = new Set(
    String(process.env.ALLOWED_ORIGINS || '')
      .split(',').map((s) => s.trim()).filter(Boolean)
      .map((o) => { try { return new URL(o).host; } catch { return o; } }),
  );
  const self = req.headers['x-forwarded-host'] || req.headers.host;
  return host === self || allowed.has(host);
}

function clientId(req) {
  const real = req.headers['x-real-ip'];
  if (real) return String(real);
  const fwd = String(req.headers['x-forwarded-for'] || '').split(',')[0].trim();
  return fwd || req.socket?.remoteAddress || 'unknown';
}

async function readJson(req) {
  // Vercel pre-parses JSON bodies; a bare Node request (dev) does not.
  if (req.body !== undefined) {
    if (typeof req.body === 'string') {
      if (req.body.length > MAX_BODY) throw new Error('too large');
      return JSON.parse(req.body);
    }
    return req.body;
  }

  let size = 0;
  const chunks = [];
  for await (const chunk of req) {
    size += chunk.length;
    if (size > MAX_BODY) throw new Error('too large');
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
