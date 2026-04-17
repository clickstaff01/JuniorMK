# CLAUDE.md — Build Brief for Claude Code

You are helping a non-technical owner build an internal learning-and-assignment platform for Click Insurance Broker. Read every file in this `platform_spec/` folder before writing code. Build in the order described in `15-build-phases.md`.

## Rules you must follow

1. **Never guess requirements.** If a spec file is silent on something, ask the owner before deciding. The owner is non-technical; phrase questions in plain language and offer a recommended default.
2. **Work phase by phase.** Do not skip ahead to later phases. At the end of each phase, write a one-paragraph summary of what you built, what you did not build, and what the owner should click to verify it works.
3. **Keep the owner in the loop without overwhelming them.** Every commit message must be in plain English (not tech jargon). Every readme you write must be readable by the owner.
4. **Write tests for every feature you build.** See `13-testing.md`. Do not merge code that has no tests.
5. **Default to simple.** When there are two ways to do something, pick the one with less code, fewer dependencies, and fewer configuration steps.
6. **Bilingual from day 1.** Every user-facing string must go through the i18n layer. No hardcoded English or Thai strings in components. See `08-auth-roles-i18n.md`.

## Tech stack (locked — do not substitute without asking)

- Next.js 14 App Router, TypeScript strict mode
- Prisma ORM with PostgreSQL in every environment (local via Docker Compose, prod on Railway)
- NextAuth v5 (email + password, magic link optional later)
- Tailwind CSS + shadcn/ui
- next-intl for i18n (Thai default, English secondary)
- React Hook Form + Zod for all forms
- TipTap for rich-text assignment answers
- Resend for transactional email
- Vitest for unit tests, Playwright for e2e
- Deployed to **Railway** (web service + managed Postgres, in the same Railway project). See `14-deployment.md`.

See `04-tech-stack.md` for exact versions and rationale.

## How to communicate with the owner

- At the **start of a session**: paste a one-line summary of what you plan to do today.
- At the **end of a session**: list (a) what's done, (b) what's left in the current phase, (c) one click-through test the owner can do to verify.
- When **blocked**: stop and ask. Do not invent a silent default.

## How to seed content

All seed data is in `10-content-seed.md`, `11-assignments-seed.md`, `12-rubric-seed.md`. Write a `prisma/seed.ts` that reads these files (or a JSON export of them) and inserts them. Running `npm run db:seed` must populate a fresh database with everything a new staff member needs.

## Definition of done (for the full project)

- A new staff account can log in, read Week 1 in Thai or English, submit A1 with rich text, and see it in their dashboard.
- A manager account can see all submissions for a staff member, grade with the rubric, and leave a comment.
- An admin account can add a new course, new week, new assignment, without touching code.
- Email notifications fire on submission and on grading.
- There is an analytics dashboard showing: staff progress, average time per week, average grade per assignment.
- Every action that changes data is in the audit log.
- Thai is the default UI; the user can toggle English from the top bar.
- CI passes. Tests pass. App deploys to staging on every merge to `main`.
