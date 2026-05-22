# Client interview prototype

Clickable, mobile-first prototype of the Idwasoft pre-discovery interview. **No backend** — mock invite (María / Café Luna) and local state only.

## Run locally

```bash
cd docs/prototype
npm install
npm run dev
```

Open the URL Vite prints (default **http://localhost:5180/**). If that port is busy, Vite picks the next free port — use that one, not an old tab on 5173.

Build for static preview:

```bash
npm run build
npm run preview
```

## Screen map

| Step | Route | Notes |
|------|-------|--------|
| Privacy | `/` | Safety copy + aviso link + time estimate |
| Tone onboarding | | Tu / usted cards; default **usted** if Continue without pick |
| Phase 0 intro | | Script from plantilla |
| Questions (19) | | One per screen; phase label + section title; skip link |
| Micro-reply | | Brief ack after each answer (~600ms skeleton) |
| Phase transition | | Static delight line between phases |
| Farewell | | AI-style closing; no edit on reopen |

## Brand

- **Sansation** — headings / phase labels (`font-brand`)
- **System sans** — question body and textarea
- **Colors** — `#00B4FF` (primary, vibrant), `#0077FF` (accent text), `#1A1A1A` (body), white background
- **Pattern** — `src/assets/pattern.svg` (light blue dots)
- **Logo** — `src/assets/logo-idwasoft.svg`
- **Lisa portraits** — `src/assets/assistant/*.png` (imported in `assistantGestures.ts`)

## Content

- `src/content/interview.json` — phases 0–5, 19 questions, tu/usted labels, copy
- `src/data/mockInvite.ts` — default invite fields

## Edge scenarios

Use the bottom **Prototype scenarios** switcher or query param `?scenario=`:

| Scenario | URL example |
|----------|-------------|
| Happy path | `/` |
| Resume mid-interview | `?scenario=in_progress` |
| Completed (farewell only) | `?scenario=completed` |
| Revoked link | `?scenario=revoked` |
| Slow micro-reply | `?scenario=loading_answer` |
| LLM off (template replies) | `?scenario=llm_off` |
| Long answer stress | `?scenario=long_answer` |
| Skip pre-selected | `?scenario=skip_answer` |

Details: [NOTES.md](./NOTES.md).

## Stack

Vite 5, React 18, React Router 6, Tailwind 3, TypeScript.
