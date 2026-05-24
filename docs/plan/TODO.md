# Manual setup TODO

Items below are **not required** to implement or test **F6** in code (`php artisan test` uses `actingAs()` with `@idwasoft.com` users). They **are** required to sign into `/admin` in a real browser with Google.

**Status:** F5 code complete (15/22). Complete this checklist when you want end-to-end admin OAuth QA; F6 development can proceed in parallel.

---

## 1. Google Cloud OAuth (local)

**Shortcut:** after seed, open `/admin` and log in with `dev@idwasoft.com` / `password` (local/testing only). Skip to §2 for Google OAuth when needed.

- [ ] Open [Google Cloud Console](https://console.cloud.google.com/) and select or create a project for Idwasoft / web-interviewer.
- [ ] Configure the **OAuth consent screen** (Internal or External, as appropriate for your org).
- [ ] Create credentials → **OAuth client ID** → type **Web application**.
- [ ] Add **Authorized redirect URI** (must match exactly):
  - `http://127.0.0.1:8000/auth/google/callback`
- [ ] Copy **Client ID** and **Client secret** into `.env` (not committed):

```dotenv
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://127.0.0.1:8000/auth/google/callback
```

- [ ] Ensure `APP_URL` matches how you open the app (recommended: `http://127.0.0.1:8000`, same host as the redirect URI).
- [ ] Optional: `ADMIN_ALLOWED_EMAIL_DOMAIN=idwasoft.com` (default in [`config/admin.php`](../../config/admin.php)).

---

## 2. Local app sanity check

- [ ] `docker compose up -d` (if using MySQL).
- [ ] `php artisan migrate:fresh --seed`
- [ ] `php artisan test --filter=Admin` — expected: all green without real Google credentials.
- [ ] `php artisan serve` and `npm run dev` (or `npm run dev:all`).

---

## 3. Browser validation (F5 — manual only)

- [ ] Open `http://127.0.0.1:8000/admin` → redirects to Google sign-in.
- [ ] Sign in with an **`@idwasoft.com`** account → lands on admin shell (dashboard, nav, settings read-only).
- [ ] Sign out → visiting `/admin` again prompts Google login.
- [ ] (Optional) Sign in with a **personal Gmail** → expect `/admin?auth=denied` and no admin API access.
- [ ] (Optional) In another tab, complete a client flow via `php artisan invite:dev-url` → confirm interview still works; admin logout does not break the interview cookie.

---

## 4. Staging (when deploying)

- [ ] Add staging redirect URI to the same OAuth client (or a separate client), e.g.  
  `https://your-staging-host/auth/google/callback`
- [ ] Set staging `GOOGLE_*` and `APP_URL` in the host environment.
- [ ] Document the staging URL in your team runbook (not in this repo unless you add a `docs/plan/staging.md` later).

---

## 5. Before starting F6 (recommended)

| Goal | Blocked without §1–3? |
|------|------------------------|
| Implement F6 API + React (invites, settings PATCH, review) | **No** — use PHPUnit + `actingAs()`. |
| Click-through F6 UI in browser as a logged-in studio user | **Yes** — complete §1–3 first. |
| Create real invites from admin and open client URL in incognito | **Yes** for full path; partial testing still possible via `invite:dev-url` + seeders until E6.1 ships. |

---

## References

- [auth.md](../technical/auth.md) — cookie separation, OAuth routes.
- [admin-api.md](../technical/admin-api.md) — admin API and SPA auth gate.
- [README.md](../../README.md) — Admin Google OAuth (F5) section.
- [implementation-plan.md](./implementation-plan.md) — F5 validation criteria (E5.1, E5.2).
