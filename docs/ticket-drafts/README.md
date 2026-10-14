# Regex Generator ticket breakdown

Status: core tickets 01–07 approved and published on 2026-10-14 to the [local tracker](../../.scratch/ai-regex-generator/README.md). Tickets 08–09 remain optional drafts. Application implementation remains paused.

Source: the [published AI Regex Generator and Playground specification](../../.scratch/ai-regex-generator/spec.md), including the confirmed 20-preset catalogue. The existing source is incomplete and unverified; tickets finish the required behavior rather than assuming scaffolded controls work.

## Approved core sequence and optional drafts

| Ticket | Title                                                   | Blocked by                      | Demoable result                                                                                                                  |
| ------ | ------------------------------------------------------- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| 01     | Edit and safely test a pattern live                     | None                            | A runnable workbench highlights matches as a visitor edits a pattern, flags, or test text; invalid and slow patterns are handled |
| 02     | Validate inputs and inspect example checks and captures | 01                              | A visitor can switch matching intent, inspect captures, and check positive/negative examples against the current pattern         |
| 03     | Understand and copy the current pattern                 | 02                              | A visitor sees a current explanation and can copy a regex or JavaScript snippet with equivalent behavior                         |
| 04     | Explore and load all 20 presets                         | 03                              | A searchable, categorized catalogue loads each preset's complete workspace, including explanations and checks                    |
| 05     | Generate a pattern from a description                   | 03                              | A description travels through a real server-side AI request and returns a pattern and explanation into the playground            |
| 06     | Generate using positive and negative examples           | 05                              | Explicit examples guide the AI and the resulting pattern is visibly checked against them                                         |
| 07     | Complete the workflow on mobile and by keyboard         | 04, 06                          | Visitors can complete preset and AI workflows at narrow widths and with a keyboard                                               |
| 08     | Save and reopen patterns in this browser                | 03; optional scope confirmation | A visitor names, saves, reopens, and deletes patterns without an account                                                         |
| 09     | Consult a JavaScript regex cheatsheet                   | 01; optional scope confirmation | A visitor can look up syntax and return to an intact playground                                                                  |

## Blocking edges

- Ticket 03 follows 02 because exported validation behavior and explanations must incorporate the settled matching-intent behavior.
- Tickets 04 and 05 can proceed independently once 03 is complete. The preset library does not require AI, and AI generation does not require all 20 presets.
- Ticket 06 follows 05 because example-guided generation extends the existing real generation workflow. Local example checks are already provided by 02 through the dependency chain.
- Ticket 07 follows both 04 and 06 because it verifies and completes navigation through the full first-release workflows. Earlier tickets must still provide basic responsive and keyboard-usable controls.
- Optional saving does not gate core generation, testing, the preset library, or the cheatsheet. The cheatsheet does not depend on AI or local saving.
- There is no wide refactor requiring a separate prefactoring ticket. Small organization changes belong inside the first slice that needs them and must preserve completed behavior.

## Non-ticket prerequisites

- Application implementation remains paused until the user resumes it.
- The stack is proposed as Next.js/React/TypeScript with Vercel and Groq through the AI SDK; this remains pending consolidated confirmation. Ticket approval does not silently establish the provider choice or hosting suitability.
- Real-provider verification requires a configured server-side key. It does not require publishing or deploying the site as part of these tickets.
- The browser-level testing approach is proposed in the specification; acceptance checks should observe user behavior, with narrow evaluation tests for difficult engine edge cases and controlled AI responses only in tests.
- Local Markdown tracker setup is complete. The seven approved core tickets have been published in dependency order with ready-for-agent status and textual blocking references. The local tracker now holds their authoritative contents.
- Tickets 08 and 09 stay outside the required release until their optional scope is confirmed. Do not publish them as committed first-release requirements merely because they are drafted.

## Approval record

The user answered “Approved” after the recommendation to publish tickets 01–07 and preserve tickets 08–09 as optional drafts. The approval covers ticket publication and the core breakdown. It does not resume implementation, approve deployment, or include the two optional features.
