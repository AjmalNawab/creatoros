# CreatorOS — Blueprint Review & Adopted Recommendations

Status: **Adopted** (2026-11-20). These amend `CreatorOS_Complete_Project_Blueprint_Updated.pdf` (v1.0 + Rev 1.1).
Where this file conflicts with the blueprint, this file wins unless a later decision says otherwise.

## Core strategy
Keep the full architecture (multi-brand `brand_id` everywhere, approval, lock, audit) but build **one vertical slice first**:
topic → finished Urdu video → approved → published on YouTube → analytics. Widen only after that works.

## Adopted recommendations
1. **Most "agents" are steps, not agentic loops.** All share one agent interface (registry, runs, costs, dashboard), but only
   Orchestrator, Research and Script use multi-step reasoning. SEO = one structured LLM call; QA = ffprobe/loudness checks + one
   LLM review; Copyright = a DB rule blocking any asset without a licence record.
2. **Orchestrator fills workflow templates** (code-defined, e.g. `long_form_video`, `shorts_from_video`) rather than free-form planning.
3. **Global lock scope** — keep the single lock for LLM agents + publishing. *Open decision:* allow non-AI maintenance jobs
   (analytics polling, token refresh) in a separate lane so long renders don't block them.
4. **Urdu de-risking spike first:** TTS via Azure Speech free tier (`ur-PK-AsadNeural` / `ur-PK-UzmaNeural`) instead of
   unofficial Edge TTS; subtitles via forced alignment against the known script (not Whisper transcription); test Nastaliq
   (Noto Nastaliq Urdu) rendering in libass subtitles and Sharp thumbnails.
5. **Platform access lead times — start day 1:** YouTube API audit (unverified projects upload as private-only; default quota
   ≈10k units/day ≈ 6 uploads). Add **YouTube Analytics API** (watch time, retention) — not in original blueprint.
   Meta in dev mode works for own Page/IG without review. TikTok private-only until audit. LinkedIn org posting needs
   Community Management API approval.
6. **Defer browser automation (possibly forever).** Human Action Handler fallback = system prepares package + opens upload page,
   human posts, pastes URL, system verifies and reconciles.
7. **Local-first caveat:** scheduler must catch up missed jobs after Mac sleep; plan media storage growth and backups.
8. **Monetisation:** YouTube "inauthentic content" policy + synthetic-content disclosure → originality becomes a QA check.
9. **Fill gaps:** define the brand; script fact-checking with citations to research; prompt versioning; per-LLM-call cost logging.

## Stack additions
- pnpm monorepo: `frontend/` (Next.js dashboard), `backend/api` (NestJS), `backend/worker` (agent runner), `backend/core` (engine), `backend/database` (Prisma). Media in `media/`, generated content in `content/`.
- Queue: pg-boss or graphile-worker + lease-based lock table (don't hand-roll the queue).
- Runtime AI: Anthropic API behind provider abstraction; Haiku for cheap steps, Sonnet for scripts; prompt caching. ~$5–20/mo.
- Start with ~20 core tables; add the rest per phase.

## Revised roadmap
| Phase | Deliverable | Est. |
|---|---|---|
| 0. Spikes + applications | Urdu TTS/subtitles/Nastaliq, Mac image-gen speed, FFmpeg Ken Burns; YouTube API + audit, Meta dev app; brand definition | 3–4 days |
| 1. Foundation | Monorepo, Postgres, core schema, queue + lock + lease + emergency stop, audit log, LLM layer with cost tracking, minimal dashboard | 1–1.5 wks |
| 2. Production slice | Research → Script → (approval) → Storyboard → Visuals → Voice → Assembly → QA → volcano MP4 on disk | 2–3 wks |
| 3. Approval Centre | Hash-based version approvals, previews, revision loop, backend enforcement | 1 wk |
| 4. YouTube end to end | OAuth, publishing job, idempotency, reconcile, Analytics API snapshots | 1–1.5 wks |
| 5. Repurpose + Meta | Shorts cutting, adaptations, FB/IG publishing, Human Action Handler for TikTok/LinkedIn | 1.5–2 wks |
| 6. Growth | Optimisation, experiments, monetisation tracking, trends | 1.5 wks |
| Later | Multi-brand UI, TikTok/LinkedIn APIs, cloud deploy, browser automation only if justified | — |

Realistic total to the full volcano experiment: **~10–13 weeks**.

## Open decisions (owner)
1. Mac chip/RAM (local image generation feasibility).
2. Runtime AI API budget (~$10–20/mo).
3. Lock scope for non-AI maintenance jobs.
4. Voice provider: Azure free tier (recommended) vs Edge TTS.
5. Brand name and niche.

## Decision 2026-11-20: Start with $0, no API ("Mode 0")
- Claude Code (interactive, owner present) acts as the AI operator: research, Urdu script, storyboard, visuals as code.
- No runtime API yet. Every step writes files in `content/<id>/` so the later automated platform can reuse the same formats.
- Visuals: Claude-authored SVG/HTML motion graphics (Intel i7 / 16GB Mac: local Stable Diffusion is impractical).
  Rendering through a browser also handles Nastaliq text correctly.
- Voice: edge-tts (`ur-PK-AsadNeural` / `ur-PK-UzmaNeural`). It is free and needs no key, and it outputs sentence subtitles.
- Assembly: FFmpeg. Upload: manual (owner) to YouTube.
- The API is needed only later, for unattended or scheduled runs.

## Dev tooling
- Chrome DevTools MCP (`chrome-devtools-mcp --autoConnect`) configured at user scope for UI testing and later
  browser-assisted workflows against the owner's running Chrome.
