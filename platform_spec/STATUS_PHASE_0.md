# Phase 0 Status

**Date completed:** 2026-04-17
**Status:** Done — ready for owner verification

---

## What was built

| File / Folder | What it does |
|---|---|
| `package.json` | All dependencies locked (Next.js 14, Prisma 5, NextAuth v5, next-intl, Vitest, Playwright) |
| `tsconfig.json` | TypeScript strict mode, `@/*` path alias |
| `next.config.ts` | Next.js config with next-intl plugin wired in |
| `tailwind.config.ts` + `postcss.config.mjs` | Tailwind + shadcn/ui CSS variables |
| `components.json` | shadcn/ui configuration |
| `prisma/schema.prisma` | Full data model (PostgreSQL), all tables from spec |
| `docker-compose.yml` | Local Postgres on port 5432 (dev) and 5433 (test) |
| `messages/th.json` + `messages/en.json` | Thai (default) and English translations |
| `i18n/routing.ts` + `i18n/request.ts` | next-intl locale routing config |
| `middleware.ts` | Locale-routing middleware (adds `/th/` or `/en/` prefix) |
| `app/[locale]/layout.tsx` | Root layout — sets `<html lang>`, wraps with NextIntlClientProvider |
| `app/[locale]/page.tsx` | Homepage — shows Thai "สวัสดี" |
| `app/globals.css` | Tailwind base + shadcn CSS variables |
| `app/api/health/route.ts` | `GET /api/health` — returns `{ok, db, version}` |
| `lib/db/prisma.ts` | Prisma singleton client |
| `lib/utils.ts` | `cn()` class-name helper (used by shadcn components) |
| `lib/i18n/navigation.ts` | Locale-aware `Link`, `redirect`, `useRouter` |
| `vitest.config.ts` | Unit test config |
| `playwright.config.ts` | E2E test config |
| `tests/unit/health.test.ts` | Tests for `/api/health` (db up + db down cases) |
| `tests/unit/utils.test.ts` | Tests for `cn()` utility |
| `.github/workflows/ci.yml` | GitHub Actions: lint + typecheck + unit tests on every PR |
| `.env.example` | Template for all required env vars (no secrets) |
| `railway.json` | Railway build + deploy config (runs migrations before start) |
| `prisma/seed.ts` | Placeholder — real seed data added in Phase 1 |

---

## What was NOT built (by design — Phase 1+)

- Auth (sign-in page, NextAuth config)
- Route protection middleware
- AppShell layout, navigation bar
- Seed data (content, assignments, rubrics)
- Any `/dashboard`, `/learn`, `/manage`, or `/admin` pages

---

## To verify: 3-step check

**Step 1 — install and start**
```bash
# In the project folder:
pnpm install
docker compose up -d
cp .env.example .env.local
# Edit .env.local: set NEXTAUTH_SECRET to any random string for now
pnpm db:migrate
pnpm dev
```

**Step 2 — see Thai homepage**
Open `http://localhost:3000` in your browser.  
You should be redirected to `http://localhost:3000/th` and see the word **สวัสดี** on a white page.  
Change the URL to `http://localhost:3000/en` — you should see **Hello** instead.

**Step 3 — health check**
Open `http://localhost:3000/api/health` — you should see:
```json
{"ok":true,"db":"up","version":"0.1.0"}
```

If the DB is not running, you'll see `{"ok":false,"db":"down"}` with a 503 error instead.
