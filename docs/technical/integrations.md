# Integrations (MVP)

**Last updated:** 2026-05-22

---

## Scope

**Email only** for MVP. Slack and WhatsApp deferred.

Uses `settings_channels` rows with `type = email` and JSON `config` (see [database-schema.md](./database-schema.md)).

---

## Email uses

| Event | Recipient | When |
|-------|-----------|------|
| **Studio alert** | Configured address(es) in channel `config` | `InterviewCompleted` event — metadata + admin link (`delivery_records.channel_key` = channel key, e.g. `studio_email`) |
| **Client copy** | `invites.client_email` | Same event — if email set; HTML Q/A template (`delivery_records.channel_key` = `client_copy`) |

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
