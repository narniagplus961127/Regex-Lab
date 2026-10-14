# 01: Edit and safely test a pattern live

**What to build:** A visitor opens a runnable dark workbench, edits a JavaScript pattern and supported flags, types their own test text, and sees live matches without an AI key or sign-in. Invalid and slow patterns do not prevent further editing.

**Blocked by:** None (first implementation slice, once the user resumes implementation).

**Status:** ready-for-agent

**Resolution:** resolved

- [x] The app can be installed, started, and built with documented project commands; existing incomplete source is made runnable.
- [x] The regex editor and editable playground are visible together on desktop, with usable narrow-screen and keyboard controls.
- [x] Editing the pattern, test text, or a supported flag updates match highlights and counts without submitting a form.
- [x] Global matching finds multiple matches; non-global matching shows the first. Ignore-case, multiline, dot-all, and Unicode behave as JavaScript defines them.
- [x] Invalid patterns, no matches, testing in progress, and successful matches have distinct visible states.
- [x] Local testing stays in the browser and requires no AI credential.
- [x] Evaluation runs in an isolated worker with a deadline. A slow pattern is stopped with a helpful message and the visitor can edit and test again.
- [x] Empty global matches terminate and advance correctly for Unicode characters. Obsolete test results cannot overwrite newer inputs.
- [x] Input and displayed-match limits are enforced and explained; clipping results is not presented as the complete match count.
- [x] Behavior-focused checks cover ordinary matches, flag changes, invalid syntax, zero-length Unicode matching, stale-result prevention, and slow-pattern recovery.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

Implemented 2026-10-14: runnable Next.js 16.4 workbench; worker deadline and cancellation; Unicode empty matches; exact 500-match clipping distinction; visible syntax, no-match, progress and success states; 2,000-pattern and 30,000-text limits; responsive editor. Red-green evidence: engine test failed because exactly 500 matches incorrectly reported clipping, then passed; first browser run failed because globals.css was missing, then passed after the runnable UI. Verification: six Chromium browser tests pass, one engine boundary test passes, TypeScript and production webpack build pass. Playwright verifies ordinary matches, all flags, invalid recovery, timeout recovery, obsolete results, clipping, limits and narrow-screen layout. Later-ticket scaffold interfaces remain available; no optional saved-pattern or cheatsheet UI.
