---
name: process-queue
description: Answer CreatorOS AI-queue requests as the operator. Use when the owner says "process the AI queue", "answer the queue", "continue the video", or when tasks are WAITING_AI. Routes each request to the right playbook skill.
---

# Process the AI queue (operator mode)

CreatorOS agents pause in `WAITING_AI` until Claude Code answers. You are the AI brain. Quality matters: every answer becomes real content.

## Loop
1. `pnpm ai list`: pending requests (oldest first). Process them **in order**; later steps depend on earlier ones.
2. For each: `pnpm ai show <id>`. Read the whole prompt, including any `YOUR PREVIOUS ANSWER WAS REJECTED` section, and fix exactly that.
3. Load the playbook for its `kind`, then write the answer to a file in the scratchpad (`<kind>-<id>.json` or `.tsx`):

   | kind | playbook skill |
   |---|---|
   | `trends`, `ideas` | `trend-ideas` |
   | `research` | `research` |
   | `script` | `urdu-script` |
   | `visuals` | `scene-visuals` |
   | `youtube_metadata` | `youtube-metadata` |

4. `pnpm ai answer <id> <file>`. Validation happens when the agent re-runs (within about 2 s). Wait about 10 s, then run `pnpm ai list` again. A rejected answer comes back as a new request with the error. Fix it; don't argue with the validator.
5. Stop when the queue is empty, or when the next step needs the **owner** (approval). Tell them exactly what to review and where (`http://localhost:3000` → Approvals / Ideas / Browser actions).

## Rules
- Answer with exactly the requested format (JSON only, or the full TSX file). No commentary inside the answer file.
- Never invent facts, trends, sources or statistics. If you cannot verify something, leave it out or mark the confidence as low.
- Never approve anything on the owner's behalf. Approvals are theirs.
- If the worker is not running (tasks stay QUEUED), say so. The owner starts it with `pnpm worker`.
