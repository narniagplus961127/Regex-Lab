# 04: Explore and load all 20 presets

**What to build:** A visitor searches and browses a categorized library of 20 presets and opens any preset as a complete playground setup, with its explanation, limits, sample text, effective settings, and passing positive/negative example checks.

**Blocked by:** 03 — Understand and copy the current pattern.

**Status:** ready-for-agent

**Resolution:** resolved

- [x] The catalogue contains email, HTTP/HTTPS URL, domain, US-style phone, international phone format, username, password format, URL slug, ASCII alphanumeric, ISO-style date, 24-hour time, integer, decimal number, IPv4, UUID v4, hex color, semantic version, whitespace runs, ASCII hashtag, and file extension.
- [x] Presets are grouped into Everyday, Validation, Dates & numbers, Developer, and Text; name and description are searchable.
- [x] No-search-results feedback and resetting filters work.
- [x] Selecting any preset loads its pattern, flags, intent, sample text, explanation, limitations, and at least one positive and one negative example check together.
- [x] Every preset compiles in JavaScript and passes its supplied example checks under its default matching intent.
- [x] Regional and format-specific names are explicit, including US-style phone, UUID v4, ASCII patterns, and password format.
- [x] Each pattern respects the intended format recorded in the specification, including octet/time ranges, UUID version and variant, and supported file extensions.
- [x] Where a preset promises complete-token extraction, it does not silently accept an internal valid-looking fragment of an invalid larger token.
- [x] Date explanations distinguish format from calendar validity. Email, phone, password, URL, and file-extension explanations state relevant verification limits.
- [x] Visitors can edit a loaded preset and receive updated matches, checks, explanations, and copy output.
- [x] The complete library remains usable without AI configuration. Behavior-focused checks cover all 20 entries and the selection/search workflow.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.

Implemented on 2026-10-14. The searchable five-category library loads all 20 recipes into the current playground, including effective flags, matching intent, sample text, examples, explanations, and limitations. A sidebar jump link makes the library discoverable without discarding current work. Search/category combination, empty results, and resetting filters are covered. Numeric/UUID/time/token edge cases use independent literal examples; SemVer follows the official 2.0.0 grammar at https://semver.org/.

TDD evidence: the first browser tracer failed because the library was absent, then passed after the complete load/search workflow was implemented. A second tracer failed for absent navigation; it exposed a missing target ID and passed after correction. All 20 entries passed independent evaluator scope checks and a browser loop asserting each sample, intent, limits, passing positive/negative checks, and enabled export. Existing playground/validation/export browser workflows remained green.

Validation: 42 unit tests passed. In the 16-test browser regression run, 15 passed and the navigation target failure was repaired and verified by its focused rerun. TypeScript, production build, Prettier, and authored-file CRLF checks passed. No deployment. Saved patterns and cheatsheet remain excluded.
