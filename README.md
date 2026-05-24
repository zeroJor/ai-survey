# Web Interviewer

Pre–live-call discovery interview for Idwasoft clients. Laravel 11 API + React SPA.

**Documentation:** [docs/plan/implementation-plan.md](docs/plan/implementation-plan.md)  
**UI reference (not production):** [docs/prototype/](docs/prototype/)

## Stack

- PHP 8.2+, Laravel 11, MySQL 8 (Docker locally)
- React 18, TypeScript, Tailwind CSS, Vite, React Router

## Prerequisites

- PHP 8.2+, Composer 2, Node 20+, npm
- Docker (for local MySQL)

## Local setup

1. `docker compose up -d`
2. `cp .env.example .env` and `php artisan key:generate`
3. `composer install`
4. `npm install`
5. `php artisan migrate:fresh --seed` (F1: domain schema + interview content; **MySQL required** from F1 onward)

> SQLite is fine for quick F0 UI checks only. Use Docker MySQL for migrations, seeders, and feature tests that match production.

## Development

**Option A — two terminals:**

```bash
php artisan serve
npm run dev
```

**Option B — single command:**

```bash
npm run dev:all
```

- App: http://127.0.0.1:8000
- Vite dev server: http://127.0.0.1:5173 (assets via `@vite`)

### Routes (F0)

| URL | Purpose |
|-----|---------|
| `/up` | Health check |
| `/talk` | Client interview SPA |
| `/admin` | Studio admin SPA |

## Validation (E0.1)

```bash
npm run build
curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8000/up
```

Open `/talk` and `/admin` in the browser.

## Client invite flow (F2)

Set in `.env`:

```dotenv
ACTION_JWT_SECRET=   # php -r "echo base64_encode(random_bytes(32)), PHP_EOL;"
```

```bash
php artisan migrate:fresh --seed
php artisan invite:dev-url
# Open printed URL → redirects to /talk with session cookie
curl -b cookies.txt http://127.0.0.1:8000/api/talk
```

See [docs/technical/talk-api.md](docs/technical/talk-api.md).

## Answers and completion (F4)

After tone is saved (`PATCH /api/talk`), each question is persisted with `POST /api/answers`. Finishing the last question shows farewell; the SPA calls `POST /api/talk/complete` once (template farewell + studio alert stub).

```bash
php artisan migrate:fresh --seed   # llm_enabled=false in settings
php artisan test --filter=AnswersApiTest
php artisan test --filter=TalkCompleteApiTest
```

Manual: open `invite:dev-url` → answer a question → check `answers` and `ai_messages` tables.

## Admin Google OAuth (F5)

**Local without Google:** after `migrate:fresh --seed`, open `/admin` and sign in with `dev@idwasoft.com` / `password` (only `local` / `testing`; set `ADMIN_PASSWORD_LOGIN=false` to disable).

Create a **Web** OAuth client in [Google Cloud Console](https://console.cloud.google.com/) with authorized redirect URI:

`http://127.0.0.1:8000/auth/google/callback`

Set in `.env`:

```dotenv
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

```bash
php artisan test --filter=Admin
```

Open `/admin` → redirects to Google when not signed in → returns to empty studio shell. Only `@idwasoft.com` accounts are accepted.

**Manual OAuth checklist (optional for F6 coding, required for browser login):** [docs/plan/TODO.md](docs/plan/TODO.md)

See [docs/technical/auth.md](docs/technical/auth.md) and [docs/technical/admin-api.md](docs/technical/admin-api.md).

## Admin operations (F6)

Studio panel at `/admin` (requires Google OAuth for browser — see [docs/plan/TODO.md](docs/plan/TODO.md); tests use `actingAs`).

- Create/list/revoke invites with JWT client URLs
- Edit settings, branding, and studio email channels
- Review completed conversations on invite detail

```bash
php artisan test --filter=Admin
```

## LLM / Gemini (F7)

Set in `.env`:

```dotenv
GEMINI_API_KEY=...
GEMINI_MODEL=gemini-2.0-flash
LLM_TIMEOUT_SECONDS=25
```

Enable **LLM habilitado** in `/admin/settings`. Micro-replies use Gemini on `POST /api/answers`; studio analysis is generated on demand from invite detail (`POST /api/admin/interviews/{id}/generate-summary`). Farewell on complete stays template-based.

```bash
php artisan llm:ping
php artisan test --filter=Llm
php artisan test --filter=AdminInterviewAnalysis
```

## Email (F8)

On interview complete, the app emails the studio team (metadata + admin link) and sends the client an HTML copy of their answers when `client_email` is set. Use `MAIL_MAILER=log` locally and inspect `storage/logs/laravel.log`.

```bash
php artisan test --filter=InterviewEmail
php artisan test --filter=ResendCopy
```

Admin: invite detail → **Reenviar copia por email** (`POST /api/admin/invites/{id}/resend-copy`).

## MySQL (E0.2)

Start Docker Desktop, then:

```bash
docker compose up -d
# set DB_* in .env to match .env.example (mysql)
php artisan migrate
php artisan migrate:status
```
