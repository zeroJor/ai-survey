# Prototype review notes

Checklist of UX states and how to trigger them in this prototype.

## Covered flows

- [x] **Privacy** — `/talk` (default scenario): title, body, aviso link, ~15–20 min note
- [x] **Tone onboarding** — two option cards; Continue without selection → **usted**
- [x] **Phase 0** — intro copy only, Continue
- [x] **Question loop** — all 19 questions from `interview.json`; register drives tu/usted labels
- [x] **Prefiero no contestar** — enables Continue with empty body
- [x] **Micro-reply** — skeleton then one-line ack; `loading_answer` extends delay
- [x] **Lisa portraits** — catálogo en [assistant-expression.md](../requierements/assistant-expression.md) §2; assets en `assistantGestures.ts`. Micro-replies: **retrato aleatorio** (prototipo) para revisar todas las expresiones.
- [ ] **Sentiment + register (tú/usted)** — spec in [assistant-expression.md](../requierements/assistant-expression.md); not split by register yet
- [x] **Between-phase delight** — shown when `phaseCode` changes (phases 1→2, etc.)
- [x] **Farewell** — template with `{{contactName}}` / `{{businessName}}`; no edit UI
- [x] **Progress** — bar on question / micro-reply / transition steps
- [x] **Reduced motion** — `prefers-reduced-motion` short-circuits CSS transitions in `index.css`

## Edge scenarios

| ID | Trigger | Expected behavior |
|----|---------|-------------------|
| `default` | `/talk` | Full path from privacy → farewell |
| `in_progress` | `/talk?scenario=in_progress` | Starts at question 6 (index 5) with 5 saved answers; register **usted** |
| `completed` | `/talk?scenario=completed` | Farewell only (reopen link) |
| `revoked` | `/talk?scenario=revoked` | Closed-state title + body |
| `loading_answer` | `/talk?scenario=loading_answer` | Micro-reply skeleton ~1.8s |
| `llm_off` | `/talk?scenario=llm_off` | Generic template micro-replies (no LLM-style lines) |
| `long_answer` | `/talk?scenario=long_answer` | First question textarea pre-filled with long text |
| `skip_answer` | `/talk?scenario=skip_answer` | First question with skip already active |

Dev panel: fixed bottom **Prototype scenarios** `<select>` reloads the page with the chosen query param.

## Out of scope (by design)

- Laravel, cookies, JWT, real LLM calls
- Admin `/admin`, email UI, dark mode
- Editing answers after submit

## Review tips

1. Resize to ~375px width for mobile check.
2. Walk happy path once; use `in_progress` to spot-check mid-flow resume.
3. Compare logo + pattern against Idwasoft brand references in PR.
