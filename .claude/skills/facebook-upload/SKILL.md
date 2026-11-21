---
name: facebook-upload
description: Safely post an APPROVED CreatorOS Facebook package (Reel or video) to the Page "Chai & Curiosity" through the owner's Chrome using the Chrome DevTools MCP, then report the link. Use when the owner says "post it to Facebook", "upload it" with a pending facebook_upload action.
---

# Facebook post via DevTools (owner-supervised)

## Preconditions (check them all; stop if any fails)
1. `pnpm action list` shows a pending `facebook_upload`. Run `pnpm action show <id>` and use **only** its payload values. The backend already checked the approval, the file hash and idempotency.
2. The owner is present and has said to post.
3. Chrome DevTools MCP is connected (load the tools via ToolSearch).

## Steps
1. Open `payload.page.url`. If you see a login, checkpoint, CAPTCHA or 2FA screen: **stop** and hand over to the owner. Never type passwords.
2. **Act as the Page, not the person.** The Page header must show `payload.page.name`. If Facebook is in the personal profile, use "Switch now" / switch profile to the Page first. Never post on the owner's personal timeline.
3. `postAs = reel`: go to Reels → Create reel (or `https://www.facebook.com/reels/create`). `postAs = video`: on the Page, Create post → Photo/video. `upload_file` with `payload.videoPath`.
4. Description/caption: `payload.caption`, exactly as given. Title, if a field asks for it: `payload.title`.
5. Audience: Public. **Share to story**: set it exactly as `payload.shareToStory` (Reel settings → Share to story). If Meta asks about AI-generated content, answer honestly: the narration is AI; the animation is stylised and not realistic.
6. Do not boost, run ads, cross-post to Instagram, or invite friends unless the owner explicitly says so.
7. Share/Publish. Open the published post and copy its link (`facebook.com/reel/<id>` or `…/videos/<id>`).
8. Run `pnpm action complete <id> '{"url":"<link>","notes":"<anything unusual>"}'`. The agent records the post.

## Never
- Post anything that isn't in a pending, approved action, or change any field value.
- Post the same video twice. The backend prevents it; don't work around it.
- Bypass a checkpoint, CAPTCHA, 2FA or policy prompt.
