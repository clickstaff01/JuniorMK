# 04 — Tech Stack

## Runtime

- **Node.js**: 20 LTS
- **Package manager**: pnpm (strict, with lockfile)

## Framework & Language

- **Next.js 14** (App Router, React Server Components)
- **TypeScript**: strict mode, no `any`

## Database

- **Dev**: PostgreSQL 16 via Docker Compose (matches prod). SQLite optional for unit tests only.
- **Prod**: PostgreSQL 16 on **Railway** (managed Postgres add-on).
- **ORM**: Prisma 5 with `provider = "postgresql"` in every environment.
- **Migrations**: Prisma Migrate; every schema change gets a migration file committed. `prisma migrate deploy` runs automatically on every Railway deploy.

## Auth

- **NextAuth v5 (Auth.js)** with Credentials provider (email + password) and Email provider (magic link) as a fallback.
- **bcrypt** for password hashing (work factor 12).
- **Session**: database strategy (not JWT) so we can revoke.

## UI

- **Tailwind CSS** + **shadcn/ui** components (Radix under the hood).
- **Lucide icons**.
- **next-themes** for light / dark.

## Forms & Validation

- **React Hook Form** + **Zod** resolver.
- **Zod** schemas shared between client and server (define once, reuse).

## Rich Text

- **TipTap** (ProseMirror) with a fixed toolbar (bold, italic, heading, list, link, blockquote, code, image).
- Store as JSON in the DB; render via TipTap's read-only component.

## Markdown (for lesson content)

- **react-markdown** + **remark-gfm** for tables, task lists, strikethrough.
- **shiki** for code highlighting.

## File Upload

- **UploadThing** or **Cloudflare R2** via S3 SDK. Pick UploadThing to start (simpler).
- Max file size: 25 MB. Allowed types: PDF, PNG, JPG, DOCX, XLSX, PPTX.

## i18n

- **next-intl**. Locale files at `messages/th.json` and `messages/en.json`.
- Default locale: `th`. URL pattern: `/th/...` and `/en/...`.

## Email

- **Resend** with **react-email** for templates. Set `RESEND_FROM_EMAIL=no-reply@clickbroker.co.th`.

## Analytics / Logging

- **PostHog** (self-hosted optional) for product analytics events.
- **Sentry** for error tracking.
- **Pino** for structured server logs.

## Testing

- **Vitest** for unit + integration tests.
- **Playwright** for e2e tests.
- **MSW** for mocking HTTP in unit tests.

## CI / CD

- **GitHub Actions**:
  - `ci.yml`: lint, typecheck, test on every PR.
  - `cron.yml`: hourly cron that pings `/api/cron/due-soon` on Railway (see `14-deployment.md`).
  - `db-backup.yml`: weekly logical Postgres dump to Cloudflare R2.
- **Deployments**: Railway auto-deploys from GitHub. Merge to `staging` branch → staging project. Merge to `main` → production project.
- **Preview deployments**: Railway PR Environments (Pro plan). If on starter plan, deploy PRs to staging instead.

## Hosting

- **App**: Railway (Next.js web service).
- **DB**: Railway managed Postgres (same project as the web service).
- **Storage**: UploadThing (MVP), with weekly mirror to Cloudflare R2.
- **Email**: Resend.
- **Cron**: GitHub Actions calling a protected `/api/cron/*` endpoint.

## Directory layout

```
app/                     Next.js App Router
  (auth)/                Public auth pages
  (dashboard)/           Authenticated pages
    dashboard/
    learn/week/[slug]/
    learn/lesson/[slug]/
    assignments/[id]/
  (manage)/              MANAGER and ADMIN pages
    queue/
    submission/[id]/
  (admin)/               ADMIN only
    courses/
    users/
    audit/
    analytics/
  api/                   Route handlers (prefer Server Actions where possible)
components/              Shared React components
lib/
  auth/                  NextAuth config
  db/                    Prisma client
  i18n/                  next-intl helpers
  validators/            Zod schemas
  audit/                 Audit-log helper
prisma/
  schema.prisma
  seed.ts
  migrations/
messages/
  th.json
  en.json
tests/
  unit/
  e2e/
scripts/                 One-off operational scripts
```

## Coding conventions

- ESLint (Next + Prettier config), no warnings allowed.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `test:`.
- Every PR has a plain-English title ("Add grading screen for managers"), not tech-jargon titles.
- Branch naming: `feat/<phase>-<short-name>`, e.g., `feat/phase2-grading-queue`.
