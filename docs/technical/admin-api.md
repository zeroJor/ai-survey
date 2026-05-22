# Admin API (MVP)

**Last updated:** 2026-05-21  
**Auth:** Laravel session cookie after Google OAuth (`@idwasoft.com` only).

Reasonable default surface — adjust during implementation if needed.

---

## Settings

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/admin/settings` | Read `settings` + `settings_channels` |
| `PATCH` | `/api/admin/settings` | Update process, branding, privacy URL, **`llmEnabled`** |
| `POST` | `/api/admin/settings/channels` | Add email channel |
| `PATCH` | `/api/admin/settings/channels/{channelKey}` | Update channel |
| `DELETE` | `/api/admin/settings/channels/{channelKey}` | Remove channel |

---

## Invites

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/admin/invites` | List (filter by status, paginated) |
| `POST` | `/api/admin/invites` | Create invite + issue action JWT URL |
| `GET` | `/api/admin/invites/{id}` | Detail + interview status |
| `POST` | `/api/admin/invites/{id}/revoke` | Revoke link |
| `POST` | `/api/admin/invites/{id}/resend-copy` | Re-send client answer copy (email) |

---

## Interviews (review)

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/api/admin/interviews/{id}` | Raw thread (`answers` + `ai_messages`) + `interview_artifacts` + invite meta |

List completed interviews via `GET /api/admin/invites?status=completed` or dedicated query on interviews.

---

## Auth routes (web, not JSON)

| Method | Path | Action |
|--------|------|--------|
| `GET` | `/auth/google` | Redirect to Google |
| `GET` | `/auth/google/callback` | Create/find `User` by email, start session |
| `POST` | `/auth/logout` | Admin logout |

---

## SPA routes (React Router)

| Path | Screen |
|------|--------|
| `/admin` | Dashboard / invite list |
| `/admin/invites/new` | Create invite |
| `/admin/invites/:id` | Review submission |
| `/admin/settings` | Settings + email channels |
