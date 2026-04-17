# 03 — User Flows

Each flow lists the exact pages and states. Use as a test checklist.

## Flow A — New staff first login

1. Admin invites `nong@clickbroker.co.th` with role `STAFF`, mentor = senior manager.
2. Nong receives email "Welcome to Click Broker Learning — set your password". Link valid 7 days.
3. Nong clicks link → `/auth/set-password` → sets a password with strength meter.
4. Redirect to `/dashboard`.
5. Dashboard shows: welcome card with her name, "Start Week 1" button, sidebar showing Weeks 1–4 with Week 1 highlighted.
6. Click "Start Week 1" → `/learn/week/1` → first lesson is open.

## Flow B — Staff reads a lesson

1. From `/dashboard` or sidebar, click any unlocked lesson.
2. Markdown renders with images, tables, callouts.
3. After 30 seconds + scroll depth ≥ 80%, the lesson is auto-marked as read.
4. Next / previous buttons at bottom. Sidebar shows read state (check mark).

## Flow C — Staff completes and submits an assignment

1. From the week page, click an assignment card.
2. `/assignments/[id]` opens a form. Each question renders the correct input (short text / rich text / table / upload).
3. Autosave every 15 seconds. Draft indicator shows "Saved 2s ago".
4. Staff can upload one or more files per FILE_UPLOAD question.
5. Click "Submit" → confirm dialog ("Once submitted, you cannot edit unless a manager requests rework") → server locks submission, creates notification for mentor.
6. Staff returns to dashboard; assignment card shows "Submitted – waiting for review".

## Flow D — Manager grades a submission

1. Manager sees a yellow notification bell: "1 new submission to grade".
2. Click → `/manage/queue`, list of pending submissions ordered by oldest first.
3. Click row → `/manage/submission/[id]` — left pane = questions + answers, right pane = rubric.
4. For each rubric row, choose Great / OK / Needs Rework and optionally add a comment.
5. Overall status dropdown: `APPROVED` or `NEEDS_REWORK`.
6. Click "Send feedback" → staff receives email + in-app notification.

## Flow E — Staff sees feedback and reworks

1. Staff gets email "Your Week 1 A1 was graded". Click → `/assignments/[id]`.
2. If APPROVED, assignment card on dashboard turns green and Week 1 completion advances.
3. If NEEDS_REWORK, form is editable again with previous answers prefilled and manager comments shown beside each question.
4. Staff edits and resubmits. New version is stored.

## Flow F — Admin adds a new course

1. Go to `/admin/courses` → "New Course".
2. Fill in name (Thai + English tab), description, category.
3. Add Weeks: each Week has a title and description.
4. Add Lessons to each Week: Markdown editor with live preview, image upload.
5. Add Assignments to each Week: create questions one by one using the question builder.
6. Click "Publish" to make course available to staff.

## Flow G — Admin onboards 3 new hires at once

1. Go to `/admin/users/invite` → "Bulk invite" tab.
2. Upload CSV with columns: email, name_th, name_en, role, mentor_email, course_to_enroll.
3. Preview validates each row (red = error, green = OK).
4. Click "Send invitations" → all valid rows get the welcome email.
5. Each new user appears in `/admin/users` with status "Invited".

## Flow H — MD weekly check

1. MD logs in, lands on `/admin/dashboard`.
2. Sees a single screen with: active cohorts, % complete for each staff, anyone flagged as behind (> 3 days overdue), average grade per assignment.
3. Click any staff row → drill into their profile / submissions.

## Flow I — Language toggle

1. Any page, top-right language toggle → click EN or TH.
2. UI chrome switches instantly (URL may carry locale prefix `/en` or `/th`).
3. If lesson content exists in the selected language, show it; otherwise show the other language with a "Translation not available yet" banner.

## Flow J — Audit log review

1. Admin visits `/admin/audit`.
2. Filter by actor (user), entity (user/course/submission/grade), date range.
3. Each entry has a "View details" that shows the diff (before / after JSON).
