# Click Broker — Internal Learning & Assignment Platform

Internal web platform that replaces Google Docs / Sheets for onboarding new staff. Staff read course content, complete assignments inside the platform, and managers grade and give feedback — all in one place.

## Who this is for

- **Non-technical owner (you, the MD)**: You will not write code. You will run Claude Code against these spec files and approve each build phase.
- **Claude Code (AI developer)**: Reads every file in this folder, starting with `CLAUDE.md`, and builds the product phase by phase.
- **Future internal IT / vendor**: Can maintain the code because it follows standard Next.js + Prisma patterns.

## What to read first

1. `CLAUDE.md` — the build brief for Claude Code. Start here when you start coding.
2. `01-product-overview.md` — what we are building and why.
3. `15-build-phases.md` — the ordered phases. Build phase 1 first, ship it, then phase 2.

## File index

| File | Purpose |
|---|---|
| `CLAUDE.md` | Instructions Claude Code should read before every session |
| `01-product-overview.md` | Vision, personas, success metrics |
| `02-feature-spec.md` | Every feature, prioritized MVP / v1.1 / v2 |
| `03-user-flows.md` | Step-by-step user journeys |
| `04-tech-stack.md` | Versions, libraries, conventions |
| `05-data-model.md` | Full Prisma schema |
| `06-api-spec.md` | Every API route and its contract |
| `07-ui-spec.md` | Page-by-page UI and components |
| `08-auth-roles-i18n.md` | Auth, role-based access, Thai/English |
| `09-analytics-audit-notifications.md` | Dashboards, audit log, emails |
| `10-content-seed.md` | Week-by-week course content to seed |
| `11-assignments-seed.md` | Assignments A1–A6 as structured seed data |
| `12-rubric-seed.md` | Grading rubric seed data |
| `13-testing.md` | Test strategy and minimum coverage |
| `14-deployment.md` | SQLite for dev, Postgres + Vercel/Railway for prod |
| `15-build-phases.md` | Phase-by-phase ordered build plan |

## Success in one sentence

A new hire logs into the platform Monday morning of her first day, reads Week 1, submits A1 by Friday, the manager grades it with one click, and everything is stored, versioned, and searchable without a single Google Doc being created.
