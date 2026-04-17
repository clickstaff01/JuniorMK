# 05 — Data Model (Prisma)

Put this in `prisma/schema.prisma`. Run `pnpm prisma migrate dev` after edits.

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  // Local dev
  provider = "sqlite"
  url      = env("DATABASE_URL")
  // Prod will swap to "postgresql" in an env-driven override file
}

// ---------- Users & Roles ----------

enum Role {
  STAFF
  MANAGER
  ADMIN
}

enum UserStatus {
  INVITED
  ACTIVE
  DEACTIVATED
}

model User {
  id              String       @id @default(cuid())
  email           String       @unique
  nameTh          String
  nameEn          String?
  passwordHash    String?      // null while INVITED
  role            Role         @default(STAFF)
  status          UserStatus   @default(INVITED)
  preferredLocale String       @default("th")
  mentorId        String?      // Staff -> their Manager
  mentor          User?        @relation("Mentorship", fields: [mentorId], references: [id])
  mentees         User[]       @relation("Mentorship")
  createdAt       DateTime     @default(now())
  updatedAt       DateTime     @updatedAt

  invitations      Invitation[]
  sessions         Session[]
  accounts         Account[]
  submissions      Submission[]     @relation("AuthorSubmissions")
  grades           Submission[]     @relation("GraderSubmissions")
  auditEntries     AuditLog[]
  lessonProgress   LessonProgress[]
  enrollments      Enrollment[]
  notifications    Notification[]
  feedbackSnippets FeedbackSnippet[]
}

model Invitation {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  token     String   @unique
  expiresAt DateTime
  usedAt    DateTime?
  createdAt DateTime @default(now())
}

// NextAuth tables (keep defaults)
model Account { /* standard NextAuth schema */ }
model Session { /* standard NextAuth schema */ }
model VerificationToken { /* standard NextAuth schema */ }

// ---------- Content ----------

model Course {
  id          String   @id @default(cuid())
  slug        String   @unique
  titleTh     String
  titleEn     String?
  descriptionTh String?
  descriptionEn String?
  isPublished Boolean  @default(false)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  weeks       Week[]
  enrollments Enrollment[]
}

model Week {
  id            String  @id @default(cuid())
  courseId      String
  course        Course  @relation(fields: [courseId], references: [id], onDelete: Cascade)
  order         Int
  titleTh       String
  titleEn       String?
  descriptionTh String?
  descriptionEn String?

  lessons       Lesson[]
  assignments   Assignment[]

  @@unique([courseId, order])
}

model Lesson {
  id         String  @id @default(cuid())
  weekId     String
  week       Week    @relation(fields: [weekId], references: [id], onDelete: Cascade)
  order      Int
  slug       String
  titleTh    String
  titleEn    String?
  bodyTh     String  // Markdown
  bodyEn     String? // Markdown
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt

  progress   LessonProgress[]

  @@unique([weekId, order])
  @@unique([weekId, slug])
}

model LessonProgress {
  id         String   @id @default(cuid())
  userId     String
  user       User     @relation(fields: [userId], references: [id])
  lessonId   String
  lesson     Lesson   @relation(fields: [lessonId], references: [id])
  readAt     DateTime?
  scrollDepth Float   @default(0)
  updatedAt  DateTime @updatedAt

  @@unique([userId, lessonId])
}

model Enrollment {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  courseId  String
  course    Course   @relation(fields: [courseId], references: [id])
  startedAt DateTime @default(now())
  completedAt DateTime?

  @@unique([userId, courseId])
}

// ---------- Assignments ----------

enum QuestionType {
  SHORT_TEXT
  LONG_TEXT
  MULTIPLE_CHOICE
  CHECKBOXES
  TABLE
  FILE_UPLOAD
  URL
}

model Assignment {
  id             String   @id @default(cuid())
  weekId         String
  week           Week     @relation(fields: [weekId], references: [id], onDelete: Cascade)
  code           String   // e.g., "A1", "A2"
  titleTh        String
  titleEn        String?
  descriptionTh  String?
  descriptionEn  String?
  dueOffsetDays  Int      // days from enrollment start to due date
  order          Int
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  questions      Question[]
  submissions    Submission[]
  rubric         Rubric?

  @@unique([weekId, code])
}

model Question {
  id             String   @id @default(cuid())
  assignmentId   String
  assignment     Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  order          Int
  type           QuestionType
  promptTh       String
  promptEn       String?
  required       Boolean  @default(true)
  /// Type-specific config (JSON): options for MC/CK, schema for TABLE, accept for FILE_UPLOAD
  config         Json?

  answers        Answer[]
}

model Submission {
  id             String   @id @default(cuid())
  assignmentId   String
  assignment     Assignment @relation(fields: [assignmentId], references: [id])
  authorId       String
  author         User     @relation("AuthorSubmissions", fields: [authorId], references: [id])
  version        Int      @default(1)
  status         SubmissionStatus @default(DRAFT)
  submittedAt    DateTime?
  graderId       String?
  grader         User?    @relation("GraderSubmissions", fields: [graderId], references: [id])
  gradedAt       DateTime?
  overallStatus  OverallStatus?
  managerSummary String?
  createdAt      DateTime @default(now())
  updatedAt      DateTime @updatedAt

  answers        Answer[]
  rubricScores   RubricScore[]

  @@unique([assignmentId, authorId, version])
}

enum SubmissionStatus {
  DRAFT
  SUBMITTED
  GRADED
  NEEDS_REWORK
  APPROVED
}

enum OverallStatus {
  APPROVED
  NEEDS_REWORK
}

model Answer {
  id           String   @id @default(cuid())
  submissionId String
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  questionId   String
  question     Question @relation(fields: [questionId], references: [id])
  /// Typed payload (JSON): { text } | { choice } | { choices } | { rows } | { fileIds } | { url }
  value        Json
  updatedAt    DateTime @updatedAt

  files        FileUpload[]
  @@unique([submissionId, questionId])
}

model FileUpload {
  id         String   @id @default(cuid())
  answerId   String?
  answer     Answer?  @relation(fields: [answerId], references: [id])
  key        String   // storage key
  url        String
  filename   String
  mimeType   String
  sizeBytes  Int
  uploadedBy String
  createdAt  DateTime @default(now())
}

// ---------- Rubric ----------

model Rubric {
  id           String   @id @default(cuid())
  assignmentId String   @unique
  assignment   Assignment @relation(fields: [assignmentId], references: [id], onDelete: Cascade)
  rows         RubricRow[]
  updatedAt    DateTime @updatedAt
}

model RubricRow {
  id         String  @id @default(cuid())
  rubricId   String
  rubric     Rubric  @relation(fields: [rubricId], references: [id], onDelete: Cascade)
  order      Int
  labelTh    String
  labelEn    String?
  greatTh    String
  greatEn    String?
  okTh       String?
  okEn       String?
  reworkTh   String
  reworkEn   String?
  weight     Int     @default(1)

  scores     RubricScore[]
}

enum RubricLevel {
  GREAT
  OK
  REWORK
}

model RubricScore {
  id           String   @id @default(cuid())
  submissionId String
  submission   Submission @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  rubricRowId  String
  rubricRow    RubricRow @relation(fields: [rubricRowId], references: [id])
  level        RubricLevel
  comment      String?

  @@unique([submissionId, rubricRowId])
}

// ---------- Notifications / Feedback ----------

model FeedbackSnippet {
  id         String  @id @default(cuid())
  ownerId    String
  owner      User    @relation(fields: [ownerId], references: [id])
  label      String
  bodyTh     String
  bodyEn     String?
  usageCount Int     @default(0)
  createdAt  DateTime @default(now())
}

enum NotificationType {
  INVITE
  PASSWORD_RESET
  GRADED
  NEEDS_REWORK
  DUE_SOON
  NEW_SUBMISSION
}

model Notification {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id])
  type      NotificationType
  titleTh   String
  titleEn   String?
  bodyTh    String
  bodyEn    String?
  link      String
  readAt    DateTime?
  createdAt DateTime @default(now())
}

// ---------- Audit Log ----------

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  LOGIN
  LOGOUT
  ROLE_CHANGE
  PASSWORD_RESET
  INVITE_SENT
  SUBMIT
  GRADE
}

model AuditLog {
  id         String   @id @default(cuid())
  actorId    String?
  actor      User?    @relation(fields: [actorId], references: [id])
  action     AuditAction
  entity     String   // e.g., "User", "Assignment", "Submission"
  entityId   String
  /// Before/after diff as JSON
  before     Json?
  after      Json?
  ip         String?
  userAgent  String?
  createdAt  DateTime @default(now())

  @@index([entity, entityId])
  @@index([actorId, createdAt])
}
```

## Key invariants (enforce in code)

- A Staff can only read their own Submissions.
- A Manager can only read Submissions of their mentees.
- An Admin can read everything.
- A submission version number auto-increments when a manager sends `NEEDS_REWORK` and the staff resubmits.
- The audit log is append-only; no UI or API must expose a delete route.

## Seeding strategy

- `prisma/seed.ts` reads three JSON files: `seed/content.json`, `seed/assignments.json`, `seed/rubrics.json`.
- Run `pnpm db:seed` to populate a fresh database.
- Content seed is produced from `10-content-seed.md`, assignments from `11-assignments-seed.md`, rubrics from `12-rubric-seed.md` (Claude Code converts them to JSON as part of Phase 1).
