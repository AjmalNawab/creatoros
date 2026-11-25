---
name: tiktok-upload
description: Safely post an APPROVED CreatorOS TikTok package to the owner's separate "Chai & Curiosity" TikTok account through the owner's Chrome (Chrome DevTools MCP), then report the link. Use when the owner says "post it to TikTok" or a tiktok_upload action is pending.
---

# TikTok post via DevTools (owner-supervised)

## Preconditions
1. `pnpm action list` shows a pending `tiktok_upload`. Run `pnpm action show <id>` and use **only** the payload values.
2. The owner is present and has said to post.
3. The logged-in TikTok account is exactly `payload.account.handle`, **never the owner's personal account**. If it's the wrong account, stop and ask the owner to switch.

## Steps
1. Open `https://www.tiktok.com/tiktokstudio/upload`. If you see a login, CAPTCHA, 2FA or verification screen: **stop** and hand over to the owner. Never type passwords.
2. Check the account avatar/handle matches `payload.account.handle`.
3. `upload_file` with `payload.videoPath`. Wait for the upload to finish.
4. **Description:** `payload.caption`, exactly. TikTok's editor is Draft.js:
   - **Don't** use `execCommand`, which crashes the page.
   - **Don't** type Urdu with keystrokes, which scrambles the letters.
   - **Do** select all the editor's contents with a DOM Range, press the real Backspace key, then dispatch one `ClipboardEvent('paste')` whose `DataTransfer` holds the whole caption (`text/plain`).
   - Read back the `[data-block]` lines and compare them exactly with the caption.
   - Close the hashtag pop-up by clicking the "Details" heading, not with Enter.
   - TikTok asks once to turn on automatic content checks: turn them on.
5. **Settings:**
   - Who can watch: Everyone. Comments: on.
   - Show more → **"AI-generated content": ON** (the narration is an AI voice). Confirm the "Turn on" dialog. Leave **"Audience control" (18+) OFF**; its 18+ note is easy to mistake for the AI label.
   - No promote/ads, and no music added (the video has its own audio).
6. **Post.** Then open the profile, take the newest video link (`tiktok.com/@handle/video/<id>`), and check it's the right video.
7. Run `pnpm action complete <id> '{"url":"<link>","notes":"..."}'`. The agent verifies it via TikTok's public oEmbed.

## Never
- Post anything that isn't in a pending, approved action, or change a value.
- Post the same video twice.
- Bypass a CAPTCHA or verification step.
- Use the owner's personal account.
- Turn on "suggest account to contacts" settings.
