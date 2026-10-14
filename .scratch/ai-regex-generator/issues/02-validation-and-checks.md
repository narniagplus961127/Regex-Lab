# 02: Validate inputs and inspect example checks and captures

**What to build:** A visitor chooses whether to find text fragments or validate an entire input, inspects match positions and captured values, and adds examples that should match or fail. Results remain consistent as the current pattern changes.

**Blocked by:** 01 — Edit and safely test a pattern live.

**Status:** ready-for-agent

**Resolution:** resolved

- [x] A visible matching-intent control switches between finding matches and whole-input validation.
- [x] Whole-input validation succeeds only when the entire input matches; internal fragments, multiline starts, and unintended trailing newlines cannot cause false success.
- [x] Global iteration is ignored in validation mode and the interface communicates this behavior.
- [x] Each match exposes its text, position, numbered captures, and named captures, where present.
- [x] Empty captures and unmatched optional captures are distinguishable.
- [x] Visitors can add, edit, and remove positive and negative example checks, including empty input.
- [x] Each example displays its expected and actual outcome, with a passing/failing summary for the current pattern, flags, and intent.
- [x] Example results update after manual edits; syntax failures or pending evaluation are not presented as successful checks.
- [x] Example evaluation uses the same protected local-testing workflow as playground evaluation.
- [x] Behavior-focused checks cover partial matches, alternation, multiline and trailing-newline boundaries, capture groups, and examples that change from passing to failing after edits.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

### 2026-10-14 — Implementation evidence

Added visible matching-intent controls, match positions and numbered/named capture inspection, and editable positive/negative example checks including empty inputs. Pending, invalid and timed-out evaluations never display successful checks. Playground and example checks use the same isolated worker and deadline. Existing evaluateRegex boundary behavior is covered by strict whole-input edge cases and capture regressions.

Three browser behavior slices were observed failing before their UI implementations, then passed. Verification: 10 evaluateRegex tests, 10 complete browser tests (including example timeout/recovery), TypeScript and production build passed. Prettier and CRLF checks passed. React component review confirms split responsibilities, labelled controls, keyboard focus and derived evaluation state. Added Next.js allowedDevOrigins for documented IPv4 local development and browser-test connectivity.
