# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CreatorOS: an AI multi-agent system for producing and publishing content (first brand is Urdu educational video). It runs locally; there are no deployment plans for now.
- **Source of truth:** `CreatorOS_Complete_Project_Blueprint_Updated.pdf` (v1.0 + Rev 1.1).
- **Overrides the PDF:** `docs/REVIEW_AND_RECOMMENDATIONS.md` holds the adopted amendments, roadmap and open owner decisions. Read it before changing architecture. Don't silently change architectural decisions; explain and propose instead.
- **$0 operator mode:** there is no runtime LLM API. Agents that need AI pause in the **AI queue**, and Claude Code answers them. Uploads pause as **human actions**, and Claude Code performs them in the owner's Chrome via the Chrome DevTools MCP while the owner watches.

## Operator duties (when the owner asks)

Project skills in `.claude/skills/` hold the playbooks. Load them; don't improvise:
- **"process the AI queue"** → `process-queue`, which routes by request kind to `trend-ideas`, `research`, `urdu-script`, `scene-visuals` or `youtube-metadata`.
- **"upload it"** → `youtube-upload`: owner's Chrome via chrome-devtools MCP, approved payload only. Stop on login, CAPTCHA or 2FA.
- **"what should we make next?"** → suggest starting an ideation round from the dashboard's Ideas page (or `POST /ideation`), then answer the queue with `trend-ideas`.

## Commands

pnpm workspace (pnpm 9). Run from the repo root. All apps read the root `.env`; the dashboard also needs `frontend/.env.local`.

```bash
pnpm install
pnpm db:generate | pnpm db:migrate     # prisma (migrate needs DATABASE_URL/DIRECT_URL)
pnpm worker | pnpm api | pnpm web      # agent runner | API on 127.0.0.1:4000 | dashboard on :3000
pnpm ai list|show|answer               # AI queue (operator mode)
pnpm action list|show|complete         # human/browser actions

pnpm test                                                     # core + agents suites (run in parallel)
pnpm --filter @creatoros/core test -t "emergency stop"         # single test by name
pnpm --filter @creatoros/agents test -t "YouTube"
cd backend/<pkg> && npx tsc --noEmit                           # core | agents | api | worker
cd frontend && npx tsc --noEmit && npx eslint src
cd media/renderer && npx tsc -p .
```

Tests hit the real database in isolated Postgres schemas (`creatoros_test` for core, `creatoros_test_agents` for agents). Each run applies migrations with `prisma migrate deploy` and truncates tables. Never use `db push --force-reset`: Prisma blocks AI agents from running it.

**Database:** Supabase Postgres, Mumbai. The direct host `db.<ref>.supabase.co` is IPv6-only and unreachable from this network, so use the **Session pooler** URL for both `DATABASE_URL` and `DIRECT_URL`.

## Architecture

```
frontend (Next.js 15, Supabase Auth) --server actions + x-api-key--> backend/api (NestJS 11)
backend/worker --Engine.runForever(ALL_AGENTS)--> backend/agents --> backend/core --Prisma 6--> Postgres
```

- **`backend/core`:** the engine and rules, with no agent logic.
  - `lock.ts`: the global execution lock is the single row `ExecutionLock(id='global')`, with a lease and a fencing `token`. Each operation is one atomic `UPDATE … WHERE`. Only ONE agent runs system-wide.
  - `engine.ts`: `tick()` runs these steps in order:
    1. Check the emergency stop.
    2. `recover()` orphaned runs.
    3. `promote()`: `PENDING` → `QUEUED` once dependencies are `COMPLETED`; `FAILED` → `QUEUED` once the backoff has elapsed.
    4. Acquire the lock and claim the task.
    5. Run the agent with an AbortSignal and a lease heartbeat.
    6. Fencing check, then commit.

    Agents can throw `DeferError` to pause without consuming an attempt: `askAi()` produces `WAITING_AI`, and `awaitHumanAction()` produces `WAITING_HUMAN`. Answering re-queues the task, and the agent re-runs and gets the result. Agents with `requiresApprovalAfter` end in `AWAITING_APPROVAL`, with an `Approval` whose `contentHash` is `hashJson(output)`.
  - `approvals.ts`: `decideApproval` either completes the task, or re-queues it with `input.feedback`, which yields a new AI request. `findValidApproval(taskId, output)` is the backend gate that publishing agents must call right before any external action.
  - `ai.ts` / `human.ts`: requests are keyed by `taskId + kind + inputHash`, so feedback creates a fresh request.
- **`backend/agents`:** all agent code, organised by department.
  - `strategy/`: the Trend agent and the Content Strategy (ideas) agent, plus the brand profile (`Brand.settings.profile`, default "Urdu science explainers", editable on `/brand`). `submitIdeation` runs trends → ideas and stores `Idea` rows as PROPOSED. Nothing is produced until the owner runs `selectIdea`, which turns the idea into a content project and carries its angle, audience and keywords into the research and script prompts. If `YOUTUBE_API_KEY` is set, trends also pull YouTube most-popular charts for the brand region.
  - `main/`: the Main Agent. `planInstruction` gives topic, duration, language and platforms (default `youtube`). `submitInstruction` creates a `ContentProject` (`content/<NNN-slug>/`, renderer key `pNNN`; 001 is the hand-made pilot), then the production steps, then each **active** platform's steps. Planned platforms are reported as `skipped`. `addPlatform` appends platform steps to an existing project.
  - `production/`: research → script (approval) → voice → storyboard → visuals → video → qa (final approval). One file per agent; `shared.ts` holds the helpers and constants.
  - `platforms/<id>/`: a `PlatformModule` that registers the platform's agents and steps (`PLATFORMS` in `platforms/index.ts`). YouTube is `active` with `youtube.package` (approval) and `youtube.publish`. The publish step checks a valid approval, checks that the video's sha256 is unchanged, and checks idempotency (`PlatformPost.idempotencyKey`) before handing off the upload; afterwards it verifies the video via oEmbed. Facebook, Instagram, TikTok and LinkedIn are `planned` stubs. To activate one, copy the youtube pattern.
- **`backend/database`:** the Prisma schema. Table names are PascalCase, so raw SQL must quote them (`"Task"`). `AuditLog` and `TaskRun` are append-only, and every state change calls `audit()`.
- **`backend/api`:** one file, `src/main.ts`. It runs under `tsx`, which emits no decorator metadata, so DI uses explicit `@Inject(TOKEN)` and validation uses zod. It binds to localhost and requires the `API_KEY` header. It streams content files with Range support.
- **`frontend`:** the `(app)` route group sits behind Supabase Auth (`middleware.ts`). Data goes through `lib/api.ts` (server-only) and `lib/actions.ts`. Media goes through the authenticated proxy `app/media/[id]/route.ts`. Supabase is used for auth only.
- **`media/renderer`:** a standalone Remotion 4 project (npm, **not** in the pnpm workspace).
  - The generic `Video` composition takes `--props=content/<slug>/storyboard/props.json`.
  - `Thumbnail` is 1280×720.
  - Per-video scenes live in `src/videos/<key>.tsx`, and the registry `src/videos/index.ts` is generated by the visuals agent.
  - `remotion.config.ts` forces the installed Google Chrome, because the bundled headless shell hangs on this Mac.
  - `scripts/stills.mjs` renders preview stills.
  - A full render takes about 4 minutes for 2 minutes of video.
- **Voice:** `edge-tts` lives in the root `.venv` (`ur-PK-AsadNeural`, `--rate=+8%`). It intermittently returns no audio; the voice agent retries with `--text`.

## Non-negotiables to respect in code

- No publishing, spending, public replies or account changes without a recorded human approval. Approvals are tied to exact content (hash) and destination, and are re-checked server-side right before the external action.
- Publishing route per platform: the owner's Chrome via DevTools for now (owner-supervised, low volume), and official APIs later via a swappable `route`. Never bypass CAPTCHA, MFA, verification or platform limits.
- Never publish the same video twice to a platform (idempotency key). Check the platform before retrying an ambiguous upload.
- Every brand-scoped row carries `brandId`. Analytics are historical snapshots and are never overwritten. "Unavailable" is distinct from zero.
- Introduce no paid service without owner approval.
