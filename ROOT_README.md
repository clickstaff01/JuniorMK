# Click Broker — Internal Learning Platform

> **Where this file goes:** the ROOT of the repository. Rename it from `ROOT_README.md` to `README.md`. This file is for humans — Claude Code does NOT auto-load it.

Internal web platform for onboarding new Click Insurance Broker staff: read course content, submit assignments, get graded, track progress over time.

## For humans

- Product spec: see `platform_spec/` folder.
- Status updates: `platform_spec/STATUS.md` (written by Claude Code at the end of each session).
- Deployment: Railway (see `platform_spec/14-deployment.md`).

## For Claude Code

Read `CLAUDE.md` at the repo root. It tells you everything.

## Local development

1. Install Node 20 and pnpm.
2. Install Docker Desktop.
3. `cp .env.example .env.local` and fill in values.
4. `docker compose up -d` — starts a local Postgres.
5. `pnpm install`
6. `pnpm prisma migrate dev`
7. `pnpm db:seed`
8. `pnpm dev` → visit `http://localhost:3000`.

## Deployment

Merge to `staging` branch → auto-deploys to staging Railway project.
Merge to `main` → auto-deploys to production Railway project.
