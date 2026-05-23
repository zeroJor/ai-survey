# HTTP middleware

| Cookie / guard | Used for | Set in |
|----------------|----------|--------|
| `interview_session` (name from config) | Client `/api/talk`, `/api/answers`, … | F2 `GET /invites` |
| Laravel `web` session | Studio `/api/admin/*` after Google OAuth | F5 |

Do not share middleware between interview and admin API routes.
