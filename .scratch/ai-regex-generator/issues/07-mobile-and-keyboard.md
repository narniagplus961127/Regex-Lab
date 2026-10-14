# 07: Complete the workflow on mobile and by keyboard

**What to build:** A visitor can complete both the preset workflow and the example-guided AI workflow at narrow screen widths and using only a keyboard, including inspecting explanations, captures, and copied output.

**Blocked by:** 04 — Explore and load all 20 presets; 06 — Generate using positive and negative examples.

**Status:** ready-for-agent

- [ ] On desktop, generation and testing share a workbench; on mobile they stack with readable editors and reachable controls.
- [ ] Long patterns and match text scroll within their editors or result areas without forcing unintended page-wide horizontal scrolling.
- [ ] Highlighted text remains aligned with editable text through vertical and horizontal scrolling, including multiline and Unicode samples.
- [ ] Visitors can navigate the library, load a preset, edit/test it, inspect groups and explanations, and copy output at narrow widths.
- [ ] Visitors can submit a description and examples, inspect the generated result, and correct failures at narrow widths when AI is configured.
- [ ] Core inputs and controls have accessible names, visible focus, and logical keyboard order. Tabs and any dialogs support expected keyboard navigation and focus restoration.
- [ ] Match/error/loading feedback is available without relying solely on color and is exposed appropriately to assistive technology.
- [ ] A keyboard user can complete the same preset and AI workflows, including handling invalid input and returning to editing.
- [ ] Browser acceptance checks observe complete user flows at representative desktop and mobile widths, with deterministic AI responses in tests and recorded limits for any unavailable real-provider check.
- [ ] This ticket finishes full-workflow usability; it does not defer basic accessibility or responsive controls required in preceding tickets.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
