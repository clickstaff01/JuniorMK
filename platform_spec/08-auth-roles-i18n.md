# 08 — Auth, Roles & i18n

## 8.1 Auth

- **NextAuth v5** with:
  - Credentials provider (email + bcrypt password).
  - Email provider (magic link) as a secondary method.
- **Session strategy**: database (so we can revoke a session).
- **Password policy**:
  - Minimum 10 characters.
  - Require at least one uppercase, one lowercase, one digit.
  - Reject top-10,000 common passwords (`zxcvbn` strength meter in UI).
- **Lockout**: 5 failed logins in 10 minutes → lock account for 15 minutes, notify by email.
- **Session expiry**: 12 hours of inactivity. Refresh on any request.
- **CSRF**: NextAuth built-in.
- **Cookie flags**: Secure, HttpOnly, SameSite=Lax.

### Middleware rule set

`middleware.ts` enforces:
- Public: `/`, `/auth/*`, `/api/auth/*`.
- Authenticated: `/dashboard`, `/learn/*`, `/assignments/*`, `/submissions/*`, `/settings`.
- MANAGER + ADMIN: `/manage/*`.
- ADMIN only: `/admin/*`.

## 8.2 Roles & Permissions

| Resource | STAFF | MANAGER | ADMIN |
|---|---|---|---|
| Read own profile | ✅ | ✅ | ✅ |
| Read other user profile | — | mentees only | ✅ |
| Create/update user | — | — | ✅ |
| Read course / lesson | enrolled only | enrolled only | ✅ |
| Create/update course | — | — | ✅ |
| Create submission | own only | — | ✅ |
| Read submission | own only | mentees only | ✅ |
| Grade submission | — | mentees only | ✅ |
| Manage feedback snippets | — | own only | own only |
| Read audit log | — | — | ✅ |
| Read analytics | — | own scope | ✅ |

### Code helper

```ts
// lib/auth/guards.ts
export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session) throw new UnauthorizedError();
  if (!allowed.includes(session.user.role)) throw new ForbiddenError();
  return session;
}
```

Every Server Action and route handler starts with `await requireRole([...])`.

### Ownership rules

- Staff: fetching a `Submission` by id must include `WHERE authorId = session.user.id` in the query.
- Manager: fetching a `Submission` must include `WHERE author.mentorId = session.user.id`.
- Do not rely on UI to enforce these — always enforce in the data layer.

## 8.3 i18n

- **Library**: `next-intl`.
- **Locales**: `th` (default) and `en`.
- **URL pattern**: `/th/...` or `/en/...`. A rewrite serves the user's preferred locale when no prefix is given.
- **Message files**: `messages/th.json`, `messages/en.json`. Namespaced by feature (`common`, `auth`, `learn`, `assignments`, `manage`, `admin`).
- **Content fields**: DB has `*Th` and `*En` pair. Rendering picks the user's preferred locale; if the other language is missing, show the available one plus a banner "ยังไม่มีคำแปล / Translation not available yet".

### Example message key

```json
// messages/th.json
{
  "common": { "save": "บันทึก", "cancel": "ยกเลิก", "submit": "ส่ง" },
  "assignments": { "dueOn": "ครบกำหนด {date}" }
}
```

```tsx
const t = useTranslations("common");
<button>{t("save")}</button>
```

### Date & number formatting

- Use `Intl.DateTimeFormat("th-TH-u-ca-gregory", ...)` for Thai dates (note: Buddhist calendar switched off — use Gregorian for internal consistency).
- Currency: THB with Intl.NumberFormat.
- Timezone: `Asia/Bangkok` stored per-user, defaults to Bangkok.

### Static-content authoring

- Admin sees two tabs ("ไทย" / "English") on every content field.
- On save, both fields are persisted. Empty = translation missing.

## 8.4 Security Checklist (Phase 1 gate)

- [ ] Secrets only via env vars; `.env.local` ignored in Git.
- [ ] Input validation with Zod on every mutation.
- [ ] All DB queries use Prisma (no raw SQL with user input).
- [ ] Rate limiting via `@upstash/ratelimit` on auth + mutation routes.
- [ ] Content Security Policy set in `next.config.js`.
- [ ] File uploads scanned for MIME type mismatch.
- [ ] Error tracking via Sentry; no PII in error messages.
- [ ] No `console.log` of secrets.
