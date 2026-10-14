# AI Regex Generator tracker

The [specification](spec.md) is published. The user approved the seven core implementation tickets on 2026-10-14. Each has `ready-for-agent` triage status; dependency completion and permission to implement are separate from that status.

Application implementation was authorized on 2026-10-14 using Next.js, TypeScript, Vercel, Groq, Prettier, and CRLF. Do not deploy. Tickets 08 and 09 are optional drafts outside the approved core release.

## Approved core tickets

| Ticket                                                                  | Deliverable                                                     | Blocked by |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ---------- |
| [01: Live playground](issues/01-live-playground.md)                     | Edit and safely test a pattern live                             | None       |
| [02: Validation and checks](issues/02-validation-and-checks.md)         | Validate entire inputs, inspect captures, and evaluate examples | 01         |
| [03: Explanation and copy](issues/03-explanation-and-copy.md)           | Understand and export the current pattern consistently          | 02         |
| [04: Twenty presets](issues/04-twenty-presets.md)                       | Search and load all 20 complete preset examples                 | 03         |
| [05: AI generation](issues/05-ai-generation.md)                         | Generate a pattern from a description through a real provider   | 03         |
| [06: Example-guided generation](issues/06-example-guided-generation.md) | Generate using explicit positive and negative examples          | 05         |
| [07: Mobile and keyboard workflows](issues/07-mobile-and-keyboard.md)   | Complete both full workflows on mobile and by keyboard          | 04, 06     |

## Execution frontier

All seven approved core tickets are resolved on `codex/regex-integration`, including the requested stacked layout, scrollable desktop right preset sidebar, and tablet/mobile preset drawer. The final Standards and Spec reviews have no remaining findings. No deployment was performed. Live Groq generation still requires an owner-provided server credential; deterministic provider tests verify the integration without one.

## Optional drafts

- [08: Browser-local saved patterns](../../docs/ticket-drafts/08-local-saved-patterns.md).
- [09: JavaScript regex cheatsheet](../../docs/ticket-drafts/09-regex-cheatsheet.md).

These remain proposals and were not published as approved core tickets.

## Final verification

On 2026-10-14, the assembled integration passed 54 unit/API tests, 28 browser workflow tests, TypeScript, the local production build, Prettier, and CRLF checks. Standards review: 0 remaining findings. Spec review: 0 remaining findings; the lookbehind explanation defect was corrected with regression coverage. Updated desktop, mobile, and drawer screenshots are retained locally under ignored output/playwright. Live Groq verification remains unavailable without a credential. No deployment.
