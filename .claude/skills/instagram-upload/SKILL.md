---
name: instagram-upload
description: Safely post an APPROVED CreatorOS Instagram package (Reel) to the separate "Chai & Curiosity" Instagram account through the owner's Chrome (Chrome DevTools MCP), then report the link. Use when the owner says "post it" with a pending instagram_upload action.
---

# Instagram post via DevTools (owner-supervised)

## Preconditions
1. `pnpm action list` shows a pending `instagram_upload`. Run `pnpm action show <id>` and use **only** the payload values.
2. The owner is present and has said to post.
3. The logged-in Instagram account is exactly `payload.account.handle`, **never the owner's personal account**. If it's wrong, stop and ask the owner to switch.

## Steps
1. Open `https://www.instagram.com/`. On a login, CAPTCHA, 2FA or "suspicious login" screen: **stop** and hand over to the owner. Never type passwords.
2. Check the profile handle in the sidebar matches `payload.account.handle`.
3. Create (+) → Post → `upload_file` with `payload.videoPath`. Instagram posts videos as Reels. Crop: **Original** (9:16).
4. Next through the edit screens. Caption: `payload.caption` exactly. Insert it line by line and verify by reading it back. Close hashtag pop-ups by clicking elsewhere, not Enter.
5. **Advanced settings:**
   - **AI label ("Add AI info")**: ON (the narration is an AI voice).
   - **Share to Facebook**: OFF. The accounts stay separate.
   - Comments: on.
6. Share. Open the profile → Reels → the newest reel and copy its link (`instagram.com/reel/<code>/`). Check it's the right video.
7. Run `pnpm action complete <id> '{"url":"<link>","notes":"..."}'`.

## Never
- Post anything that isn't in a pending, approved action, or change a value.
- Post twice, or link the account to Facebook or to the owner's contacts.
- Bypass a CAPTCHA or verification step.
