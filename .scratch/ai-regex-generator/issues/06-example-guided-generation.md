# 06: Generate using positive and negative examples

**What to build:** A visitor adds examples that should match or fail, submits them explicitly with a description, and receives a generated pattern whose behavior is immediately checked against those same examples in the playground.

**Blocked by:** 05 — Generate a pattern from a description.

**Status:** ready-for-agent

**Resolution:** resolved

- [x] Generation includes explicit example text and expected outcomes together with the description, current matching intent, and flags.
- [x] Playground test text remains excluded from generation requests; examples are clearly identified as inputs sent to AI.
- [x] Limits and validation apply to example counts, text lengths, and expected-outcome values, including empty example text.
- [x] When a generated pattern is applied, current positive and negative examples are re-evaluated locally and visible results reflect the returned effective flags and intent.
- [x] A syntactically valid result with failing example checks remains visibly failing rather than being presented as verified correct.
- [x] Visitors can revise examples or the description and generate again without losing playground text.
- [x] Negative examples and matching intent guide the AI instructions; no automatic repair conversation or hidden regeneration loop is introduced.
- [x] Behavior-focused checks cover request contents, positive/negative outcomes, empty examples, invalid example requests, partial-match versus validation behavior, and failed checks after an AI response.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

## Resolution evidence

Implemented on 2026-10-14. Generate submits the current explicit example checks as text/boolean outcomes with the description, matching intent, and flags; UI IDs and playground text are excluded. The route strictly bounds 20 examples of 1,000 characters including empty text, rejects malformed outcomes, and reads a capped 140,000-byte stream independent of Content-Length. Provider instructions distinguish partial matching from whole-input validation and negative expectations, with no repair loop. Generated patterns are applied using the returned effective flags and submitted intent, and current examples re-evaluate locally with visible failing checks. Description/example edits and playground text survive subsequent generation.

Validation: red-to-green public route and browser tests; all 51 unit tests and all 21 Chromium browser workflows passed; typecheck, production build, Prettier and CRLF checks passed. Browser selectors now distinguish generator status from local playground status. Browser configs default to one worker to protect cold-dev-server and regex-worker timing. Real AI SDK/Groq transport is exercised with deterministic external-boundary fixtures. No credential was available for a live Groq smoke test; no deployment was performed.
