# 02 — Feature Spec

Every feature has an ID so we can reference it in code, issues, and tests (e.g., `F-LEARN-01`).

## F-AUTH — Authentication

- `F-AUTH-01` Sign in with email + password.
- `F-AUTH-02` Admin can invite a new user by email; invitee gets a set-password link valid for 7 days.
- `F-AUTH-03` Forgot password: email reset link.
- `F-AUTH-04` Logout on every device (revoke all sessions).
- `F-AUTH-05` Account lockout after 5 failed attempts in 10 minutes.
- `F-AUTH-06` Session timeout after 12 hours of inactivity.

## F-ROLES — Role-Based Access

Three roles: `STAFF`, `MANAGER`, `ADMIN`. A user has exactly one role.
- Staff: see only their own content, submissions, grades.
- Manager: see staff they are assigned to mentor. Grade submissions.
- Admin: everything, including content authoring and user management.

## F-LEARN — Learning / Course Reading

- `F-LEARN-01` Courses have weeks; weeks have lessons; lessons are Markdown content.
- `F-LEARN-02` Staff dashboard shows their current week.
- `F-LEARN-03` Lesson viewer renders Markdown with images, tables, lists, code, callouts.
- `F-LEARN-04` Progress is tracked per lesson (auto-mark as read after 30s + scroll to 80%).
- `F-LEARN-05` "Next / previous lesson" navigation.
- `F-LEARN-06` Bookmark / favorite a lesson for re-reading.

## F-ASSIGN — Assignments

- `F-ASSIGN-01` Assignments belong to a week. Each assignment has a title, description (Markdown), due date, and one or more questions.
- `F-ASSIGN-02` Question types:
  - `SHORT_TEXT` (single line)
  - `LONG_TEXT` (rich text via TipTap)
  - `MULTIPLE_CHOICE` (single answer)
  - `CHECKBOXES` (multi answer)
  - `TABLE` (rows × columns, defined by admin, staff fills in cells)
  - `FILE_UPLOAD` (PDF, image, docx, xlsx, pptx; 25 MB max)
  - `URL`
- `F-ASSIGN-03` Staff can save draft at any time. Autosave every 15 seconds.
- `F-ASSIGN-04` Submit locks the answer unless the manager sends it back with "Needs rework".
- `F-ASSIGN-05` Late submission flagged visually. No blocking.
- `F-ASSIGN-06` Version history: every submit creates a new version.

## F-GRADE — Grading & Feedback

- `F-GRADE-01` Manager views a submission with side-by-side question + answer.
- `F-GRADE-02` Manager can select a rubric level per rubric row (Great / OK / Needs Rework) and add a comment.
- `F-GRADE-03` Overall status: `PENDING`, `GRADED`, `NEEDS_REWORK`, `APPROVED`.
- `F-GRADE-04` Manager can save grading as draft before sending.
- `F-GRADE-05` Reusable feedback snippets — manager maintains a personal library of frequently used comments.
- `F-GRADE-06` Staff is notified by email + in-app when graded.

## F-CONTENT — Content Authoring (Admin)

- `F-CONTENT-01` Admin can create / edit / archive courses, weeks, lessons, assignments.
- `F-CONTENT-02` Markdown editor with live preview.
- `F-CONTENT-03` Bilingual editor: every field has a Thai tab and an English tab.
- `F-CONTENT-04` Upload images and embed in lessons.
- `F-CONTENT-05` Duplicate an entire course / week for a new cohort.
- `F-CONTENT-06` Bulk import: upload a ZIP of `.md` files that match a naming convention, and they become lessons.

## F-USERS — User Management (Admin)

- `F-USERS-01` Invite new users, set their role, assign a mentor (manager).
- `F-USERS-02` Bulk import users from CSV.
- `F-USERS-03` Deactivate a user (retains their data).
- `F-USERS-04` Transfer a staff from one manager to another.

## F-DASH — Dashboards

- `F-DASH-STAFF` Staff dashboard: current week, next assignment due, latest grade, streak indicator.
- `F-DASH-MANAGER` Manager dashboard: list of staff I mentor, each staff's status, pending-to-grade count.
- `F-DASH-ADMIN` Admin dashboard: all staff across all cohorts, flag anyone more than 3 days behind, average grade per cohort.

## F-ANALYTICS — Analytics

- `F-ANALYTICS-01` Admin sees: average time per week, average grade per assignment, drop-off rate.
- `F-ANALYTICS-02` Export any dashboard to CSV.
- `F-ANALYTICS-03` Cohort comparison (batch of hires vs. another batch).

## F-NOTIFY — Notifications

- `F-NOTIFY-01` Email: on invite, on password reset, on assignment graded, on rework requested, on upcoming due date (24h before).
- `F-NOTIFY-02` In-app notifications bell icon.
- `F-NOTIFY-03` User notification preferences page: email on/off per type.

## F-I18N — Localization

- `F-I18N-01` All UI chrome strings externalized to locale files: `th` (default) and `en`.
- `F-I18N-02` Top-bar language toggle.
- `F-I18N-03` Lesson and assignment content can have both Thai and English; staff sees their preferred language if available, otherwise falls back.

## F-AUDIT — Audit Log

- `F-AUDIT-01` Every write (create/update/delete of a user, a course, a submission, a grade, a role change, a password change) is logged.
- `F-AUDIT-02` Admin can filter by actor, entity, date range.
- `F-AUDIT-03` Audit entries are append-only. No deletion from UI.

## Priority

**MVP (Phase 1 + 2)**: F-AUTH, F-ROLES, F-LEARN, F-ASSIGN (SHORT_TEXT, LONG_TEXT, FILE_UPLOAD), F-GRADE, F-DASH-STAFF, F-DASH-MANAGER, F-I18N, F-AUDIT, seed content.

**v1.1 (Phase 3)**: F-CONTENT full editor, F-USERS bulk import, F-NOTIFY, remaining question types, F-DASH-ADMIN.

**v1.2 (Phase 4)**: F-ANALYTICS, reusable feedback snippets, version history UI, export to CSV.
