# 07 — UI Spec

This spec is page-by-page. Each page lists route, role, sections, components, empty / loading / error states.

## Global layout

- **App shell**: left sidebar (collapsible on mobile), top bar, main content.
- **Top bar**: logo (left), course breadcrumb (center), notifications bell + language toggle + avatar menu (right).
- **Sidebar for STAFF**: Dashboard, My Course → Week 1 / 2 / 3 / 4, My Submissions, Settings.
- **Sidebar for MANAGER**: Queue, My Mentees, My Feedback Snippets, Settings.
- **Sidebar for ADMIN**: Dashboard, Courses, Users, Queue, Audit, Analytics, Settings.

## Design tokens

- **Primary**: Click Broker blue (use a hex locked in `tailwind.config.ts`).
- **Typography**: Sarabun + Inter fallback. Thai content gets Sarabun.
- **Radius**: `rounded-2xl` on cards, `rounded-md` on inputs.
- **Spacing**: 4-based; `gap-2 / gap-4 / gap-6`.

---

## Pages

### `/auth/sign-in`
- Role: public.
- Fields: email, password, "Remember me".
- Links: Forgot password, Need an account? (contact admin).
- Error states: invalid creds (generic message), account locked (specific), account deactivated.

### `/auth/set-password`
- Role: public (token-gated).
- Token from URL; fields: new password + confirm with strength meter.
- Expired-token state: "Ask your admin for a new invite."

### `/dashboard` (STAFF)
- Welcome card with `Hi, {name}. Day {n} of 30.`
- Current Week card: title, lesson progress bar, next lesson button, next assignment due date.
- Latest Grade card: last graded assignment + score.
- Streak / reminders sidebar.
- Empty state (no enrollment yet): "You're not enrolled in any course. Ask your admin."

### `/learn/week/[slug]`
- Week header: title, description, completion ring.
- Lessons list: each row shows order, title, read indicator.
- Assignments list: each card shows code (A1), title, due date, status (DRAFT / SUBMITTED / GRADED).

### `/learn/lesson/[slug]`
- Markdown body.
- Floating table of contents on desktop (hidden on mobile).
- Progress tracker at bottom that fires `POST /api/learn/lessons/:id/progress` on scroll.
- Prev / Next buttons.
- "Mark as read" button (fallback for auto-tracking).

### `/assignments/[id]`
- Assignment header: code, title, description (Markdown), due date, submit button.
- For each question:
  - **SHORT_TEXT**: `Input`.
  - **LONG_TEXT**: TipTap editor with toolbar.
  - **MULTIPLE_CHOICE**: `RadioGroup`.
  - **CHECKBOXES**: `CheckboxGroup`.
  - **TABLE**: grid with header row defined by admin; cells `Input`.
  - **FILE_UPLOAD**: dropzone + list of uploaded files; max 25 MB; extensions allowed from config.
  - **URL**: `Input type=url`.
- Autosave indicator top-right ("Saved just now", "Saving…").
- Sticky submit bar at bottom.
- Confirm dialog before submit: "Once submitted, you cannot edit unless a manager requests rework."
- After submit, page becomes read-only and shows status banner.
- If `NEEDS_REWORK`: banner with manager comments per question; form becomes editable again; "Resubmit" button.

### `/submissions/my` (STAFF)
- Table: Assignment code, title, submitted date, version, status, grade.
- Filter by status.

### `/manage/queue` (MANAGER)
- List of pending submissions ordered by oldest first.
- Row: staff name, assignment code, submitted at, days waiting, [Grade] button.
- Bulk actions: mark seen.
- Empty state: "Nothing to review. Great work."

### `/manage/submission/[id]` (MANAGER)
- Two-column layout:
  - **Left**: questions + answers (read-only).
  - **Right**: rubric with Great / OK / Rework radio + per-row comment field.
- Top bar: staff name, assignment, submit version indicator.
- Bottom bar: overall summary textarea + action buttons: Save Draft, Needs Rework, Approve.
- Feedback snippet popover: pick a saved snippet to insert into the active comment field.

### `/manage/mentees` (MANAGER)
- Table: mentee, current week, % complete, last activity, pending submissions.
- Click row → mentee profile.

### `/admin/dashboard` (ADMIN)
- 4 KPI cards: Active staff, In progress, Behind schedule, Avg grade.
- Table of all staff with status.
- "Cohort" filter chips.

### `/admin/courses` (ADMIN)
- Grid of course cards with published state, weeks count, enrolled count.
- Actions: New course, Duplicate, Archive.

### `/admin/courses/[id]`
- Tabs: Weeks, Assignments, Rubrics, Settings.
- Inline editing with live preview.

### `/admin/courses/[id]/weeks/[weekId]/lessons/[lessonId]/edit`
- Split pane: editor (Markdown, Thai tab + English tab) on the left, preview on the right.
- Image upload inline via drag-drop into the editor.

### `/admin/users`
- Table with search, role filter, status filter.
- Row actions: edit, deactivate, resend invite.

### `/admin/users/invite` (single or bulk)
- Tab: Single / Bulk (CSV).
- CSV preview with per-row validation.

### `/admin/audit`
- Filter bar: actor, entity, action, date range.
- Table with timestamp, actor, action, entity, entity id.
- Row → modal with JSON diff.

### `/admin/analytics`
- Charts: time per week (box plot), grade distribution per assignment (histogram), cohort comparison (line chart).
- Export CSV button.

### `/settings`
- Profile (name, preferred locale).
- Change password.
- Notification preferences.
- Sign out everywhere.

---

## Components (in `components/`)

- `AppShell` — layout with sidebar + top bar.
- `LocaleSwitcher` — Thai / English toggle.
- `NotificationBell` — shows unread count, popover with list.
- `MarkdownView` — wrapped react-markdown with remark-gfm + shiki.
- `MarkdownEditor` — textarea with preview (admin content).
- `RichTextEditor` — TipTap wrapper used in LONG_TEXT questions.
- `RubricGrader` — right-pane component for `/manage/submission/[id]`.
- `DueDateBadge` — green / amber / red based on time-to-due.
- `ProgressRing` — circle with percentage.
- `StatusBadge` — DRAFT / SUBMITTED / GRADED / NEEDS_REWORK / APPROVED.
- `EmptyState` — reusable empty-state with icon + CTA.

## Empty / loading / error state rules

- Every list page must have a designed empty state (not a blank screen).
- Every page that fetches server data must show a skeleton for the first 200 ms, not a spinner.
- Every form validation error must render inline next to the field (not in a toast).
- Every server error gets a dismissible toast + entry in Sentry.

## Accessibility

- Target WCAG 2.1 AA.
- All interactive elements keyboard reachable.
- Color contrast >= 4.5:1 for body text, 3:1 for large text.
- Thai text must use fonts with proper Thai glyph coverage (Sarabun).
