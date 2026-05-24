# Authentication

**Last updated:** 2026-05-22

---

## Principle

**HttpOnly cookies only** for ongoing access — no access/refresh JWT pairs for API calls.

| Flow | Credential | After success |
|------|------------|---------------|
| Client entry | Query `t` = **action JWT** (7d) | **Interview session cookie** (7d max, sliding) |
| Client API | Interview session cookie | — |
| Admin | Google OAuth | **Laravel session cookie** (studio user) |

---

## Client interview

### 1. Entry — `GET /invites?t={jwt}`

- Verify signed JWT (`jti`, `invite_id`, `exp`).
- Reject if invite `revoked` or expired.
- Create or refresh `interview_sessions` row; set cookie (UUID = session `id`).
- Redirect `302` → `/talk`.

### 2. Session cookie

| Property | Value |
|----------|--------|
| Name | `interview_session` (see `config/interview.php`) |
| Value | `interview_sessions.id` (UUID) |
| HttpOnly | yes |
| Secure | yes (production) |
| SameSite | `Lax` |
| TTL | **7 days** maximum, sliding on each authenticated API call |

Expired cookie + valid invite JWT → client re-opens `/invites?t=…` → new session.

### 3. API middleware

All `/api/talk`, `/api/answers` (except none), `/api/talk/complete`:

- Resolve session cookie → `Interview` → `Invite`.
- Return `401` if missing/invalid/expired.

---

## Admin

### OAuth entry (web routes)

| Method | Path | Action |
|--------|------|--------|
| `POST` | `/auth/login` | Email + password (local/testing only) → Laravel session |
| `GET` | `/auth/google` | Redirect to Google (Socialite) |
| `GET` | `/auth/google/callback` | Upsert `users` row, start Laravel session, redirect `/admin` |
| `POST` | `/auth/logout` | Invalidate session, redirect `/admin` |

- **Google OAuth** via `laravel/socialite`; allow only `@idwasoft.com` (`config/admin.php` → `allowed_email_domain`).
- Personal Gmail / other domains → redirect `/admin?auth=denied` (no session).
- On success: standard **Laravel session cookie** (`web` guard) — no Bearer tokens.

### Admin API

- `GET /api/admin/settings` (and `/api/admin/*`) use middleware `admin` (`EnsureAdminAuthenticated`).
- Resolves the studio user from Laravel session (stateful Sanctum SPA).
- Rejects users whose email is not `@idwasoft.com` (JSON `401`).

**Local password login:** `POST /auth/login` with `{ email, password }` when `ADMIN_PASSWORD_LOGIN=true` (default in `local` / `testing`). Seeded user: `dev@idwasoft.com` / `password`.

Admin and interview cookies are **separate**: `laravel_session` (or app session name) vs `interview_session`. Logging in as studio does not set the interview cookie; completing `/invites?t=…` does not grant admin API access.

---

## CSRF

Same-origin SPA: Laravel CSRF token on state-changing requests (`PATCH`, `POST`); `credentials: 'include'`.
