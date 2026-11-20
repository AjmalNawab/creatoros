# CreatorOS

AI multi-agent system for creating, approving and publishing content, with a human approving every external action.

## Repository layout

```
CreatorOS/
├── frontend/              Dashboard (Next.js + Supabase login)          → http://localhost:3000
│
├── backend/
│   ├── agents/            ALL AGENTS
│   │   └── src/
│   │       ├── main/          Main Agent (orchestrator): turns an instruction into tasks
│   │       ├── production/    Makes the video once: research, script, voice, storyboard, visuals, video, qa
│   │       └── platforms/     One folder per platform, each with its own agents
│   │           ├── youtube/   ✅ active: package (title, description, tags, thumbnail) → publish
│   │           ├── facebook/  planned
│   │           ├── instagram/ planned
│   │           ├── tiktok/    planned
│   │           └── linkedin/  planned
│   ├── core/              Engine: global lock, task queue, approvals, AI queue, human actions
│   ├── api/               REST API (NestJS) the dashboard talks to      → http://127.0.0.1:4000
│   ├── worker/            Background process that runs agents, one at a time
│   └── database/          Database schema (Prisma → Supabase Postgres)
│
├── media/
│   ├── renderer/          Video renderer (Remotion): animated scenes → MP4
│   └── tools/             Python helpers (storyboard builder)
│
├── content/               Generated content, one folder per video (script, audio, output…)
│   └── 001-volcanoes/
│
├── docs/                  Decisions & specs (REVIEW_AND_RECOMMENDATIONS.md overrides the PDF)
└── CreatorOS_Complete_Project_Blueprint_Updated.pdf
```

## How the pieces talk

```
 You (browser)
     │
 frontend/  ──HTTP──▶  backend/api  ──┐
                                      ├──▶ backend/core ──▶ backend/database ──▶ Supabase Postgres
                      backend/worker ─┘         (engine, lock, orchestrator)
                           │
                           └── runs agents → later calls media/renderer to make videos → content/
```

- **Frontend** shows the dashboard and sends your actions (instructions, approvals, emergency stop) to the API.
- **API** reads and writes the database. It never runs agents itself.
- **Worker** is the only process that runs agents, one at a time under the global lock.
- **Core** is shared by the API and worker, so the business rules live in one place.

## How a video gets to YouTube

```
"Make a 1 minute video about X for YouTube"
  → Main Agent → production agents → ✋ you approve script → … → ✋ you approve final video
  → YouTube agent: package (title, description, tags, thumbnail) → ✋ you approve the exact package
  → YouTube agent: publish → waits in "Browser actions"
  → Claude Code uploads it in YOUR Chrome via DevTools while you watch (or you upload and paste the link)
  → link verified and saved; the same video can never be published twice
```

AI thinking (research, script, visuals, metadata) is answered by Claude Code: say **"process the AI queue"**.
Uploads: say **"upload it"**. Both are $0 and need you at the computer.

## Run it

```bash
pnpm install
pnpm db:migrate     # create tables (needs DATABASE_URL in .env)
pnpm worker         # terminal 1
pnpm api            # terminal 2
pnpm web            # terminal 3 → open http://localhost:3000
pnpm test           # engine + workflow acceptance tests
pnpm ai list        # AI requests waiting for Claude Code
pnpm action list    # browser/human actions waiting (e.g. YouTube upload)
```

Config: secrets live in the root `.env` (copy from `.env.example`), plus `frontend/.env.local` for the dashboard. Never commit either.
