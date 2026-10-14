# 06: Generate using positive and negative examples

**What to build:** A visitor adds examples that should match or fail, submits them explicitly with a description, and receives a generated pattern whose behavior is immediately checked against those same examples in the playground.

**Blocked by:** 05 — Generate a pattern from a description.

**Status:** ready-for-agent

- [ ] Generation includes explicit example text and expected outcomes together with the description, current matching intent, and flags.
- [ ] Playground test text remains excluded from generation requests; examples are clearly identified as inputs sent to AI.
- [ ] Limits and validation apply to example counts, text lengths, and expected-outcome values, including empty example text.
- [ ] When a generated pattern is applied, current positive and negative examples are re-evaluated locally and visible results reflect the returned effective flags and intent.
- [ ] A syntactically valid result with failing example checks remains visibly failing rather than being presented as verified correct.
- [ ] Visitors can revise examples or the description and generate again without losing playground text.
- [ ] Negative examples and matching intent guide the AI instructions; no automatic repair conversation or hidden regeneration loop is introduced.
- [ ] Behavior-focused checks cover request contents, positive/negative outcomes, empty examples, invalid example requests, partial-match versus validation behavior, and failed checks after an AI response.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
