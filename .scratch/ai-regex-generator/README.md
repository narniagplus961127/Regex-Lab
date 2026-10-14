# AI Regex Generator tracker

The [specification](spec.md) is published. The user approved the seven core implementation tickets on 2026-10-14. Each has `ready-for-agent` triage status; dependency completion and permission to implement are separate from that status.

Application implementation remains paused. The proposed provider/stack choices remain identified as proposals in the specification. Tickets 08 and 09 are optional drafts outside the approved core release.

## Approved core tickets

| Ticket                                                                  | Deliverable                                                     | Blocked by                      |
| ----------------------------------------------------------------------- | --------------------------------------------------------------- | ------------------------------- |
| [01: Live playground](issues/01-live-playground.md)                     | Edit and safely test a pattern live                             | None                            |
| [02: Validation and checks](issues/02-validation-and-checks.md)         | Validate entire inputs, inspect captures, and evaluate examples | 01                              |
| [03: Explanation and copy](issues/03-explanation-and-copy.md)           | Understand and export the current pattern consistently          | 02                              |
| [04: Twenty presets](issues/04-twenty-presets.md)                       | Search and load all 20 complete preset examples                 | 03                              |
| [05: AI generation](issues/05-ai-generation.md)                         | Generate a pattern from a description through a real provider   | 03; provider/stack confirmation |
| [06: Example-guided generation](issues/06-example-guided-generation.md) | Generate using explicit positive and negative examples          | 05                              |
| [07: Mobile and keyboard workflows](issues/07-mobile-and-keyboard.md)   | Complete both full workflows on mobile and by keyboard          | 04, 06                          |

## Execution frontier

When implementation is resumed, ticket 01 is the first ticket with no blocking ticket. Tickets 04 and 05 can proceed independently after 03 is complete. Work only tickets whose blockers are satisfied and whose applicable choices have been confirmed.

## Optional drafts

- [08: Browser-local saved patterns](../../docs/ticket-drafts/08-local-saved-patterns.md).
- [09: JavaScript regex cheatsheet](../../docs/ticket-drafts/09-regex-cheatsheet.md).

These remain proposals and were not published as approved core tickets.
