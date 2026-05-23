# Admin API (MVP)

**Last updated:** 2026-05-22  
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
| `POST` | `/api/admin/interviews/{id}/generate-summary` | Generate/overwrite studio analysis (`llm_enabled` + completed interview) |

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

### SPA auth gate (F5)

On mount, the admin shell calls `GET /api/admin/settings` with `credentials: 'include'`.

- **401** → full-page redirect to `/auth/google`.
- **200** → render layout and nested routes.
- **`/admin?auth=denied`** → show “solo @idwasoft.com” message (OAuth callback rejected personal email).
- **Logout** → `POST /auth/logout` with CSRF, then reload `/admin`.

Interview `interview_session` cookie does not satisfy admin API requests.

---

## Invites API (F6)

### `POST /api/admin/invites`

Body: `contactName`, `businessName`, optional `businessAbout`, and **at least one** of `clientEmail` / `clientWhatsapp`.

Response `201`: `{ "invite": { …, "inviteUrl" }, "inviteUrl": "…" }`.

### `GET /api/admin/invites`

Query: `status` (`active` | `revoked` | `not_started` | `in_progress` | `completed`), `page`, `per_page`.

Response: `{ "data": [ … ], "meta": { "currentPage", "lastPage", "total", … } }` — each row includes `displayStatus`, `progress: { answered, total }`, timestamps.

### `GET /api/admin/invites/{id}`

Detail + nested `interview` summary + `inviteUrl` (re-issues JWT only if expired).

### `POST /api/admin/invites/{id}/revoke`

Sets invite `revoked`; idempotent.

---

## Settings PATCH (F6)

`PATCH /api/admin/settings` accepts partial updates: `studioProcess`, `llmEnabled`, `privacyNoticeUrl`, `branding` object.

Email channel `config` for `type: email`:

```json
{
  "toAddresses": ["team@idwasoft.com"],
  "fromAddress": "hola@idwasoft.com",
  "fromName": "Idwasoft"
}
```

---

## Interview review (F6)

`GET /api/admin/interviews/{interviewId}` — ordered `questions` with `answer` + `microReply`, optional `farewell`, `artifact` (null until generated).

### `POST /api/admin/interviews/{interviewId}/generate-summary`

Requires completed interview and `settings.llm_enabled=true`. Response `200`:

```json
{
  "artifact": {
    "schemaVersion": "1",
    "generatedAt": "…",
    "analysis": {
      "psychologicalProfile": "…",
      "clientNeeds": "…",
      "businessContext": "…",
      "salesStrategies": "…",
      "recommendedNextSteps": "…",
      "risks": "…",
      "keyQuotes": ["…"]
    }
  }
}
```

`403` when LLM disabled; `422` when interview not completed.

### `POST /api/admin/invites/{inviteId}/resend-copy`

Re-sends client answer copy email. Requires completed interview and `clientEmail` on invite.

Response `200`:

```json
{
  "delivery": {
    "id": 1,
    "channelKey": "client_copy",
    "status": "sent",
    "sentAt": "2026-05-22T12:00:00+00:00"
  }
}
```

`422` when interview not completed or no client email. Each call creates a new `delivery_records` row.
