---
name: youtube-upload
description: Safely upload an APPROVED CreatorOS YouTube package through the owner's Chrome using the Chrome DevTools MCP, then report the link. Use when the owner says "upload it", "publish to YouTube", or a youtube_upload human action is pending.
---

# YouTube upload via DevTools (owner-supervised)

## Preconditions (check them all; stop if any fails)
1. `pnpm action list` shows a pending `youtube_upload`. Run `pnpm action show <id>` and use **only** its payload values. The backend already verified the approval, file hash and idempotency.
2. The owner is present and said to upload.
3. Chrome DevTools MCP is connected. Load the tools via ToolSearch (`select:mcp__chrome-devtools__list_pages,...`). If the connection fails, ask the owner to enable `chrome://inspect/#remote-debugging` and click Allow.

## Steps
1. `new_page` → `https://studio.youtube.com`. Take a `take_snapshot`. If you see a login, account chooser, CAPTCHA, 2FA or a verification screen: **stop** and ask the owner to complete it. Never type passwords.
2. Confirm the channel name with the owner if more than one channel exists.
3. Create → Upload videos → `upload_file` with `payload.videoPath`.
4. Details: title = `payload.title`, description = `payload.description` (fill it exactly). Thumbnail: `upload_file` with `payload.thumbnailPath`. If the option is disabled (channel not phone-verified), skip it and note it.
5. Audience: "No, it's not made for kids". Show more → Altered content: **No** (stylised animation). Tags: `payload.tags` comma-joined. Language: Urdu. Category: Education.
6. Next through Video elements and Checks (report any copyright claim or issue to the owner and stop).
7. Visibility: `payload.visibility`. Save or Publish. Copy the video link from the dialog.
8. `pnpm action complete <id> '{"url":"<link>","visibility":"<visibility>","notes":"<thumbnail set? anything unusual>"}'`. The agent verifies the link and records the post.

## Never
- Upload anything not in a pending, approved action, or change any field value.
- Upload the same video twice (the backend prevents it; don't work around it).
- Bypass a CAPTCHA, 2FA, verification or policy prompt, or click through warnings without the owner.
- Do several uploads in a row quickly. One at a time, owner watching.
