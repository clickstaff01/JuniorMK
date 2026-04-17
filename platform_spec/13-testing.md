# 13 — Testing Strategy

## 13.1 Test pyramid

| Layer | Tool | Scope | % of total tests |
|---|---|---|---|
| Unit | Vitest | pure logic: validators, permissions, formatters, rubric calc | ~60% |
| Integration | Vitest + Prisma test DB | server actions, DB queries, email mocks | ~30% |
| E2E | Playwright | 6 golden flows | ~10% |

## 13.2 Minimum coverage (MVP)

- `lib/auth/guards.ts`: 100% (security-critical).
- `lib/validators/*.ts`: 100%.
- Every server action under `app/.../actions.ts`: happy path + 1 unauthorized path + 1 input-invalid path.
- Rubric scoring helper: all branches.

## 13.3 Six golden e2e flows (Playwright)

1. **Sign in as staff → read Week 1 Lesson 1 → auto-mark read.**
2. **Submit A1 with 20 text answers → see it as "Submitted" on dashboard.**
3. **Sign in as manager → see A1 in queue → grade with rubric → approve → staff receives notification.**
4. **Manager sends rework → staff edits answer → resubmits (version=2) → manager approves.**
5. **Admin invites 3 users via CSV → all 3 get emails → each can set password.**
6. **Staff switches language from Thai to English → lesson body switches if English exists; banner shows otherwise.**

## 13.4 Test database

- Unit: pure functions — no DB needed. Or use an in-memory pglite adapter for lightweight isolated runs.
- Integration + E2E: disposable Postgres via Docker Compose service `postgres-test`; re-seeded in `global-setup.ts`. Tests run against `postgresql://postgres:postgres@localhost:5433/test` (different port from dev DB).

## 13.5 Auth test helper

```ts
// tests/helpers/login.ts
export async function loginAs(page, role: 'STAFF' | 'MANAGER' | 'ADMIN') {
  await page.goto('/auth/sign-in');
  await page.fill('input[name=email]', `${role.toLowerCase()}@test.local`);
  await page.fill('input[name=password]', 'Password1!');
  await page.click('button[type=submit]');
  await page.waitForURL(/dashboard/);
}
```

## 13.6 CI

- On every PR: `pnpm lint && pnpm typecheck && pnpm test && pnpm e2e`.
- Fail the PR if coverage < 80% on new lines.
- Railway auto-deploys merges to the `staging` branch → staging URL. On Railway Pro, each PR gets its own preview environment automatically.

## 13.7 Manual test checklist (owner sign-off per phase)

At the end of each phase, the owner manually clicks through:
- Every newly mentioned page in the phase's build plan.
- Language toggle.
- A negative-path scenario (e.g., submit with required field blank → see inline error).
- Log out and log back in → state preserved correctly.
