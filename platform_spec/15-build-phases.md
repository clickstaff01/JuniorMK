# 15 — Build Phases

Claude Code: build in order. Do not skip. At the end of each phase, ship to staging, pause, and let the owner verify the acceptance checklist before starting the next phase.

---

## Phase 0 — Foundation (≈ 1 day)

**Goal**: empty app runs, CI passes.

Deliverables:
- Scaffold Next.js 14 App Router + TypeScript strict.
- Configure Tailwind + shadcn/ui.
- Configure Prisma with `provider = "postgresql"` and the full schema from `05-data-model.md`.
- `docker-compose.yml` with a local Postgres service (`postgres-dev` on port 5432, `postgres-test` on 5433).
- Configure next-intl, add `messages/th.json` and `messages/en.json`.
- Configure GitHub Actions `ci.yml` (lint + typecheck + test, using a Postgres service).
- Commit `.env.example` and `railway.json` (see `14-deployment.md`).
- `/api/health` endpoint.

Owner acceptance:
- Run `docker compose up -d && pnpm dev` locally → see a Thai "Hello" on `/`.
- CI green on PR.
- Owner creates the staging Railway project (5-minute UI flow from `14-deployment.md` section 14.2) and the app deploys automatically on merge to `staging`.

---

## Phase 1 — Auth, Roles, Seed Data (≈ 2–3 days)

**Goal**: users can log in. Seed data loaded. Basic layout.

Deliverables:
- NextAuth v5 with Credentials + Email providers.
- Sign-in, set-password, forgot-password, reset-password pages.
- Role middleware for route protection.
- `prisma/seed.ts` reads `seed/content.json`, `seed/assignments.json`, `seed/rubrics.json` and inserts everything.
- Convert `10-content-seed.md`, `11-assignments-seed.md`, `12-rubric-seed.md` into those JSON files (extracting lesson bodies from the Word documents).
- AppShell layout, language toggle, notification bell (placeholder), avatar menu.
- Admin seed script creates: 1 admin, 1 manager, 1 staff (mentee of that manager).

Owner acceptance:
- Log in as admin, manager, staff — each lands on the right shell.
- Log out and attempt `/manage/queue` as staff → blocked with a friendly message.
- Thai ↔ English toggle flips chrome strings.

---

## Phase 2 — Learn + Assignments + Grading (MVP core) (≈ 5–7 days)

**Goal**: staff reads content, submits an assignment, manager grades it.

Deliverables:
- `/dashboard` (staff), `/learn/week/[slug]`, `/learn/lesson/[slug]` with progress tracking.
- `/assignments/[id]` with SHORT_TEXT, LONG_TEXT (TipTap), FILE_UPLOAD question types.
- Autosave + draft + submit flow.
- `/manage/queue`, `/manage/submission/[id]` with rubric grading + comments.
- Submission versioning on NEEDS_REWORK → resubmit.
- Audit log writes on every mutation.
- Basic email templates (Invite, Graded, Rework, NewSubmission) via Resend.

Owner acceptance (e2e): A staff can sign in → read Week 1 Lesson 1 → submit A1 with at least 5 answers + 1 file → manager grades it → staff sees approved status.

---

## Phase 3 — Content Authoring, Users, Notifications (≈ 5 days)

Deliverables:
- `/admin/courses` full CRUD: create / edit / publish / duplicate.
- Lesson Markdown editor with Thai + English tabs, live preview, image upload.
- Assignment builder with all remaining question types (MULTIPLE_CHOICE, CHECKBOXES, TABLE, URL).
- `/admin/users` full management + bulk CSV invite.
- In-app notifications + email notifications wired up for all triggers.
- Notification preferences page.
- Due-soon cron job.

Owner acceptance:
- Admin can create a brand-new course with 1 week, 2 lessons, 1 assignment of each question type — without touching code.
- Bulk-invite 3 users from a CSV; all 3 receive emails and can set passwords.

---

## Phase 4 — Analytics, Audit UI, Feedback Snippets, Export (≈ 4 days)

Deliverables:
- `/admin/dashboard` KPIs + staff table.
- `/admin/analytics` charts: time per week, grade distribution, rework rate, drop-off funnel.
- Cohort filter.
- CSV export endpoints.
- `/admin/audit` filterable view with JSON diff drawer.
- Manager feedback snippets CRUD + picker in grading UI.
- Submission version history UI.

Owner acceptance:
- MD opens `/admin/dashboard` and in one glance knows who is on track and who is behind.
- Audit log shows every mutation performed by any user over the last 7 days.

---

## Phase 5 — Hardening & Launch (≈ 3 days)

Deliverables:
- Accessibility pass (keyboard nav, contrast).
- Performance pass (Lighthouse ≥ 90 on mobile).
- Penetration-style review: auth guards on every route, no IDOR, rate limiting.
- Real email domain authenticated in Resend.
- Two Railway projects provisioned (staging + production), each with a managed Postgres service.
- Scheduled Backups enabled on production Postgres; weekly R2 mirror via GitHub Actions.
- Custom domain `learn.clickbroker.co.th` pointed at Railway with HTTPS.
- GitHub Actions cron hitting `/api/cron/due-soon` hourly with `CRON_SECRET`.
- Production deploy + smoke test.
- Admin / manager / staff handover docs (plain language).
- First real cohort onboarded.

Owner acceptance:
- Invite the real junior hire on day 1 of her month.
- She completes Week 1 entirely inside the platform.
- Her manager grades entirely inside the platform.
- No Google Docs / Sheets were used.

---

## Phase 6+ — Roadmap (nice-to-haves, not committed)

- AI-assisted first-pass grading (Claude as reviewer, manager approves).
- Peer review between staff.
- Gamification (streaks, badges).
- SSO with Google Workspace.
- PWA / installable mobile shell.
- Multi-tenant (separate brokerages on the same codebase).
- Course marketplace (share course templates between brokerages).
- Exam mode for certification.

## How Claude Code should pace itself

- At the start of a phase, open a GitHub issue summarizing the phase with checkboxes.
- Open 1 PR per feature. Keep PRs under ~400 changed lines where possible.
- Every PR description explains the change in plain English + links to the relevant spec file sections (e.g., "implements F-ASSIGN-02 from `02-feature-spec.md`").
- At phase end, write `STATUS_PHASE_N.md` in `platform_spec/` listing what shipped, what deferred, and what the owner should click.
