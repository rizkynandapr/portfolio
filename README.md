# Portfolio — Rizky Nanda Praditia

Personal site for an AI automation engineer. Palette carried over from
[Fileloka](https://fileloka.id): cool blue-black (or light grey) surfaces, a
lime **signal** for fills and "live" states, and an indigo **accent** as the
second voice. Light and dark themes, following the system by default with a
toggle in the nav.

It opens with a portrait and a short pitch, a telemetry strip where every number is backed by a project write-up, and an
index of every system on one screen. Each pipeline gets a trace that walks the
real node graph on its own while it is on screen — no scroll pinning — and any
node can be clicked to pause and read. The WhatsApp chapter adds a scripted
replay of the agent capturing an order. An **Ask my agent** console answers
questions about the work, grounded only in this site's own data.

## Stack

React 19 · Vite 8 · Lenis · Vercel Functions (the agent)
· self-hosted Archivo (variable width) / Geist / Geist Mono

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
  chapters/            opening + portrait, replay, systems index, compact, stack, about (story + now card), contact
  flow/                auto-play trace: diagram, chapter, useAutoplay, mobile stepper, layouts/
  agent/               agent console, client, quick answers
    rag/               in-browser retrieval: corpus, BM25 search, answer builder
  stage/               scroll host, smooth scroll, motion preferences
  styles/              fonts, shared primitives
  ui/                  nav (scrollspy, clock, theme toggle), section head, copy-email
public/theme.js        sets data-theme before first paint (external, CSP-safe)
```

## The agent

The "Ask my agent" console works **without any API key**. It is a small
retrieval system that runs in the browser:

- `src/agent/rag/corpus.js` chunks everything the site already says: each
  project, each pipeline step, roles, story, stack, contact.
- `src/agent/rag/search.js` is BM25 over those chunks, with a short
  Indonesian→English term map so questions in Bahasa find English text.
- `src/agent/rag/answer.js` handles a few intents (hello, thanks, rates,
  off-topic), picks the best-matching sentences, quotes them, and links each
  answer back to the section it came from. If nothing matches well, it says
  so and offers to email the question.
- The four suggested questions have hand-written answers (`quickAnswers.js`).

No tokens, no server round trip, nothing to rate-limit.

### Optional: live answers with Claude

Set `ANTHROPIC_API_KEY` in Vercel and `/api/status` reports `live`; free-form
questions then go to `/api/chat`, which sends the model only the chunks that
match the question (about a third of the full knowledge block). If the key is
removed, the console drops back to site search on its own.

| Variable | Required | Notes |
|---|---|---|
| `ANTHROPIC_API_KEY` | no | Turns on live answers. |
| `ANTHROPIC_MODEL` | no | Defaults to `claude-haiku-4-5`. |
| `UPSTASH_REDIS_REST_URL` / `_TOKEN` | recommended with a key | Shared rate-limit counters across instances. |
| `ALLOWED_ORIGINS` | no | Extra origins, e.g. a custom domain on a different host. |
| `CHAT_GLOBAL_DAILY_CAP` | no | Hard daily cap across all visitors. Default 800. |

If you do set a key, also set a monthly spend limit on it.

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
- CSP stays strict — the theme bootstrap is an external file, not inline: `script-src 'self'`, `connect-src 'self'`, `object-src 'none'`,
  `frame-ancestors 'none'`, plus HSTS, COOP and CORP.

## Behaviour worth knowing

- Traces only tick while at least a third of them is on screen.
- **Below 768px** each pipeline becomes a tap-through stepper.
- **`prefers-reduced-motion: reduce`** stops the traces, the replay and the portrait scan line,
  and renders every pipeline as a complete static diagram.
- Node text is always in the DOM; only `data-state` changes, so screen readers
  reach every node.
- Theme choice is remembered in `localStorage` (best-effort); without it the
  site follows `prefers-color-scheme`.

## Photo

`public/img/` holds the portrait at 640 and 986 px (WebP) plus a JPEG
fallback, served through `<picture>` with explicit width/height so the layout
never jumps. To swap it, export new files at the same names.

## Editing content

Numbers and the About copy come from `src/data/profile.js` (`TELEMETRY`, `NOW`, `STORY`, `PRINCIPLES`) and each
project's `metric` in `src/data/projects.js`. The agent reads the same files,
so updating them updates both.
