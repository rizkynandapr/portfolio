# Portfolio — Rizky Nanda Praditia

Personal site for an AI automation engineer, styled as a **mission-control
console**: near-black instrument grid, one signal colour (phosphor lime) for
"live / press this", one alert colour (orange) for the guardrail that refuses.

It opens with a scripted replay of the WhatsApp agent capturing an order, a
telemetry strip where every number is backed by a project write-up, and an
index of every system on one screen. Each pipeline then gets a pinned trace
that walks the real node graph as you scroll. An **Ask my agent** console
answers questions about the work, grounded only in this site's own data.

## Stack

React 19 · Vite 8 · GSAP ScrollTrigger · Lenis · Vercel Functions (the agent)
· self-hosted Archivo (variable width) / IBM Plex Sans / IBM Plex Mono

## Commands

```bash
npm install
npm run dev       # dev server — /api/chat works locally if .env.local has a key
npm test          # vitest (UI + API)
npm run lint      # oxlint
npm run build     # production build
npm run preview   # serve the build (no /api in preview)
```

## Layout

```
api/
  chat.js              POST /api/chat — the portfolio agent
  _lib/                validation, rate limiting, knowledge/system prompt (not routes)
src/
  data/projects.js     project content, flow graphs, headline metric per project
  data/profile.js      identity, telemetry, roles, stack — shared with the agent
  chapters/            opening + replay, systems index, compact, stack/log, about, contact
  flow/                pinned trace: diagram, chapter, mobile stepper, layouts/
  agent/               agent console UI and client
  stage/               scroll host, pinned-chapter hook, motion preferences
  styles/              fonts, HUD primitives
  ui/                  nav (scrollspy + local clock), section head, copy-email
```

## The agent (`/api/chat`)

Set these in **Vercel → Settings → Environment Variables** (see `.env.example`):

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | yes | Without it the console says the agent is offline. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-haiku-4-5`. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | recommended | Shared rate-limit counters across instances. |
| `ALLOWED_ORIGINS` | no | Extra origins, e.g. a custom domain on a different host. |
| `CHAT_GLOBAL_DAILY_CAP` | no | Hard daily cap across all visitors. Default 800. |

Also set a **monthly spend limit on the Anthropic key** — it is the last line
of defence whatever the rate limiter does.

### Security posture

- The key lives only in server env. Nothing is `VITE_`-prefixed, so nothing
  secret reaches the bundle.
- Same-origin only (`Origin` must match the host or `ALLOWED_ORIGINS`), JSON
  only, 16 KB body cap, `POST` only, `Cache-Control: no-store`.
- Messages are validated before a token is spent: roles must alternate from
  `user`, no `system` role smuggling, per-message and total length caps,
  control characters stripped.
- Rate limits: 6/min and 40/day per IP, plus a global daily cap.
- Output capped at 450 tokens with a 20 s upstream timeout; upstream errors are
  logged server-side and never echoed to the client.
- The system prompt treats visitor text as data and grounds answers in
  `src/data/*` only. Replies render as text nodes, never HTML.
- CSP stays strict: `script-src 'self'`, `connect-src 'self'`, `object-src 'none'`,
  `frame-ancestors 'none'`, plus HSTS, COOP and CORP.

## Behaviour worth knowing

- **Below 768px** pinning is off and each pipeline becomes a tap-through stepper.
- **`prefers-reduced-motion: reduce`** drops pinning, stops the replay and
  renders every trace as a complete static diagram.
- Node text is always in the DOM; scroll only changes `data-state`, so screen
  readers reach every node.
- Every trace has a **Skip trace ↓** link to the next chapter.

## Editing content

Numbers on the page come from `src/data/profile.js` (`TELEMETRY`) and each
project's `metric` in `src/data/projects.js`. The agent reads the same files,
so updating them updates both.
