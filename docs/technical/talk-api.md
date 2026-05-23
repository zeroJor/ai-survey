# Talk API (client bootstrap)

**Last updated:** 2026-05-22  
**Auth:** HttpOnly `interview_session` cookie (set by `GET /invites?t=…`).  
**CSRF:** Required on `PATCH` (same-origin SPA; `X-XSRF-TOKEN` from `XSRF-TOKEN` cookie).

---

## `GET /api/talk`

Returns interview state, pinned template content, progress, and branding.

**401** — missing, invalid, or expired session cookie.

### Response (shape)

Aligned with [prototype `InterviewContent`](../prototype/src/types.ts):

- `status` — `not_started` | `in_progress` | `completed` | `revoked`
- `invite` — `contactName`, `businessName`, `businessAbout`
- `register` — `tu` | `usted` | `null`
- `contentVersion` — template version string
- `content` — `{ version, phases[], questions[], copy }`
- `progress` — `{ answers: { [questionCode]: { body, skipped } }, currentQuestionCode }`
- `branding` — `displayName`, `primaryColor`, `accentColor`, `privacyNoticeUrl`, …

When `status === completed`, `content.questions` is empty; farewell copy remains in `content.copy`.

---

## `PATCH /api/talk`

Persist tone register.

### Body

```json
{ "register": "tu" }
```

### Response

Same shape as `GET /api/talk` (updated snapshot).

**422** — validation error.  
**401** — no session.

---

## Entry flow

1. Client opens `GET /invites?t={actionJwt}` (from studio email/link).
2. Server sets `interview_session` cookie and redirects to `/talk` (or `?scenario=revoked|completed`).
3. SPA loader calls `GET /api/talk` with credentials.

Generate a dev link:

```bash
php artisan invite:dev-url
```

---

## `POST /api/answers`

Persist one answer and return a template micro-reply (F4; no Gemini while `settings.llm_enabled` is false).

### Body

```json
{
  "questionCode": "1.1",
  "answer": "Texto de la respuesta",
  "skipped": false
}
```

| Field | Notes |
|-------|--------|
| `questionCode` | Stable code from `content.questions[].code` |
| `answer` | Ignored when `skipped` is true |
| `skipped` | `true` for “Prefiero no contestar” or empty submission |

### Response

```json
{
  "microReply": {
    "text": "Gracias, lo anotamos.",
    "sentimentId": "smile"
  },
  "progress": {
    "answers": { "1.1": { "body": "…", "skipped": false } },
    "currentQuestionCode": "1.2"
  }
}
```

Client resolves `sentimentId` → portrait via `content/assistant/sentiments.json`.

**401** — no session.  
**409** — interview completed or invite revoked.  
**422** — unknown `questionCode` or register not set.

---

## `POST /api/talk/complete`

Mark interview completed after all questions are answered or skipped. **No LLM** and **no** `interview_artifacts` in F4.

### Body

Empty JSON object or no body.

### Response

Same shape as `GET /api/talk` with `status: "completed"` and `content.questions: []`.

**401** — no session.  
**409** — invite revoked.  
**422** — register missing or not all questions answered.

**Idempotency:** calling again on an already completed interview returns **200** with the completed snapshot (safe for farewell screen refresh).

Side effects:

- Inserts farewell row in `ai_messages` (template) if missing.
- Dispatches `InterviewCompleted` → studio alert + optional client copy email (`delivery_records`; see E8.1).
