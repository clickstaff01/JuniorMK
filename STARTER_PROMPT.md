# Starter prompt for Claude Code

Copy and paste this into Claude Code after you open a new, empty repository that contains the `platform_spec/` folder.

---

```
You are helping me build the Click Broker internal learning platform.

The full spec lives in the `platform_spec/` folder in this repo.

Start by reading `platform_spec/CLAUDE.md` — it has the rules for how we work together — then read every other .md file in that folder, in numerical order (01 → 15). Do not start writing code until you have read all of them.

Deployment target is Railway, with Railway's managed Postgres. The spec has been updated to reflect this — see `platform_spec/14-deployment.md`.

I am not a developer. Follow these rules:
1. Work phase by phase from `platform_spec/15-build-phases.md`. Do not skip phases.
2. At the start of every session, tell me in plain English what you plan to do.
3. Ask me a question before inventing a default when the spec is silent.
4. Write tests as you go. No test, no merge.
5. At the end of every phase, write a short summary of what works and what I should click to verify it.

Begin with Phase 0. First action: confirm you have read every spec file and then produce the initial file tree + package.json for Phase 0. Wait for my "go" before writing any code.
```

---

## Optional follow-up prompts you can use later

### After Phase 0 ships

```
Phase 0 is approved. Start Phase 1.
Before you write code, remind me which questions you need me to answer
(e.g., the admin email address, the Resend API key).
```

### When Claude Code gets stuck

```
Stop. Summarize in plain English:
1. What you were trying to do
2. What is blocking you
3. The 2 or 3 options you considered
4. Your recommendation

Do not write code until I pick an option.
```

### Before every deployment

```
Before we deploy to staging, go through the checklist in
platform_spec/13-testing.md section 13.7 and confirm each item.
If anything is missing, list it. Do not deploy if anything is red.
```

### When you want to change something mid-phase

```
I want to change [X]. Before touching code:
1. Find where in platform_spec/ this is specified.
2. Propose the spec change (1 paragraph).
3. List any other files or features that also need to change.
4. Wait for my approval. Only then update the spec and code.
```

## One-time tasks only you (the owner) can do

Claude Code will remind you, but bookmark this short list:

1. **Railway account** — sign in at railway.app with GitHub. Create two projects: `click-broker-learning-staging` and `click-broker-learning-prod`. In each, add a PostgreSQL service. See `platform_spec/14-deployment.md` section 14.2 for the exact click path.
2. **Environment variables** — paste the values into Railway dashboards. The list is in `platform_spec/14-deployment.md` section 14.4.
3. **Resend** — sign up at resend.com, verify the `clickbroker.co.th` domain, copy the API key.
4. **UploadThing** — sign up at uploadthing.com, create an app, copy the two keys.
5. **DNS** — add a CNAME for `learn.clickbroker.co.th` pointing at the Railway-supplied target.
6. **Sentry + PostHog** (optional for MVP) — sign up, copy the DSN / key.

Give these keys to Claude Code when it asks, or paste them directly into the Railway dashboard.
