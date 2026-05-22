# Technical decisions log

**Last updated:** 2026-05-21

## Locked

| Topic | Decision |
|-------|----------|
| Backend | Laravel 11, PHP 8.2+ |
| Frontend | React + Tailwind + Vite; React Router |
| Delivery | Blade serves SPA `index.html`; client routes + `/admin` in same SPA |
| DB (prod) | MySQL / MariaDB |
| DB (local) | **Docker** for MySQL while developing |
| Client entry URL | `/invites?t={actionJwt}` |
| Post-auth URL | `/talk` |
| Entry auth | Action JWT in `t`; then **HttpOnly session cookie** (2h) |
| Action JWT TTL | 7 days |
| Ongoing API auth | **Cookies only** (no access/refresh JWT) — see [auth.md](./auth.md) |
| Client API | `GET /api/talk`, `PATCH /api/talk`, `POST /api/answers`, `POST /api/talk/complete` |
| Admin API | [admin-api.md](./admin-api.md) — convention OK to refine in code |
| Admin auth | Google OAuth + Laravel session cookie |
| LLM | [llm.md](./llm.md) — interface; **Gemini Flash** MVP; **`llmEnabled`** toggle on `Settings` |
| Channels (MVP) | **Email only** — see [integrations.md](./integrations.md) |
| Content seed | [content-seed.md](./content-seed.md) — from `plantilla-entrevista-descubrimiento.md` |
| DB schema | [database-schema.md](./database-schema.md) |
| Domain models | [domain-models.md](../requierements/domain-models.md) |
| Background jobs | None for MVP |

## Deferred

- `POST /api/talk/complete` timing / PHP timeout split
- Slack, WhatsApp channels
- Abandoned-session automation
- Queue / cron

## Open tension

- Session 2h vs re-entry via invite JWT within 7d
