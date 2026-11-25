# AI-content, originality and monetization policies: Facebook and YouTube (2025-2026), for an AI-assisted educational channel

Context: AI narration (Kokoro English TTS; edge-tts ur-PK-AsadNeural for Urdu), ChatGPT-generated painted illustrations animated with original motion graphics, original researched scripts, public-domain archival photos (NASA). Facebook Page "Chai & Curiosity" (Pakistan/Urdu, owner in Pakistan); YouTube "Margin of Safety" (English engineering-failure stories). Research date: 2026-11-24.

## YouTube: the July 2025 "inauthentic content" policy and how it treats AI voice and images

### Takeaway
On 15 July 2025 YouTube renamed its "repetitious content" YPP rule to "inauthentic content". It targets channels that are mass-produced, templated or repetitive, plus "reused content" that adds no value. Using AI is not disqualifying in itself. The risk comes from AI content made "with generic or unoriginal templates giving the impression of mass production". A researched, individually scripted story with original motion graphics fits YouTube's description of acceptable content. The weak points are a templated look (the same structure, same visuals and same voice in every video) and high-volume uploads.

### Cited Findings
- The YPP monetization policies page says YouTube is "renaming this policy from 'repetitious content' to 'inauthentic content'". The most recent dated change on the page is 15 July 2025. — [YouTube Help: YPP channel monetization policies](https://support.google.com/youtube/answer/1311392)
- Under the policy, channels must not be "mass-produced, generic, repetitive, or manipulative". Generic or repetitive content is defined as content that "looks like it's made with a template". — [YouTube Help](https://support.google.com/youtube/answer/1311392)
- AI: content made with AI is not automatically ineligible. The policy against mass production covers "AI-generated content made with generic or unoriginal templates giving the impression of mass production". — [YouTube Help](https://support.google.com/youtube/answer/1311392)
- "Reused content" repurposes content that's already on YouTube without meaningful added value. It is judged separately from copyright, so a channel can violate it even with the original creator's permission. — [YouTube Help](https://support.google.com/youtube/answer/1311392)
- An "AI Personas" provision targets channels whose AI-generated personas present themselves as human experts on sensitive topics such as health, legal, financial or political issues. — [YouTube Help](https://support.google.com/youtube/answer/1311392)
- YouTube called the July 15 update a clarification of existing guidelines, not a new policy. Rene Ritchie (Head of Editorial & Creator Liaison) called it a "minor update" aimed at low-value mass-produced uploads, not at banning AI or reused content. — [TechCrunch, 9 Jul 2025](https://techcrunch.com/2025/07/09/youtube-prepares-crackdown-on-mass-produced-and-repetitive-videos-as-concern-over-ai-slop-grows); [Search Engine Journal](https://www.searchenginejournal.com/youtube-clarifies-monetization-update-targeting-spam-not-reaction-channels/550123/); [Social Media Today](https://www.socialmediatoday.com/news/youtube-clarifies-monetization-update-inauthentic-repeated-content/752892/)
- Ritchie also restated that creators must disclose realistic altered or synthetic content "regardless of how the content is created". — [Digiday](https://digiday.com/media/youtubes-ai-slop-crackdown-has-creators-concerned-marketers-cheering)

### Inferences
- I found no official statement that TTS narration on its own triggers "inauthentic content". The policy's test is mass production, templating and repetition. Third-party advice that "AI voice + stock images = demonetization" is an interpretation of that test, not policy text.
- Practical risk factors for Margin of Safety: an identical scene template in every video, the same synthetic voice with no on-screen human presence, very high upload frequency, and thin scripts. Mitigations: visibly unique research and narrative per video, scene designs built for each video (the renderer already does this per `src/videos/<key>.tsx`), cited sources in descriptions, varied structure, and possibly a consistent human element (an on-camera intro or the owner's own voice) if a reviewer flags the channel.
- NASA and other public-domain footage is fine copyright-wise. However, "reused content" applies even with permission, so archival clips should be transformed with narration, analysis and graphics, not just strung together.

### Gaps
- No official YouTube text specifically addresses third-party TTS voices (Kokoro, edge-tts) for YPP review. I found no source that addresses AI voiceovers directly.
- YouTube does not publish how human reviewers weigh "templated" visuals in YPP applications.

## YouTube: altered/synthetic content disclosure ("Altered or synthetic content" toggle)

### Takeaway
Disclosure is required only for **realistic** content that viewers could mistake for real people, places or events. Stylised or painted AI illustrations and fully animated scenes are explicitly in the "non-realistic" category and do not need disclosure. AI narration is not listed as requiring disclosure unless it makes a real person appear to say something. Disclosing does not reduce reach or monetization.

### Cited Findings
- Disclosure is required for content "that seems realistic", including content that: "Makes a real person appear to say or do something they didn't do"; "Alters footage of a real event or place"; "Generates a realistic scene that didn't actually occur"; "Creates music that's the main focus of the video" (wording as summarised from the page). — [YouTube Help: Disclosing altered or synthetic content](https://support.google.com/youtube/answer/14328491)
- No disclosure is needed for non-realistic content such as fantasy or fully animated videos (the page's example is "an AI-generated or altered animation of a missile in a fully animated video"), minor aesthetic edits, production assistance (AI-drafted scripts, titles, thumbnails), caption creation, voice/audio repair, or cloning one's own voice for voice-overs and dubs. — [YouTube Help](https://support.google.com/youtube/answer/14328491)
- Disclosing does not by itself limit a video's audience or affect monetization eligibility. — [YouTube Help](https://support.google.com/youtube/answer/14328491)
- Creators who consistently fail to disclose may face "manual application of a label, or penalties from YouTube, including removal of content", and possibly YPP suspension. — [YouTube Help](https://support.google.com/youtube/answer/14328491)

### Inferences
- Painted ChatGPT illustrations in an obviously stylised blueprint or painted look are "non-realistic", so no disclosure is needed. **However**, a photorealistic AI image that depicts a real historical event (for example a realistic "photo" of the Mars Polar Lander crash or a real engineer) would fall under "Generates a realistic scene that didn't actually occur" or "Alters... a real event". Those videos should be disclosed, or such images avoided or captioned "illustration".
- A stock TTS narrator (not impersonating a real person) is not listed as a disclosure trigger. Recommended policy: toggle "Yes" whenever any realistic-looking AI depiction of a real event or person appears. It costs nothing in reach and removes penalty risk. A description line such as "Narration: synthetic voice; illustrations: AI-generated, stylised" is good-faith transparency, though not required.

### Gaps
- The help page does not mention "illustrations" explicitly, and has no dedicated section on third-party synthetic voices.

## YouTube: YPP thresholds and Pakistan availability

### Takeaway
Current (until 31 Jan 2027) ad-revenue tier: 1,000 subscribers + 4,000 public watch hours in 12 months, or 1,000 subscribers + 10M Shorts views in 90 days. From 1 Feb 2027 new applicants need 8,000 hours or 20M Shorts views. Standard YPP **is available in Pakistan**. The lower 500-subscriber "expanded YPP" tier **is not**: Pakistan is absent from its official country list.

### Cited Findings
- Standard YPP: "1,000 subscribers with 4,000 qualified watch hours in the last 12 months" or "1,000 subscribers with 10 million qualified Shorts views in the last 90 days". You must "Live in a country/region where the YouTube Partner Program is available". — [YouTube Help: YPP overview & eligibility](https://support.google.com/youtube/answer/72851)
- The same page announces: "Starting February 1, 2027, we are introducing updates to the YouTube Partner Program", and existing partners must "review and accept the updated terms in YouTube Studio by January 31, 2027". — [YouTube Help](https://support.google.com/youtube/answer/72851)
- The Feb 2027 changes were announced in Aug 2026. New applicants need 1,000 subs + 8,000 public watch hours (365 days) or 20M qualified Shorts views (90 days). Partners must keep at least 10M Shorts views over a rolling 90 days to earn Shorts revenue share, and keep long-form earnings if they fall below. Existing partners are grandfathered. Fan Funding thresholds are reported as unchanged. — [YouTube Official Blog](https://blog.youtube/news-and-events/youtube-partner-program-updates-2027-new-opportunities-earn/); [The Next Web](https://thenextweb.com/news/youtube-partner-program-doubles-entry-requirements-2027); [Android Headlines](https://www.androidheadlines.com/?p=1299479); [Hypebeast, Aug 2026](https://hypebeast.com/2026/8/youtube-partner-program-doubles-watch-hours-for-2027)
- Expanded YPP (fan funding: memberships, Super Chat/Thanks, Shopping): "500 subscribers with 3 valid public uploads in the last 90 days, and 3,000 qualified watch hours in the last 12 months", or 500 subs + 3 uploads + "3 million qualified Shorts views in the last 90 days". — [YouTube Help: Expanded YPP](https://support.google.com/youtube/answer/13429240)
- The expanded YPP country list (Algeria … Vietnam, including India, UAE, Saudi Arabia and the UK) **does not include Pakistan**. Creators outside the list "see no changes to YPP". — [YouTube Help: Expanded YPP](https://support.google.com/youtube/answer/13429240); corroborated by [pkrevenue.com](https://pkrevenue.com/youtube-cuts-monetization-to-500-subscribers-pakistan-excluded/)
- The standard "YouTube Partner Program availability" page lists Pakistan (seen in a search excerpt: "... Oman, Pakistan, Panama ..."). — [YouTube Help: YPP availability](https://support.google.com/youtube/answer/7101720) (excerpt via search; I did not fetch the full page)

### Inferences
- For Margin of Safety the YPP status follows the owner's country of residence (Pakistan). The applicable bar is the 1,000-subscriber tier. There is no 500-subscriber shortcut, and applying after 1 Feb 2027 means 8,000 hours. Hitting 4,000 hours **and** applying before 1 Feb 2027 avoids the doubled bar, although meeting 4,000 hours in about 2 months is unlikely for a new channel.
- Fan-funding features that depend on expanded YPP or per-feature country lists may also be unavailable in Pakistan. Third-party claims conflict on this.

### Gaps
- I did not fetch the full official YPP availability page. Pakistan's inclusion rests on a search-snippet excerpt of the official page, so it is high confidence but should be confirmed in YouTube Studio > Earn.
- I could not verify per-feature availability in Pakistan (Super Thanks, memberships).
- The exact official wording of the Feb 2027 terms beyond the blog and press coverage is unverified.

## Facebook: AI labelling ("AI info") and disclosure

### Takeaway
Meta requires self-disclosure (the "AI info" label) for organic posts with **photorealistic video or realistic-sounding audio that was digitally created or altered**, and may penalise non-disclosure. It also auto-labels content carrying C2PA/IPTC signals. ChatGPT images carry C2PA metadata, so they may be auto-labelled. Meta's stated approach keeps AI content up with labels. Down-ranking applies when fact-checkers rate content False or Altered, not for the AI label itself.

### Cited Findings
- "We'll require people to use this disclosure and label tool when they post organic content with a photorealistic video or realistic-sounding audio that was digitally created or altered, and we may apply penalties if they fail to do so." — [Meta Newsroom, Feb 2024: Labeling AI-generated images](https://about.fb.com/news/2024/02/labeling-ai-generated-images-on-facebook-instagram-and-threads/)
- Labels apply when Meta detects industry-standard AI indicators or when people self-disclose. "Made with AI" was renamed "AI info" on 1 Jul 2024. From 12 Sep 2024, content only *edited* with AI shows the label in the post menu rather than on the post. The page was last updated 23 Oct 2025. — [Meta Newsroom: Our approach to labeling AI-generated content](https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/)
- Down-ranking ("we show it lower in Feed so fewer people see it") is tied to fact-checker ratings of False or Altered. AI content is otherwise kept up "so we can add informational labels and context". — [Meta Newsroom](https://about.fb.com/news/2024/04/metas-approach-to-labeling-ai-generated-content-and-manipulated-media/)
- Meta's help centre says people may be "in some cases required" to label content with AI info, and warns of penalties for content shared without a required label. — [Meta Help: How to identify AI content](https://www.meta.com/en-gb/help/artificial-intelligence/1783222608822690/) (via search snippet; the full page did not load)

### Inferences
- The TTS narration is "realistic-sounding audio that was digitally created". Read literally, Meta's rule suggests Urdu narration by ur-PK-AsadNeural should carry the AI info disclosure. This is the main disclosure difference from YouTube, where non-impersonating narration is not listed. The conservative choice is to toggle the AI label on every Chai & Curiosity post.
- No official Meta source says AI-labelled content gets reduced distribution. Fact-check ratings and unoriginality are the documented reach penalties. Evidence that the label suppresses reach in practice is anecdotal at best, and I found none from reliable sources.

### Gaps
- I could not load the full Meta help page on when labelling is "required", or the current exact wording post-2025.
- There are no official data on distribution effects of the AI info label.

## Facebook: unoriginal-content penalties (July 2025 crackdown, March 2026 update)

### Takeaway
Meta penalises reposting or repurposing **other creators'** content without meaningful enhancement. Penalties are loss of monetization "for a period of time", reduced distribution of everything the account shares, and (since March 2026) possibly being made "non-recommendable". Original produced content, including content made with creator-produced edits and voiceover, is the stated preferred category. The official posts do not single out AI.

### Cited Findings
- 14 Jul 2025: "Unoriginal content reuses or repurposes another creator's content repeatedly without crediting them". Approved third-party content is acceptable with creative editing, voiceover or commentary. "Simply stitching together clips or adding your watermark does not qualify as meaningful enhancement." — [Meta for Creators: Combating unoriginal content](https://creators.facebook.com/blog/combating-unoriginal-content)
- Penalties: accounts may "lose access to Facebook monetization programs for a period of time" and "receive reduced distribution on everything they share". Detected duplicate videos get reduced distribution. — [Meta for Creators](https://creators.facebook.com/blog/combating-unoriginal-content)
- Best practices: avoid "visible third party watermarks and content that is visibly recycled from other apps or sources". Captions "with no links, minimal use of capital letters, and no more than five hashtags perform best". Avoid "super short videos that offer viewers little value". — [Meta for Creators](https://creators.facebook.com/blog/combating-unoriginal-content)
- Meta took action on about 500,000 spammy or fake-engagement accounts in H1 2025. TechCrunch noted the crackdown may also cover "AI slop". — [TechCrunch, 14 Jul 2025](https://techcrunch.com/2025/07/14/following-youtube-meta-announces-crackdown-on-unoriginal-facebook-content)
- March 2026: original = "Content filmed or produced directly by a creator or owner of a Profile or Page". Content that is "duplicative or involves minor edits to another creator's post" is deprioritised, and borders or captions don't make it original. Repeat offenders may be "deemed non-recommendable and demonetized". "Creators always have the option to appeal decisions regarding originality." — [Meta Newsroom, Mar 2026: Rewarding original creators](https://about.fb.com/news/2026/03/rewarding-original-creators/)
- Meta's creator guidance also flags Pages that primarily share "re-purposed clips from other sources with limited editorialization". — [Meta for Creators: Keeping content safe](https://creators.facebook.com/keeping-content-safe/) (via search snippet)

### Inferences
- Chai & Curiosity's own scripted, rendered videos are "produced directly by" the Page owner, so they are original under Meta's definition even with AI tools. The specific risks are: reposting the YouTube English videos (the same video on two Pages or duplicate copies), using reframed 16:9 → 9:16 copies that duplicate another uploaded copy, and NASA clips without editorial transformation. Duplicate detection is per-video, so the same render should not be uploaded to multiple Pages.
- Avoid third-party watermarks (for example a visible ChatGPT/Sora mark or stock watermarks) in frames.

### Gaps
- I could not retrieve the official Partner Monetization Policies or Content Monetization Policies page text (the fetch returned only the title). Exact current wording on "limited originality" and AI is unverified.

## Facebook: Content Monetization program, thresholds and Pakistan eligibility

### Takeaway
In-stream ads, Ads on Reels and the Performance Bonus were merged into **Facebook Content Monetization** (announced Oct 2024). As of late 2026 it is still **invite-only**, with no published follower or minute thresholds and no published country list. The old in-stream thresholds (e.g. 5,000 followers / 60,000 minutes) are historical and no longer an entry route. **Pakistan is a major risk.** Since March 2025 Pakistani creators report that Pakistani bank accounts and tax details are no longer accepted for payouts, and many Pakistani Pages were demonetised. Stars is reported as available in Pakistan. Pakistan's eligibility for Content Monetization is unconfirmed and likely unavailable with a Pakistani payout account.

### Cited Findings
- Content Monetization "merges our In-stream ads, Ads on Reels, and Performance Bonus into one". Earnings come from Reels, longer videos, photos and text posts, based on "the engagement, views and plays your eligible public content receives". Creators must comply with the Partner Monetization Policies and Content Monetization Policies. The beta was invite-only (invites to about 1M already-monetising creators) and was announced 2 Oct 2024. — [Meta for Creators: Introducing Facebook Content Monetization](https://creators.facebook.com/introducing-facebook-content-monetization/)
- The current tool page says: "The program is currently invite-only." "Invitations are distributed periodically to eligible creators." "we plan to offer open enrollment in the near future". No criteria, thresholds or countries are listed. — [Meta for Creators: Facebook Content Monetization](https://creators.facebook.com/tools/facebook-content-monetization)
- March 2026, Creator Fast Track: established creators with 100k+ followers on Instagram/TikTok/YouTube get $1,000/month (or $3,000/month at 1M+) for three months plus immediate Content Monetization access. Content Monetization "remains invitation-only", and creators can express interest via Professional Dashboard > Monetization > Content Monetization. New metrics include Qualified Views and Earnings Rate per 1,000 qualified views. — [Meta Newsroom, Mar 2026: Creator Fast Track](https://about.fb.com/news/2026/03/creator-fast-track-grow-your-audience-earn-money-on-facebook/); a secondary source says Fast Track is US/Canada only — [Buffer](https://buffer.com/resources/how-to-make-money-on-facebook/) (unverified)
- A third-party guide says the legacy in-stream ads, Ads on Reels and Performance Bonus ended 31 Aug 2025 in every country. — [lilachbullock.com](https://www.lilachbullock.com/facebook-monetization-in-pakistan/) (secondary; I found no official Meta confirmation of that exact date)
- Historical thresholds: Meta's old in-stream page cited a minimum of 5,000 followers, and third-party guides cite 10,000 followers + 600,000 minutes viewed in 60 days (in-stream, older) and 5,000 followers + 60,000 minutes for VOD. These are no longer published entry criteria. — [Meta for Creators: In-stream ads (legacy)](https://creators.facebook.com/tools/in-stream-ads); summarised by search results; treat as historical
- Pakistan payouts (Mar 2025): "the restriction on using Pakistani bank accounts and tax details for monetisation". Affected creators lost in-stream ads, reel ads, photo-post earnings and story monetisation. Pages must link financial details from eligible countries such as the US, UK, UAE and India "and others", with "bank and tax details from the same eligible country". "If payouts enter verification mode and fail, the platform may permanently disable a page's ability to earn." — [ProPakistani, 17 Mar 2025](https://propakistani.pk/2025/03/17/facebook-quietly-tightens-monetization-policy-in-pakistan/); [Express Tribune](https://tribune.com.pk/story/2534763/why-facebook-pages-got-demonetised-and-how-to-reclaim-monetisation); [Daily Pakistan](https://en.dailypakistan.com.pk/18-Mar-2025/facebooks-unexplained-demonetization-of-pakistani-pages-hits-content-creators-hard)
- Facebook Stars launched in Pakistan in Dec 2022. Third-party guides say Pakistan is listed for Stars but not Subscriptions. — [Express Tribune: Meta launches Facebook Stars in Pakistan](https://tribune.com.pk/story/2390281/meta-launches-facebook-stars-in-pakistan); [lilachbullock.com](https://www.lilachbullock.com/facebook-monetization-in-pakistan/)

### Inferences
- **High uncertainty:** for a Pakistan-based owner with Pakistani bank and tax details, Facebook Content Monetization is very likely unavailable in practice, even if an invite arrives. Using another country's bank or tax details that the owner does not legitimately hold would violate Meta rules and risks a permanent ban. It must not be done. Stars is the only realistic Facebook earning feature for now, and it requires audience gifting, not ad revenue.
- For planning, treat Chai & Curiosity as an audience-building and brand asset, not a revenue source. Monitor Professional Dashboard > Monetization for eligibility changes.

### Gaps
- Meta publishes no official country list for Content Monetization, and I found no official statement on Pakistan specifically. The payout restriction rests on Pakistani news reports, not Meta documentation.
- I found no official current thresholds (follower or minute counts) for Content Monetization invitations.
- I could not retrieve the text of the Partner Monetization Policies or Content Monetization Policies to quote AI-specific or educational-content clauses.
- Whether AI-labelled content is distribution-limited on Facebook: I found no official or reliable evidence either way.
