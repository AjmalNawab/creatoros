---
name: snapchat-upload
description: Safely post an APPROVED CreatorOS Snapchat package to Spotlight on the "Chai & Curiosity" public profile through the owner's Chrome (Chrome DevTools MCP), then report the link. Use when the owner says "post it" with a pending snapchat_upload action.
---

# Snapchat Spotlight post via DevTools (owner-supervised)

## Preconditions
1. `pnpm action list` shows a pending `snapchat_upload`. Run `pnpm action show <id>` and use **only** the payload values.
2. The owner is present and has said to post.
3. The logged-in Snapchat account is exactly `payload.account.handle`, and its **public profile** exists.

## Steps
1. Open `https://profile.snapchat.com/` (desktop upload for public profiles). On a login, CAPTCHA or 2FA screen: **stop** and hand over to the owner. Never type passwords.
   - **First time only:** desktop Spotlight upload isn't confirmed on Snapchat's own help pages. If there is no upload option, stop and tell the owner: posting would need the phone app, which Claude can't do.
2. Check the profile name/handle matches `payload.account.handle`.
3. Upload → select `payload.videoPath`. **Send to: Spotlight**. Keep it public.
4. Description: `payload.caption` exactly. If Spotlight says it's too long, **stop** and tell the owner. Don't shorten it yourself (that would change the approved text).
5. If an AI-content label is offered, turn it ON. No boosting or ads.
6. Post. Then open the Spotlight post and copy its link (`snapchat.com/spotlight/<id>` or the share link).
7. Run `pnpm action complete <id> '{"url":"<link>","notes":"..."}'`.

## Never
- Post anything not in a pending, approved action, or change a value. Never post twice.
- Use the owner's personal Snapchat, or turn on contact syncing or "quick add".
- Bypass a CAPTCHA or verification step.
