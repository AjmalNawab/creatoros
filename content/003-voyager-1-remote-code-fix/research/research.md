# Research: Voyager 1 remote code fix

In November 2023 Voyager 1, launched in 1977 and now in interstellar space, began sending unreadable data. In March 2024 JPL engineers traced the problem to one failed chip in the Flight Data Subsystem (FDS), one of the spacecraft's three onboard computers; the chip held part of the FDS memory, including some of its software. With no way to replace hardware, they split the affected code into pieces and relocated them into other parts of the FDS memory, updating references so it still worked as a whole. The first patch was sent on April 18, 2024 and confirmation of returning engineering data arrived on April 20, 2024. On November 14, 2026, Voyager 1 again stopped returning data (carrier signal only) just as it reached one light-day from Earth; NASA says engineers are still diagnosing it.

**Audience:** Broad science and tech audience (16-45), programmers and space fans

## Facts

| # | Fact | Confidence | Source |
|---|---|---|---|
| 1 | Voyager 1 launched in 1977 and is the most distant human-made object, in interstellar space. | high | NASA/JPL |
| 2 | In November 2023 Voyager 1 began sending data the team could not read. | high | NASA Voyager blog (Apr 2024) |
| 3 | In March 2024 the team confirmed the issue was in the Flight Data Subsystem (FDS), one of three onboard computers. | high | NASA Voyager blog (Apr 2024) |
| 4 | A single chip storing part of the FDS memory, including some of its software code, had stopped working. | high | NASA Voyager blog (Apr 2024) |
| 5 | The failed chip held roughly 3 percent of the FDS memory. | medium | IEEE Spectrum / press reports |
| 6 | No single free location in memory was large enough for the affected code, so engineers split it into pieces and stored them in different places, updating references so it still worked as a whole. | high | NASA Voyager blog (Apr 2024) |
| 7 | The first relocated code (which packages engineering data) was sent on April 18, 2024; confirmation that it worked arrived on April 20, 2024. | high | NASA Voyager blog (Apr 2024) |
| 8 | Commands then took about 22.5 hours to reach Voyager 1 and the reply as long to return, so each test took about two days round trip. | high | NASA/JPL (2024) |
| 9 | Science data from instruments returned in further updates in May and June 2024. | medium | NASA / press reports |
| 10 | On November 14, 2026 Voyager 1 stopped returning science and engineering data, sending only a carrier signal; NASA suspects the onboard data computer and is still diagnosing it. | high | NASA Voyager blog (Nov 18, 2026) |
| 11 | In November 2026 Voyager 1 reached one light-day from Earth: a signal now takes about 24 hours each way. | high | NASA / Space.com (Nov 2026) |

## Sources
- NASA Voyager blog: Voyager 1 resumes sending engineering updates (Apr 2024): https://blogs.nasa.gov/voyager/2024/04
- JPL news: Voyager 1 resumes sending engineering updates: https://www.jpl.nasa.gov/news/nasas-voyager-1-resumes-sending-engineering-updates-to-earth
- IEEE Spectrum: Voyager 1 fix: https://spectrum.ieee.org/voyager-1
- NASA Voyager blog (Nov 18, 2026): https://science.nasa.gov/blogs/voyager/2026/11/18/voyager-1-engineers-analyze-data-issue-ready-to-confirm-light-day/

## Avoid
- Claiming the cause of the 2026 data halt is known (it is still being diagnosed).
- Claiming a cosmic ray caused the 2023 chip failure (never confirmed).
- Saying engineers 'rewrote the whole software'; they relocated pieces of existing code.
- Exaggerating distances; use about 24 billion km / one light-day.