# Prebuilt pattern catalogue

Status: confirmed by the user on 2026-10-14. The 20-preset catalogue and preset contents below are first-release requirements. This confirmation does not resume the separately paused application implementation.

## Selection basis

The list below is a practical first-release selection of common pattern tasks, not a measured ranking of regex usage. It draws on the pattern examples maintained by Regular-Expressions.info, the supported validators in validator.js, and the official Semantic Versioning specification. Inclusion in those sources supports usefulness and defined behavior; it does not establish a popularity order.

Sources:

- [Regular expression examples](https://www.regular-expressions.info/examples.html)
- [validator.js validator catalogue](https://github.com/validatorjs/validator.js#validators)
- [Semantic Versioning 2.0.0](https://semver.org/)
- [Email-pattern trade-offs](https://www.regular-expressions.info/email.html)

## Confirmed catalogue

| Category | Preset | Defined scope | Initial source |
| --- | --- | --- | --- |
| Everyday | Email address | Practical common email format; not every RFC-valid address and not proof of delivery | Exists |
| Everyday | HTTP/HTTPS URL | Extract links with an explicit scheme; not complete URL validation | Exists |
| Everyday | Domain name | ASCII DNS-style name; explicitly document subdomains, label limits, and internationalized-name handling | New |
| Everyday | US-style phone number | Seven- or ten-digit formatting; explicitly label its regional scope | Exists; rename clearly |
| Everyday | International phone format | E.164-shaped input with a leading plus and bounded digits; not country allocation or subscriber validation | New |
| Validation | Username | Starts with an ASCII letter, 3–20 characters, letters/digits/underscore | Exists |
| Validation | Password format | At least 8 non-whitespace characters with lowercase, uppercase, and a digit; not a strength assessment | Exists; label as format check |
| Validation | URL slug | Lowercase ASCII letters/digits with single hyphens between segments | Exists |
| Validation | ASCII alphanumeric | Nonempty input containing only ASCII letters and digits | New |
| Dates & numbers | ISO-style date | YYYY-MM-DD with basic month/day ranges; no full calendar validation | Exists |
| Dates & numbers | 24-hour time | HH:MM, hours 00–23 and minutes 00–59 | New |
| Dates & numbers | Integer | Optional minus sign followed by decimal digits; excludes decimals and exponents | New |
| Dates & numbers | Decimal number | Optional minus sign, digits, and an optional fractional part; excludes exponents and grouping commas | Exists |
| Developer | IPv4 address | Four octets from 0–255; exclude leading zeros | Exists |
| Developer | UUID v4 | Canonical hyphenated hexadecimal UUID with version-4 and RFC-variant bits | New |
| Developer | Hex color | #RGB or #RRGGBB; excludes alpha variants | Exists |
| Developer | Semantic version | SemVer 2.0.0 core, optional prerelease, and optional build metadata | New |
| Text | Whitespace runs | One or more whitespace characters, including tabs and newlines | New |
| Text | ASCII hashtag | # followed by explicitly documented ASCII letters/digits/underscore; not all social-platform or Unicode hashtag rules | New |
| Text | File extension | A filename ending in .jpg, .jpeg, .png, or .pdf, ignoring case; not MIME/content verification | New |

This retains the existing 10 starting points and adds 10 confirmed catalogue requirements. The new patterns have not yet been implemented.

## Confirmed preset contents

- Clear name, category, and format restrictions.
- Pattern and effective JavaScript flags.
- Default matching intent: extraction or whole-input validation, selected to suit the preset.
- Playground sample text.
- At least one positive and one negative example check.
- Plain-language explanation and limitations.
- Source attribution where a maintained specification or documented recipe informs the pattern.

## Correctness expectations

- Verify both positive and negative examples against the JavaScript testing engine before including a preset.
- In extraction mode, prevent accidental valid-looking fragments inside invalid larger tokens where the preset promises to find complete tokens.
- Distinguish format checks from external verification. Dates need calendar logic for real validity; phone numbers depend on numbering plans; email addresses need separate deliverability checks.
- Keep names regional and format-specific. Do not call a US-only recipe simply “Phone number” or imply one pattern covers every date format.
- Keep ordinary recipe choices in product documentation; no architecture decision record is needed for this reversible catalogue expansion.

## Deferred candidates

IPv6, country-specific postal codes, additional local phone formats, Base64, JWT shape, MAC addresses, and credit-card format checks can be considered after the first catalogue. These need more specific format decisions or validation beyond a simple regex. General HTML/XML parsing is not proposed as a regex preset.

## Confirmation record

The user answered “yes to both” to including the 20-preset first-release catalogue and including explanations, explicit limitations, matching intent, and positive/negative example checks with every preset.
