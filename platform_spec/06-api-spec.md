# 06 — API Spec

Prefer **Next.js Server Actions** over REST route handlers where possible. Use REST only when called from non-React clients or third parties. Every server action and API route must:
- validate input with Zod;
- check authorization via the shared `requireRole()` helper;
- write an `AuditLog` entry on any mutation.

All responses are JSON. All dates are ISO-8601 UTC. All IDs are cuid.

## 6.1 Auth

| Method | Path | Body | Response |
|---|---|---|---|
| POST | `/api/auth/set-password` | `{ token, password }` | `{ ok: true }` |
| POST | `/api/auth/forgot` | `{ email }` | `{ ok: true }` (no user enumeration) |
| POST | `/api/auth/reset` | `{ token, password }` | `{ ok: true }` |

Sign-in uses NextAuth built-in `/api/auth/callback/credentials`.

## 6.2 Users (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/users` | List users. Query: `q`, `role`, `status`, `page`, `pageSize`. |
| POST | `/api/users/invite` | `{ email, nameTh, nameEn?, role, mentorId?, courseIds? }`. Sends invite email. |
| POST | `/api/users/bulk-invite` | multipart CSV. Returns `{ accepted, rejected: [{row, reason}] }`. |
| PATCH | `/api/users/:id` | Partial update. Role change generates audit entry. |
| POST | `/api/users/:id/deactivate` | Soft-deactivate. |

## 6.3 Courses / Weeks / Lessons (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/courses` | List. |
| POST | `/api/courses` | Create `{ slug, titleTh, titleEn?, descriptionTh?, descriptionEn? }`. |
| PATCH | `/api/courses/:id` | Update. |
| POST | `/api/courses/:id/publish` | Toggle `isPublished`. |
| POST | `/api/courses/:id/duplicate` | Clone course + weeks + lessons + assignments + rubric. |
| POST | `/api/weeks` | `{ courseId, order, titleTh, titleEn? }`. |
| PATCH | `/api/weeks/:id` | Update. |
| POST | `/api/lessons` | Create lesson. |
| PATCH | `/api/lessons/:id` | Update body, title, etc. |
| DELETE | `/api/lessons/:id` | Soft-delete (archive). |
| POST | `/api/lessons/import` | Multipart ZIP upload; reads `.md` files by naming convention. |

## 6.4 Assignments & Questions (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/assignments` | `{ weekId, code, titleTh, dueOffsetDays, order }`. |
| PATCH | `/api/assignments/:id` | Update. |
| POST | `/api/assignments/:id/questions` | Add a question. |
| PATCH | `/api/questions/:id` | Update. |
| DELETE | `/api/questions/:id` | Delete. |

## 6.5 Rubric (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| POST | `/api/rubrics` | Create rubric for an assignment. |
| PATCH | `/api/rubrics/:id` | Update. |
| POST | `/api/rubrics/:id/rows` | Add row. |
| PATCH | `/api/rubric-rows/:id` | Update row. |
| DELETE | `/api/rubric-rows/:id` | Delete row. |

## 6.6 Learn (STAFF)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/learn/my` | Returns the current enrollment's courses, weeks, lessons with progress state. |
| POST | `/api/learn/lessons/:id/progress` | `{ scrollDepth, readAt? }`. Autofired by the lesson viewer. |

## 6.7 Submissions (STAFF)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/submissions/my` | List my submissions. |
| GET | `/api/submissions/:id` | Get a specific submission (own or mentee's). |
| POST | `/api/submissions` | `{ assignmentId }`. Creates a DRAFT version. |
| PATCH | `/api/submissions/:id/answer` | `{ questionId, value }`. Upsert one answer. |
| POST | `/api/submissions/:id/submit` | Lock and notify. |
| POST | `/api/submissions/:id/files` | Multipart upload for FILE_UPLOAD answers. |

## 6.8 Grading (MANAGER / ADMIN)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/queue` | Submissions pending my review. |
| POST | `/api/submissions/:id/scores` | `{ rubricRowId, level, comment? }`. Upsert. |
| POST | `/api/submissions/:id/grade` | `{ overallStatus, managerSummary }`. Sends notification. |
| POST | `/api/submissions/:id/reopen` | Set back to NEEDS_REWORK (from APPROVED). |

## 6.9 Feedback Snippets

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/snippets` | List my snippets. |
| POST | `/api/snippets` | Create. |
| PATCH | `/api/snippets/:id` | Update. |
| DELETE | `/api/snippets/:id` | Delete. |

## 6.10 Dashboards

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/dashboard/staff` | Staff dashboard payload. |
| GET | `/api/dashboard/manager` | Manager dashboard payload. |
| GET | `/api/dashboard/admin` | Admin dashboard payload (admin only). |

## 6.11 Analytics (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/analytics/cohort` | `?from=&to=&cohortId=` |
| GET | `/api/analytics/assignment/:id` | Average grade distribution. |
| GET | `/api/analytics/export.csv` | CSV download. |

## 6.12 Notifications

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/notifications` | Unread + recent. |
| POST | `/api/notifications/:id/read` | Mark read. |
| POST | `/api/notifications/read-all` | Mark all read. |

## 6.13 Audit Log (ADMIN)

| Method | Path | Purpose |
|---|---|---|
| GET | `/api/audit` | Query by actor, entity, date. Pagination. |
| GET | `/api/audit/:id` | Single entry with diff. |

## Shared rules

- **Rate limit**: 60 req/min/user on mutation endpoints; 300 req/min on reads.
- **Pagination**: every list endpoint supports `?page=1&pageSize=20` (max 100).
- **Errors**: RFC 7807 problem details: `{ type, title, status, detail, errors? }`.
- **Zod schemas live at** `lib/validators/*.ts` and are imported by both the client form and the server action/handler.
