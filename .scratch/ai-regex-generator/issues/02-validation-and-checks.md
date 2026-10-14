# 02: Validate inputs and inspect example checks and captures

**What to build:** A visitor chooses whether to find text fragments or validate an entire input, inspects match positions and captured values, and adds examples that should match or fail. Results remain consistent as the current pattern changes.

**Blocked by:** 01 — Edit and safely test a pattern live.

**Status:** ready-for-agent

- [ ] A visible matching-intent control switches between finding matches and whole-input validation.
- [ ] Whole-input validation succeeds only when the entire input matches; internal fragments, multiline starts, and unintended trailing newlines cannot cause false success.
- [ ] Global iteration is ignored in validation mode and the interface communicates this behavior.
- [ ] Each match exposes its text, position, numbered captures, and named captures, where present.
- [ ] Empty captures and unmatched optional captures are distinguishable.
- [ ] Visitors can add, edit, and remove positive and negative example checks, including empty input.
- [ ] Each example displays its expected and actual outcome, with a passing/failing summary for the current pattern, flags, and intent.
- [ ] Example results update after manual edits; syntax failures or pending evaluation are not presented as successful checks.
- [ ] Example evaluation uses the same protected local-testing workflow as playground evaluation.
- [ ] Behavior-focused checks cover partial matches, alternation, multiline and trailing-newline boundaries, capture groups, and examples that change from passing to failing after edits.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
