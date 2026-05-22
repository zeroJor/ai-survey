# Authentication

**Last updated:** 2026-05-21

---

## Principle

**HttpOnly cookies only** for ongoing access — no access/refresh JWT pairs for API calls.

| Flow | Credential | After success |
|------|------------|---------------|
| Client entry | Query `t` = **action JWT** (7d) | **Interview session cookie** (2h, sliding) |
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
| Name | TBD in implementation (e.g. `interview_session`) |
| Value | `interview_sessions.id` (UUID) |
| HttpOnly | yes |
| Secure | yes (production) |
| SameSite | `Lax` |
| TTL | **2 hours**, sliding on each authenticated API call |

Expired cookie + valid invite JWT → client re-opens `/invites?t=…` → new session.

### 3. API middleware

All `/api/talk`, `/api/answers` (except none), `/api/talk/complete`:

- Resolve session cookie → `Interview` → `Invite`.
- Return `401` if missing/invalid/expired.

---

## Admin

- **Google OAuth** (Socialite); allow only `@idwasoft.com`.
- On success: standard **Laravel web session cookie** (same cookie-based model as client — no Bearer tokens).
- Middleware on `/api/admin/*`: authenticated `User`.

Admin and interview cookies are **separate** guards / cookie names.

---

## CSRF

Same-origin SPA: Laravel CSRF token on state-changing requests (`PATCH`, `POST`); `credentials: 'include'`.
