# 14 — Deployment (Railway + Postgres)

We deploy the app **and** the database on **Railway**. Two Railway services inside one Railway project:

1. **Web service** — the Next.js app (built from the GitHub repo).
2. **Postgres service** — Railway's managed Postgres add-on.

A third optional service can be added later for scheduled jobs (see 14.7).

## 14.1 Environments

| Env | DB | Host | Purpose |
|---|---|---|---|
| `local` | SQLite (`file:./dev.db`) | `pnpm dev` | Coding, tests |
| `staging` | Railway Postgres (staging project) | Railway | Pre-prod smoke test |
| `production` | Railway Postgres (production project) | Railway | Live |

Use **two Railway projects** (one per env), not one project with two services. This keeps prod data isolated from staging experiments.

PR preview environments are available on Railway Pro as "PR Environments"; if you're on the starter plan, skip previews for now and just deploy PRs to staging.

## 14.2 One-time Railway setup (owner does this in Railway UI)

1. Sign in to railway.app with GitHub.
2. "New Project" → "Deploy from GitHub repo" → pick your repo. Railway auto-detects Next.js.
3. In the same project: "New" → "Database" → "PostgreSQL". Railway provisions a Postgres instance.
4. Click the Postgres service → "Connect" → copy the `DATABASE_URL` variable reference.
5. Back on the web service → "Variables" → add each env var (see 14.4). For `DATABASE_URL`, paste `${{ Postgres.DATABASE_URL }}` (this uses Railway's variable-reference syntax so the URL updates automatically if Postgres is redeployed).
6. Repeat steps 1–5 to create a second project named `click-broker-learning-staging`.

## 14.3 Repository config

Create `railway.json` at the repo root:

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "pnpm install --frozen-lockfile && pnpm build"
  },
  "deploy": {
    "startCommand": "pnpm prisma migrate deploy && pnpm start",
    "healthcheckPath": "/api/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 3
  }
}
```

Notes:
- `pnpm prisma migrate deploy` runs on every deploy so the schema stays in sync.
- Railway detects `pnpm-lock.yaml` and uses pnpm automatically.
- Node version: add `"engines": { "node": ">=20 <21" }` to `package.json`.

## 14.4 Environment variables (Railway dashboard)

Set these on the web service. Never commit secrets. Keep a `.env.example` in the repo.

```
# App
NEXTAUTH_URL=https://learn.clickbroker.co.th            # your custom domain
NEXTAUTH_SECRET=                                         # generate: openssl rand -base64 32
NODE_ENV=production

# Database (Railway-managed — use variable reference)
DATABASE_URL=${{ Postgres.DATABASE_URL }}

# Email
RESEND_API_KEY=
RESEND_FROM_EMAIL=no-reply@clickbroker.co.th

# Uploads
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Monitoring
SENTRY_DSN=
POSTHOG_KEY=
POSTHOG_HOST=https://app.posthog.com

# Feature flags
FEATURE_ANALYTICS=true
FEATURE_NOTIFY_CRON=true
```

## 14.5 Prisma: SQLite locally, Postgres on Railway

Two ways to handle the provider difference. Pick **Option A (recommended)** — it keeps the schema simple and matches what every other Next.js/Prisma/Railway project does.

### Option A — use Postgres for every environment except unit tests

1. `prisma/schema.prisma`: set `provider = "postgresql"` permanently.
2. For local dev: run a local Postgres via `docker compose up -d` (Claude Code will generate the `docker-compose.yml`). Local `DATABASE_URL` = `postgresql://postgres:postgres@localhost:5432/clickbroker_dev`.
3. For unit tests: use `@prisma/adapter-pglite` or spin up a Postgres container in CI. Do **not** use SQLite.

### Option B — multi-provider (more complex)

Keep SQLite for local dev by committing `prisma/schema.sqlite.prisma` and `prisma/schema.postgres.prisma` and swapping via an env flag. Only choose this if you truly cannot run Docker locally. Not recommended.

### Migrations

- Local dev: `pnpm prisma migrate dev` creates and applies a migration file.
- Production: the `railway.json` `startCommand` runs `pnpm prisma migrate deploy` on every deploy — applies any new migrations, no prompts.

### Seed

- Run once against production the first time: from your machine, `DATABASE_URL=<prod-url> pnpm db:seed`.
- Or one-shot via Railway CLI: `railway run pnpm db:seed` (it injects prod env vars).

## 14.6 Custom domain

1. Railway dashboard → web service → Settings → Domains → "Add custom domain" → `learn.clickbroker.co.th`.
2. Railway shows a `CNAME` target like `xyz.up.railway.app`. Add this CNAME in your DNS provider.
3. Wait a few minutes; Railway auto-issues Let's Encrypt HTTPS.
4. Update `NEXTAUTH_URL` env var to `https://learn.clickbroker.co.th`.

## 14.7 Scheduled jobs (due-soon notifications)

Railway does **not** have a built-in `vercel.json` cron equivalent. Two clean patterns — pick one:

### Pattern 1 — GitHub Actions cron (simplest, free)

`.github/workflows/cron.yml`:
```yaml
name: Hourly cron
on:
  schedule:
    - cron: "0 * * * *"     # every hour on :00
jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Call due-soon endpoint
        run: |
          curl -fsSL -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            https://learn.clickbroker.co.th/api/cron/due-soon
```

Protect `/api/cron/due-soon` with a header check (`CRON_SECRET`). Cheap, reliable.

### Pattern 2 — Second Railway service as a worker

Add a worker service to the same Railway project running `node scripts/cron.ts` on a loop with `setInterval(..., 60 * 60 * 1000)`. More control, slightly more code.

MVP recommendation: **Pattern 1**.

## 14.8 Backups

- Railway Postgres: enable the **Scheduled Backups** add-on in the Postgres service settings. Default daily at UTC midnight.
- Point-in-time recovery (PITR) is available on the Postgres Pro plan. Recommended once you have real user data.
- Additionally, run a weekly logical dump from GitHub Actions and push to Cloudflare R2:
  ```yaml
  # .github/workflows/db-backup.yml
  - run: |
      pg_dump "$DATABASE_URL" | gzip > backup.sql.gz
      aws s3 cp backup.sql.gz s3://clickbroker-backups/$(date +%F).sql.gz \
        --endpoint-url https://<acct>.r2.cloudflarestorage.com
  ```
- Uploaded files live in UploadThing; mirror weekly to R2 the same way.
- Audit log is inside Postgres — covered by the same backups.

## 14.9 Runbook: restore from backup

1. Railway dashboard → Postgres service → Backups → pick a backup → Restore.
2. Railway creates a **new** Postgres instance from the backup.
3. Point the web service's `DATABASE_URL` at the restored instance (change the variable reference to the new service).
4. Redeploy the web service.
5. Verify by logging in as admin → audit log should be intact.

## 14.10 Monitoring & alerting

- **Sentry**: alert if error rate > 10/hr → email MD.
- **Railway metrics**: built-in CPU/memory/response-time graphs.
- **Uptime**: external check via BetterStack or Cronitor every 1 min on `https://learn.clickbroker.co.th/api/health`.

## 14.11 Health-check endpoint

`GET /api/health` returns:
```json
{ "ok": true, "db": "up", "email": "up", "version": "1.2.3" }
```
503 if DB down. Railway's healthcheck in `railway.json` pings this path on every deploy; if it fails, Railway rolls back.

## 14.12 Rollout policy

- Every PR → merged to `staging` branch → auto-deploys to staging Railway project.
- Staging smoke test → owner approves → merge `staging` into `main` → auto-deploys to production.
- Railway keeps the previous deployment; rollback is one click in the Railway dashboard ("Redeploy" an older build).
- Database migrations are always additive first (`ADD COLUMN ... NULL`), backfill in a separate deploy, then tighten — never destructive in one shot.

## 14.13 Costs (rough, check Railway pricing for current numbers)

- Starter plan: $5/mo credit included, usage-based beyond. Sufficient for single app + small Postgres until ~10–20 active staff.
- Pro plan ($20/mo): includes PR environments, PITR, priority support. Recommended once in live use.
- Postgres storage: a few GB is pennies. 10 GB is still cheap.
- Bandwidth: minimal for an internal tool.
- Expect total Railway spend under $30/mo for the first year at current usage.
