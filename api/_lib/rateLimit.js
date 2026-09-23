// Fixed-window rate limiting for /api/chat.
//
// With UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN set, counters live in
// Redis and hold across every serverless instance. Without them it falls back
// to per-instance memory, which is best-effort only — set a spend limit on the
// Anthropic key either way.

export const WINDOWS = [
  { name: 'minute', seconds: 60, limit: 6 },
  { name: 'day', seconds: 86_400, limit: 40 },
];

const GLOBAL_DAILY_CAP = Number(process.env.CHAT_GLOBAL_DAILY_CAP || 800);

const memory = new Map();

function memoryHit(key, seconds, now) {
  const entry = memory.get(key);
  if (!entry || entry.reset <= now) {
    memory.set(key, { count: 1, reset: now + seconds * 1000 });
    if (memory.size > 5000) prune(now);
    return 1;
  }
  entry.count += 1;
  return entry.count;
}

function prune(now) {
  for (const [k, v] of memory) if (v.reset <= now) memory.delete(k);
}

async function redisHit(key, seconds) {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  const res = await fetch(`${url}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([['INCR', key], ['EXPIRE', key, String(seconds), 'NX']]),
  });
  if (!res.ok) throw new Error(`ratelimit store ${res.status}`);
  const data = await res.json();
  return Number(data?.[0]?.result ?? 0);
}

const redisConfigured = () => Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

// Returns { ok: true } or { ok: false, retryAfter }.
export async function rateLimit(id, now = Date.now()) {
  const hit = async (key, seconds) => (redisConfigured() ? redisHit(key, seconds) : memoryHit(key, seconds, now));

  for (const w of WINDOWS) {
    const slot = Math.floor(now / 1000 / w.seconds);
    const count = await hit(`chat:${w.name}:${id}:${slot}`, w.seconds);
    if (count > w.limit) {
      const retryAfter = w.seconds - (Math.floor(now / 1000) % w.seconds);
      return { ok: false, retryAfter };
    }
  }

  const day = Math.floor(now / 1000 / 86_400);
  const global = await hit(`chat:global:${day}`, 86_400);
  if (global > GLOBAL_DAILY_CAP) {
    return { ok: false, retryAfter: 86_400 - (Math.floor(now / 1000) % 86_400) };
  }

  return { ok: true };
}

export function _resetMemory() {
  memory.clear();
}
