# 01: Edit and safely test a pattern live

**What to build:** A visitor opens a runnable dark workbench, edits a JavaScript pattern and supported flags, types their own test text, and sees live matches without an AI key or sign-in. Invalid and slow patterns do not prevent further editing.

**Blocked by:** None (first implementation slice, once the user resumes implementation).

**Status:** ready-for-agent

- [ ] The app can be installed, started, and built with documented project commands; existing incomplete source is made runnable.
- [ ] The regex editor and editable playground are visible together on desktop, with usable narrow-screen and keyboard controls.
- [ ] Editing the pattern, test text, or a supported flag updates match highlights and counts without submitting a form.
- [ ] Global matching finds multiple matches; non-global matching shows the first. Ignore-case, multiline, dot-all, and Unicode behave as JavaScript defines them.
- [ ] Invalid patterns, no matches, testing in progress, and successful matches have distinct visible states.
- [ ] Local testing stays in the browser and requires no AI credential.
- [ ] Evaluation runs in an isolated worker with a deadline. A slow pattern is stopped with a helpful message and the visitor can edit and test again.
- [ ] Empty global matches terminate and advance correctly for Unicode characters. Obsolete test results cannot overwrite newer inputs.
- [ ] Input and displayed-match limits are enforced and explained; clipping results is not presented as the complete match count.
- [ ] Behavior-focused checks cover ordinary matches, flag changes, invalid syntax, zero-length Unicode matching, stale-result prevention, and slow-pattern recovery.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
