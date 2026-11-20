# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

CreatorOS: an AI multi-agent system for producing and publishing content (first brand is Urdu educational video).
- **Source of truth:** `CreatorOS_Complete_Project_Blueprint_Updated.pdf` (v1.0 + Rev 1.1).
- **Overrides the PDF:** `docs/REVIEW_AND_RECOMMENDATIONS.md` holds the adopted amendments, revised roadmap and open owner decisions. Read it before changing architecture. Don't silently change architectural decisions; explain and propose instead.
- **Current state:** Phase 1 (foundation). Agents are placeholders (`backend/core/src/agents/dummy.ts`), to be replaced with real ones in Phase 3. There is no runtime LLM API yet: the owner chose $0, and AI work is done interactively through Claude Code.

## Commands

pnpm workspace (pnpm 9). Run from the repo root. All apps read the root `.env`; the dashboard also needs `frontend/.env.local`.

```bash
pnpm install
pnpm db:generate                       # prisma generate
pnpm db:migrate                        # prisma migrate dev (needs DATABASE_URL/DIRECT_URL in .env)
pnpm worker                            # agent execution loop
pnpm api                               # NestJS API on 127.0.0.1:4000 (tsx watch)
pnpm web                               # Next.js dashboard on :3000

pnpm test                                                  # all packages
pnpm --filter @creatoros/core test -t "emergency stop"      # single test by name
pnpm --filter @creatoros/core typecheck
cd backend/api && npx tsc --noEmit
cd frontend && npx tsc --noEmit && npx next build && pnpm lint
```

Core tests hit the real database but in an isolated Postgres schema, `creatoros_test`. Each run applies migrations to that schema with `prisma migrate deploy`, and each test truncates its tables.

**Database:** Supabase Postgres. The direct host `db.<ref>.supabase.co` is IPv6-only and unreachable from this network, so use the **Session pooler** URL for both `DATABASE_URL` and `DIRECT_URL`.

## Architecture

```
frontend (Next.js 15, Supabase Auth) --server actions + x-api-key--> backend/api (NestJS 11)
                                                                         |
backend/worker --Engine.runForever()--> backend/core --Prisma 6--> backend/database --> Postgres
```

- **`backend/core` holds all business logic.** The API and worker are thin shells around it.
  - `lock.ts`: the global execution lock is the single row `ExecutionLock(id='global')`. It has a lease (`leaseUntil`) and a fencing `token`. Acquire, renew and release are each a single atomic `UPDATE … WHERE`, so they are safe across processes and the pooler. Blueprint rule: only ONE agent runs system-wide, and the lock lives in the DB, not in prompts.
  - `engine.ts`: `tick()` does the following in order:
    1. Check the emergency stop.
    2. `recover()`: find `RUNNING` TaskRuns whose lease is gone, abort them, and retry or dead-letter.
    3. `promote()`: move `PENDING` → `QUEUED` once dependencies are `COMPLETED`, and `FAILED` → `QUEUED` once the backoff has elapsed.
    4. Pick the next task, acquire the lock, and claim the task with a conditional update.
    5. Run the agent with an AbortSignal, plus a heartbeat that renews the lease and watches the stop flag.
    6. Re-verify the lock (fencing) before committing.

    Agents with `requiresApprovalAfter` end in `AWAITING_APPROVAL` and create an `Approval` that carries a `contentHash`.
  - `orchestrator.ts`: the orchestrator **never free-plans**. `planInstruction` maps text to a code-defined `TEMPLATES` entry plus parameters (rule-based now, an LLM later). `submitInstruction` creates a root task plus step tasks with a `TaskDependency` graph. `decideApproval` completes the task on approval, or re-queues it with the feedback otherwise.
  - Agents implement `AgentDefinition` (`types.ts`). `Engine.register()` upserts their metadata into the `Agent` table. The handler code lives in the worker process, not the DB.
- **`backend/database`:** Prisma schema. Tables use Prisma's default PascalCase names, so raw SQL must quote them (`"Task"`, `"ExecutionLock"`, `"leaseUntil"`). The audit log (`AuditLog`) and run history (`TaskRun`) are append-only. Every state change should call `audit()`.
- **`backend/api`:** one file, `src/main.ts`. It runs under `tsx`, which emits **no decorator metadata**, so Nest DI must use explicit `@Inject(TOKEN)`, and request bodies are validated with zod rather than class-validator. It binds to localhost and is guarded by the `API_KEY` header (except `/health`).
- **`frontend`:** the `(app)` route group is the authenticated dashboard. `middleware.ts` refreshes the Supabase session and redirects to `/login`. Server components fetch through `lib/api.ts` (server-only; adds `x-api-key`), mutations go through `lib/actions.ts`, and `AutoRefresh` re-fetches every 3s. Supabase is used for **auth only**; app data always goes through the API.

## Content pipeline (manual, outside the workspace)

The proven $0 pipeline that Phase 3 agents will automate:
- `content/<id>/`: per-content folders (`research/`, `script/`, `storyboard/`, `audio/`, `output/`, `approvals.json`).
- **Voice:** `edge-tts` in the root Python venv `.venv` (`ur-PK-AsadNeural`, `--rate=+8%`). The service intermittently returns `NoAudioReceived` or empty files, so retry, and pass `--text` instead of `-f` when it fails.
- `media/tools/build_storyboard.py <project> <key>`: reads the scene mp3s and srts, computes durations from 48 kbps CBR byte size, writes `storyboard.json` and `media/renderer/src/data/<key>.json`, and copies the audio to `media/renderer/public/<key>/`.
- `media/renderer/`: a standalone Remotion 4 project (npm, **not** part of the pnpm workspace). Scenes are hand-coded SVG/React in `src/scenes.tsx`. The Urdu font is `public/fonts/NotoNastaliqUrdu.ttf`, and browser rendering handles Nastaliq shaping. Commands:
  - Still: `npx remotion still src/index.ts Volcanoes001 out.jpg --frame=N --scale=0.5`
  - Full render: `npx remotion render src/index.ts Volcanoes001 <out>.mp4 --codec=h264 --crf=20` (about 4.5 min for 2 min of video on this Intel Mac)

## Non-negotiables to respect in code

These come from the blueprint and its amendments:
- No publishing, spending, public replies or account changes without a recorded human approval. Approvals are tied to exact content (hash) and destination.
- Publishing goes through official APIs first, with a human-action fallback. Browser automation is deferred, and the system must never bypass CAPTCHA, MFA or platform limits.
- Every brand-scoped row carries `brandId`. Analytics are stored as historical snapshots and never overwritten. "Unavailable" is distinct from zero.
- Retry a publish with an ambiguous outcome only after checking the platform for an existing post (idempotency key).
- Introduce no paid service without owner approval.
