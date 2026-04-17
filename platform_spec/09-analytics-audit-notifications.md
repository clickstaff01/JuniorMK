# 09 — Analytics, Audit & Notifications

## 9.1 Analytics

### Events to track (PostHog)

Use a single helper `track(event, properties)` in `lib/analytics.ts`. Event names use `snake_case`.

- `user_invited`
- `user_activated`
- `sign_in`
- `sign_out`
- `lesson_opened` — `{ lessonId, weekId, courseId }`
- `lesson_read` — auto-fired when progress reaches 80% scroll after 30s
- `assignment_opened` — `{ assignmentId }`
- `assignment_autosaved` — `{ assignmentId, questionId }`
- `assignment_submitted` — `{ assignmentId, version }`
- `submission_graded` — `{ submissionId, overallStatus, durationMs }`
- `rework_requested` — `{ submissionId }`
- `feedback_snippet_used` — `{ snippetId }`
- `content_published` — `{ entity, entityId }`
- `audit_viewed` — admin viewed audit page

### Dashboards

#### Staff self-view (their own progress)
- Progress ring per week.
- Streak (consecutive days with activity).
- Current grade across all assignments.

#### Manager view
- Pending-to-grade by mentee.
- Median grading time.
- Rework rate per mentee.

#### Admin / MD view
- Count of active staff per cohort.
- Average time per week (with whisker plot).
- Drop-off funnel: invited → activated → week 1 complete → week 4 complete.
- Grade distribution per assignment.
- Rework rate per assignment (identifies unclear assignments).

### SQL examples

All aggregations are read-only queries from the app's own database (no pipeline required in MVP).

```ts
// Average days to complete Week 1 per cohort
const result = await prisma.$queryRaw`
  SELECT strftime('%Y-%m', e.startedAt) AS cohort,
         AVG(JULIANDAY(lp_last.readAt) - JULIANDAY(e.startedAt)) AS avgDays
  FROM Enrollment e
  JOIN Lesson l ON l.weekId IN (SELECT id FROM Week WHERE courseId = e.courseId AND "order" = 1)
  JOIN LessonProgress lp_last ON lp_last.lessonId = l.id AND lp_last.userId = e.userId
  WHERE lp_last.readAt IS NOT NULL
  GROUP BY cohort;
`;
```

(For Postgres, swap `JULIANDAY` → `EXTRACT(EPOCH FROM (a - b)) / 86400`.)

### Exports

- `GET /api/analytics/export.csv?type=submissions` — all submissions with grades.
- `GET /api/analytics/export.csv?type=users` — user roster with status.

## 9.2 Audit Log

### What we log

- Every **create / update / delete** of: `User`, `Course`, `Week`, `Lesson`, `Assignment`, `Question`, `Rubric`, `RubricRow`, `Submission`, `Answer`, `RubricScore`.
- Every **auth event**: sign in / sign out / password reset / invite sent / role change.
- Every **submission transition**: submit / grade / rework / approve.

### Write path

```ts
// lib/audit/log.ts
export async function logAudit({
  actorId, action, entity, entityId, before, after, ip, userAgent
}: AuditInput) {
  await prisma.auditLog.create({
    data: { actorId, action, entity, entityId, before, after, ip, userAgent }
  });
}
```

Call `logAudit` inside every mutation after the DB write succeeds. Diff `before` vs `after` using `jsondiffpatch` or store full objects up to 64 KB each.

### Retention

- Never delete. The audit log is the source of truth for compliance.
- Archive records older than 365 days to a separate `AuditLogArchive` table (future optimization).

### UI

- `/admin/audit` with filter bar (actor, entity, action, date range).
- Each row: timestamp • actor (email) • action • entity • entityId • short summary.
- Click row → drawer with `before` JSON vs `after` JSON (syntax-highlighted diff).
- Export CSV of current filter.

## 9.3 Notifications

### Channels

- **Email** via Resend.
- **In-app** via `Notification` model.

### Triggers

| Trigger | Email | In-app |
|---|---|---|
| User invited | ✅ | — |
| Password reset | ✅ | — |
| Assignment graded | ✅ | ✅ |
| Rework requested | ✅ | ✅ |
| New submission (to manager) | ✅ | ✅ |
| Assignment due in 24h | ✅ | ✅ |
| New feedback comment | — | ✅ |

### Email templates

In `emails/` using react-email:
- `InviteEmail.tsx`
- `PasswordResetEmail.tsx`
- `GradedEmail.tsx`
- `ReworkEmail.tsx`
- `NewSubmissionEmail.tsx`
- `DueSoonEmail.tsx`

Each template is bilingual (pass `locale` prop; default `th`).

### User preferences

`/settings/notifications`:
- Toggle each email type on/off.
- "Do not disturb" hours (no emails between 20:00 and 08:00 Asia/Bangkok; queue until morning).

### Scheduled sends

- **Due-soon job**: cron every hour; queries submissions with due < 24h and not yet submitted; sends email + in-app.
- Use `vercel.json` cron or Upstash QStash.
- Deduplicate: maintain a `NotificationDispatch` ledger so each (user, assignment, trigger) only fires once.
