# Integrations (MVP)

**Last updated:** 2026-05-21

---

## Scope

**Email only** for MVP. Slack and WhatsApp deferred.

Uses `settings_channels` rows with `type = email` and JSON `config` (see [database-schema.md](./database-schema.md)).

---

## Email uses

| Event | Recipient | When |
|-------|-----------|------|
| **Studio alert** | Configured address(es) in channel `config` | `POST /api/talk/complete` — “interview completed” (link to admin review) |
| **Client copy** | `invites.client_email` | Same request — if email set and channel enabled; delightful HTML template |

---

## Channel config shape (email)

```json
{
  "toAddresses": ["team@idwasoft.com"],
  "fromAddress": "hola@idwasoft.com",
  "fromName": "Idwasoft"
}
```

For client copy, `to` comes from invite; `from` from channel config.

---

## Delivery

- Laravel Mail + SMTP (or host mail) — driver TBD in `.env`.
- Log each send in `delivery_records`.
- **Re-send copy:** `POST /api/admin/invites/{id}/resend-copy` (admin).

---

## Later

- `slack`, `whatsapp` channel types — same `settings_channels` table, new senders.
