---
name: post-stats
description: Record views/likes/comments/shares for CreatorOS posts (Facebook, TikTok, YouTube) as dated snapshots shown on the dashboard's "Published & stats" page. Use when the owner says "check stats", "how are the videos doing", or "update the numbers".
---

# Post stats (read-only on the platforms)

Snapshots are append-only. Record only what the platform actually shows. **Leave a field out when it's not shown; never write 0 for "unknown".**

1. `pnpm stats list` shows every post with its short id and the last check.
2. **YouTube:** `pnpm stats youtube` (needs `YOUTUBE_API_KEY` in `.env`; it's free). Without a key, read the numbers in YouTube Studio → Content and record them like the others.
3. **TikTok** (owner's Chrome, account @chai_and_curiosity): open `https://www.tiktok.com/tiktokstudio/content`. Each row shows views, likes and comments. Match a row by its link (`/video/<id>`), not by its caption.
4. **Facebook** (as the Page "Chai & Curiosity"): open each reel URL from the list and read the plays, reactions, comments and shares under the reel. Or use Professional dashboard → Content, which also shows reach ("Accounts reached").
5. Record each one: `pnpm stats record <postId> '{"views":120,"likes":9,"comments":2,"shares":1,"reach":95}'`.
6. Tell the owner what changed since the last check, and which posts have comments that need a reply. Show them the comment text, but **never reply or like on their behalf** without approval.

## Never
- Change anything on the platforms (no replies, likes, edits, boosts). This skill only reads.
- Guess or round numbers. Copy them as shown ("1.2K" becomes 1200 only if that's how it's shown, so add a note saying it was rounded).
