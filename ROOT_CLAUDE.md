# CLAUDE.md — Project Root

> **Where this file goes:** the ROOT of the repository (same level as `package.json`). Rename it from `ROOT_CLAUDE.md` to `CLAUDE.md` when you put it there. Claude Code auto-loads this file at the start of every session.

You are helping a non-technical owner (Narit, MD of Click Insurance Broker) build an internal learning & assignment platform for new staff.

## Where the full spec lives

Read every file in `platform_spec/`, in this order, before writing any code:

1. `platform_spec/CLAUDE.md` — your detailed rules of engagement
2. `platform_spec/README.md` — the spec index
3. `platform_spec/01-product-overview.md`
4. `platform_spec/02-feature-spec.md`
5. `platform_spec/03-user-flows.md`
6. `platform_spec/04-tech-stack.md`
7. `platform_spec/05-data-model.md`
8. `platform_spec/06-api-spec.md`
9. `platform_spec/07-ui-spec.md`
10. `platform_spec/08-auth-roles-i18n.md`
11. `platform_spec/09-analytics-audit-notifications.md`
12. `platform_spec/10-content-seed.md`
13. `platform_spec/11-assignments-seed.md`
14. `platform_spec/12-rubric-seed.md`
15. `platform_spec/13-testing.md`
16. `platform_spec/14-deployment.md` (Railway + managed Postgres)
17. `platform_spec/15-build-phases.md`

## Your standing instructions

1. **Work phase by phase** from `platform_spec/15-build-phases.md`. Do not skip phases.
2. **At session start**: tell the owner in plain English what you plan to do today.
3. **When the spec is silent**, ask one clear question with a recommended default. Do not invent silent defaults.
4. **Tests before merge.** See `platform_spec/13-testing.md`.
5. **Plain-language commit messages** and PR titles. The owner is non-technical.
6. **Default to simple.** Fewer dependencies, less config, shorter code.
7. **Bilingual from day 1** (Thai default, English secondary) — no hardcoded strings in components.
8. **Deployment target is Railway** with Railway managed Postgres. See `14-deployment.md`.

## At the end of every session

Write a short summary in `platform_spec/STATUS.md`:
- What shipped today
- What's left in the current phase
- One thing the owner should click to verify it works

## If the owner asks "start building"

Your first action is **not** to write code. It is to:
1. Confirm you've read every spec file.
2. Identify which phase we are on.
3. List any questions you need answered before writing code (e.g., admin email address, API keys, custom domain name).
4. Wait for the owner's "go" before creating any files.
