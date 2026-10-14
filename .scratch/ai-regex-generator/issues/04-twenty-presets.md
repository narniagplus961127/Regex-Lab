# 04: Explore and load all 20 presets

**What to build:** A visitor searches and browses a categorized library of 20 presets and opens any preset as a complete playground setup, with its explanation, limits, sample text, effective settings, and passing positive/negative example checks.

**Blocked by:** 03 — Understand and copy the current pattern.

**Status:** ready-for-agent

- [ ] The catalogue contains email, HTTP/HTTPS URL, domain, US-style phone, international phone format, username, password format, URL slug, ASCII alphanumeric, ISO-style date, 24-hour time, integer, decimal number, IPv4, UUID v4, hex color, semantic version, whitespace runs, ASCII hashtag, and file extension.
- [ ] Presets are grouped into Everyday, Validation, Dates & numbers, Developer, and Text; name and description are searchable.
- [ ] No-search-results feedback and resetting filters work.
- [ ] Selecting any preset loads its pattern, flags, intent, sample text, explanation, limitations, and at least one positive and one negative example check together.
- [ ] Every preset compiles in JavaScript and passes its supplied example checks under its default matching intent.
- [ ] Regional and format-specific names are explicit, including US-style phone, UUID v4, ASCII patterns, and password format.
- [ ] Each pattern respects the intended format recorded in the specification, including octet/time ranges, UUID version and variant, and supported file extensions.
- [ ] Where a preset promises complete-token extraction, it does not silently accept an internal valid-looking fragment of an invalid larger token.
- [ ] Date explanations distinguish format from calendar validity. Email, phone, password, URL, and file-extension explanations state relevant verification limits.
- [ ] Visitors can edit a loaded preset and receive updated matches, checks, explanations, and copy output.
- [ ] The complete library remains usable without AI configuration. Behavior-focused checks cover all 20 entries and the selection/search workflow.

## Comments

Published on 2026-10-14 after approval of the seven core tickets. Implementation remains paused; publication does not authorize implementation or deployment.
