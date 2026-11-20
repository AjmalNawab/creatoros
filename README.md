# CreatorOS

AI multi-agent system for creating, approving and publishing content, with a human approving every external action.

## Repository layout

```
CreatorOS/
├── frontend/              Dashboard (Next.js + Supabase login)          → http://localhost:3000
│
├── backend/
│   ├── api/               REST API (NestJS) the dashboard talks to      → http://127.0.0.1:4000
│   ├── worker/            Background process that runs agents, one at a time
│   ├── core/              The brain: execution engine, global lock, orchestrator, agents
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

## Run it

```bash
pnpm install
pnpm db:migrate     # create tables (needs DATABASE_URL in .env)
pnpm worker         # terminal 1
pnpm api            # terminal 2
pnpm web            # terminal 3 → open http://localhost:3000
pnpm test           # engine acceptance tests
```

Config: secrets live in the root `.env` (copy from `.env.example`), plus `frontend/.env.local` for the dashboard. Never commit either.
