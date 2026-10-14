# 07: Complete the workflow on mobile and by keyboard

**What to build:** A visitor can complete both the preset workflow and the example-guided AI workflow at narrow screen widths and using only a keyboard, including inspecting explanations, captures, and copied output.

**Blocked by:** 04 — Explore and load all 20 presets; 06 — Generate using positive and negative examples.

**Status:** ready-for-agent

**Resolution:** resolved

- [x] On desktop, generation and testing share a workbench; on mobile they stack with readable editors and reachable controls.
- [x] Long patterns and match text scroll within their editors or result areas without forcing unintended page-wide horizontal scrolling.
- [x] Highlighted text remains aligned with editable text through vertical and horizontal scrolling, including multiline and Unicode samples.
- [x] Visitors can navigate the library, load a preset, edit/test it, inspect groups and explanations, and copy output at narrow widths.
- [x] Visitors can submit a description and examples, inspect the generated result, and correct failures at narrow widths when AI is configured.
- [x] Core inputs and controls have accessible names, visible focus, and logical keyboard order. Tabs and any dialogs support expected keyboard navigation and focus restoration.
- [x] Match/error/loading feedback is available without relying solely on color and is exposed appropriately to assistive technology.
- [x] A keyboard user can complete the same preset and AI workflows, including handling invalid input and returning to editing.
- [x] Browser acceptance checks observe complete user flows at representative desktop and mobile widths, with deterministic AI responses in tests and recorded limits for any unavailable real-provider check.
- [x] This ticket finishes full-workflow usability; it does not defer basic accessibility or responsive controls required in preceding tickets.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

## Resolution

Resolved on 2026-10-14. Both mobile workflows and desktop keyboard navigation are implemented. Mobile navigation remains visible; library links focus search, and loading a preset returns focus to the pattern editor. Invalid pattern errors are associated with the editor, disclosure/select focus is visible, and completed generation is announced without color.

Verification: 25 browser workflow tests pass on IPv4 port 3107 with one worker, including 390px preset and example-guided AI keyboard workflows, 320px long-pattern containment and multiline Unicode overlay scroll alignment, keyboard disclosure/copy recovery, desktop logical tab order, flags and validation. 51 unit/API tests, TypeScript, production build, Prettier and CRLF checks pass. Browser AI responses are deterministic fixtures at the HTTP boundary; no live Groq key was available. Real route behavior is covered by the API tests. Desktop/mobile screenshots were exported from the actual app to ignored output/playwright. No optional saved patterns, cheatsheet or deployment.
