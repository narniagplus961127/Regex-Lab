# AI Regex Generator and Playground

Status: ready-for-agent

Published: 2026-10-14

Implementation: paused pending the user's instruction to resume. Core behavior and all 20 presets are confirmed. The stack, optional saved patterns and cheatsheet, and testing approach remain proposals; publication does not approve those choices or authorize implementation/deployment.

## Problem Statement

Beginners and developers need to find or validate text patterns, but regular-expression syntax is difficult to write and understand. A pattern that looks correct can still match unwanted text, miss valid input, or behave differently when copied into code. Users need a single place to describe what they want, obtain a pattern, test their own text, understand the result, and copy it with confidence.

## Solution

Provide a responsive web app with an AI generator beside an editable JavaScript regex playground. Users start with a plain-language description or a prebuilt preset, edit the resulting pattern, and enter their own test text. The playground updates matches, highlights, capture groups, and example checks as inputs change.

The first release includes 20 categorized presets. Selecting one loads its pattern, effective flags, matching intent, explanation, playground sample, and positive/negative example checks together. Every preset states its supported format and limitations so that users know what it checks.

Users can choose between finding matches within text and validating the entire input. Explanations use approachable language, with a technical pattern breakdown available for deeper inspection. Users can copy both a regex and a JavaScript usage snippet that retain the selected matching behavior.

The app requires no visitor account. The owner configures the AI key on the server. Test text stays in the browser; only the description and explicitly supplied example checks are sent for AI generation. Presets and local testing remain available when AI is not configured or is temporarily unavailable.

The confirmed visual direction is a dark developer workbench with readable monospace patterns and clear match highlights. The generator and playground appear together on desktop and stack on mobile.

## User Stories

1. As a beginner, I want to describe the text I need to match in plain language, so that I can create a pattern without already knowing regex syntax.
2. As a developer, I want the generated pattern to use JavaScript regex syntax, so that its behavior matches the app's testing engine.
3. As a visitor, I want to use the app without signing in, so that I can start immediately.
4. As a visitor, I want to choose a preset for a common format, so that I do not need to start from a blank pattern.
5. As a visitor, I want to search a categorized library of 20 presets, so that I can find a useful starting point quickly.
6. As a visitor, I want each preset to include sample test text, a matching intent, explanations, limitations, and positive/negative example checks, so that I can see its intended behavior and limits.
7. As a visitor, I want to edit a preset or generated pattern directly, so that I can adapt it to my requirements.
8. As a visitor, I want an editable playground for my own test text, so that I can check the current pattern against realistic input.
9. As a visitor, I want testing to update when I edit the pattern, flags, matching intent, or test text, so that I receive immediate feedback.
10. As a visitor, I want matches highlighted in the playground, so that I can see which text the pattern selects.
11. As a visitor, I want a match count, so that I can notice missing or unexpected matches.
12. As a visitor, I want a clear no-match result, so that I can distinguish a valid pattern with no matches from an invalid pattern.
13. As a developer, I want to inspect each match and its position, so that I can understand what the pattern extracted.
14. As a developer, I want to inspect numbered and named capture groups, so that I can verify extracted values.
15. As a developer, I want empty matches and unmatched optional groups represented clearly, so that I do not mistake them for missing results.
16. As a visitor, I want to select find-matches mode, so that I can extract portions of a larger text.
17. As a visitor, I want to select whole-input validation mode, so that a partial match does not incorrectly validate my input.
18. As a developer, I want global, ignore-case, multiline, dot-all, and Unicode controls, so that I can adjust JavaScript matching behavior.
19. As a visitor, I want to understand what each flag does, so that I can choose it deliberately.
20. As a visitor, I want to supply examples that should match, so that the AI understands acceptable input.
21. As a visitor, I want to supply examples that should not match, so that the AI understands unacceptable input.
22. As a visitor, I want to see the result of each example check against the current pattern, so that I can judge the result myself.
23. As a visitor, I want example checks to update after manual edits, so that changes do not silently break expected behavior.
24. As a visitor, I want to test empty input as an example, so that optional or empty matches can be verified.
25. As a beginner, I want a plain-language explanation, so that I understand what a preset or generated pattern is intended to do.
26. As a developer, I want a technical breakdown of pattern elements, so that I can inspect the syntax in more detail.
27. As a visitor, I want outdated explanations identified or replaced after edits, so that I do not rely on an explanation for a different pattern.
28. As a visitor, I want limitations of presets and AI results stated clearly, so that I do not assume an email, date, or password pattern guarantees real-world validity.
29. As a visitor, I want to copy a regex with its effective flags and matching boundaries, so that it behaves consistently outside the playground.
30. As a developer, I want to copy a JavaScript usage snippet, so that I can integrate finding or validation behavior correctly.
31. As a visitor, I want feedback when copying succeeds or fails, so that I know whether the clipboard action worked.
32. As a visitor, I want useful errors for invalid patterns, so that I can correct syntax mistakes.
33. As a visitor, I want slow patterns stopped without freezing the interface, so that I can continue editing.
34. As a visitor, I want long inputs and very large match results handled predictably, so that the app remains responsive.
35. As a visitor, I want a loading state during generation, so that I know the request is in progress.
36. As a visitor, I want helpful generation errors for unavailable AI, exhausted quotas, timeouts, or failed requests, so that I know what to do next.
37. As a visitor, I want presets and the playground to remain usable when AI is unavailable, so that the tool remains useful.
38. As a visitor, I want to know which information is sent to AI before generating, so that I can choose what to share.
39. As a visitor, I want live playground text to stay local, so that testing does not send it to the AI provider.
40. As a keyboard user, I want accessible inputs, tabs, buttons, and dialogs, so that I can complete the workflow without a mouse.
41. As a mobile visitor, I want a responsive layout with usable editors and controls, so that I can test patterns on a smaller screen.
42. As an app owner, I want to configure the AI key server-side, so that visitors do not need their own key and cannot retrieve mine from browser assets.
43. As an app owner, I want setup guidance when the AI key is missing, so that I can enable generation correctly.
44. As an app owner, I want bounded requests and basic usage limits, so that accidental or repeated requests do not consume the entire quota immediately.
45. As an app owner, I want the hosting and AI choices documented with their free-tier restrictions, so that I can decide whether they suit the intended use.

The following supporting stories are proposed extras and await consolidated scope confirmation:

46. As a visitor, I want to name and save a pattern locally, so that I can return to it in the same browser without an account.
47. As a visitor, I want to reopen or delete saved patterns, so that I can maintain my collection.
48. As a visitor, I want storage errors handled without losing access to the playground, so that I can still copy my pattern when local saving fails.
49. As a beginner, I want a compact JavaScript regex cheatsheet, so that I can learn common syntax while editing.

## Implementation Decisions

### Confirmed product decisions

- The first release is a responsive web app for beginners and developers, without visitor authentication.
- The preset library includes the 20 entries defined in the catalogue below.
- Every preset includes a category, pattern, JavaScript flags, default matching intent, playground sample, explanation, explicit limitations, and at least one positive and one negative example check. Selecting it loads its pattern and settings, sample test text, explanation, and example checks together. Preset names state regional and format restrictions where applicable.
- JavaScript is the only regex dialect in scope. Generated patterns, presets, tests, flags, and exported snippets must be consistent with that dialect.
- A description and explicit positive/negative examples guide generation. Playground test text is a separate input and is never automatically included in a generation request.
- The owner supplies a server-side AI credential; visitors do not enter credentials.
- Matching intent is explicit. Find-matches mode locates substrings; whole-input validation succeeds only when every input character belongs to the match.
- The supported flags are global, ignore case, multiline, dot-all, and Unicode. Whole-input validation ignores global iteration and communicates that behavior.
- Example checks use the current matching intent and flags. Validation checks must reject partial matches, including multiline and trailing-newline edge cases.
- Explanations belong to a specific pattern and effective settings. Manual changes must not leave an old semantic explanation presented as current.
- Copying preserves the effective behavior, including whole-input boundaries. Regex delimiters, literal slashes, backslashes, and newlines must be serialized correctly.
- Invalid patterns, no matches, testing in progress, and successful matches are distinct user-visible states.
- AI output is a proposed pattern, not a correctness guarantee. Syntax validation and visible example checks are required before presenting the result as usable.
- The desktop layout places generation beside testing. Mobile stacks the work areas. The theme is dark, with monospace pattern text and bright match highlighting.

### Confirmed preset catalogue

| Category | Preset | Intended format and limits |
| --- | --- | --- |
| Everyday | Email address | Practical common email format; not all RFC-valid formats or delivery verification |
| Everyday | HTTP/HTTPS URL | Links with an explicit HTTP or HTTPS scheme; extraction does not establish URL validity |
| Everyday | Domain name | ASCII DNS-style names, with supported subdomains, label limits, and internationalized-name behavior documented |
| Everyday | US-style phone number | Seven- or ten-digit US-style formatting, with regional scope stated |
| Everyday | International phone format | E.164-shaped digits with a leading plus; not numbering-plan or subscriber verification |
| Validation | Username | 3–20 ASCII letters/digits/underscores, starting with a letter |
| Validation | Password format | At least 8 non-whitespace characters, including lowercase, uppercase, and a digit; not a strength assessment |
| Validation | URL slug | Lowercase ASCII letters/digits with single hyphens between segments |
| Validation | ASCII alphanumeric | Nonempty input made of ASCII letters and digits |
| Dates & numbers | ISO-style date | YYYY-MM-DD with basic month/day ranges; calendar validity is separate |
| Dates & numbers | 24-hour time | HH:MM, hours 00–23 and minutes 00–59 |
| Dates & numbers | Integer | Optional minus sign and decimal digits; no decimal fraction or exponent |
| Dates & numbers | Decimal number | Optional minus sign and fraction; no exponent or grouping commas |
| Developer | IPv4 address | Four octets from 0–255, excluding leading zeros |
| Developer | UUID v4 | Canonical hyphenated hexadecimal form with version-4 and RFC-variant bits |
| Developer | Hex color | #RGB or #RRGGBB, excluding alpha variants |
| Developer | Semantic version | SemVer 2.0.0, including optional prerelease and build metadata |
| Text | Whitespace runs | One or more whitespace characters, including tabs and newlines |
| Text | ASCII hashtag | A # and documented ASCII letters/digits/underscore; not universal social-platform or Unicode rules |
| Text | File extension | Filename ending in .jpg, .jpeg, .png, or .pdf, ignoring case; not MIME/content verification |

Each preset must include its required explanation, limitations, matching intent, and example checks. Library search must make its name and description discoverable. Matching intent defaults must suit the preset and remain visible and editable.

The catalogue is a practical selection rather than a measured popularity ranking. Supporting sources: [validator.js catalogue](https://github.com/validatorjs/validator.js#validators), [regular expression examples](https://www.regular-expressions.info/examples.html), and [Semantic Versioning](https://semver.org/).

### Proposed technical approach

These choices have been discussed and partially scaffolded, but the user requested a consolidated requirements review before further implementation. They remain proposals rather than newly confirmed requirements.

- Use Next.js, React, and TypeScript, with Vercel hosting and Groq accessed through the Vercel AI SDK. The user suggested Vercel and Groq as affordable options and allowed alternatives.
- Do not require a database for the core workflow. If approved, saved patterns use browser-local storage without cross-device synchronization.
- Separate responsibilities into generation, local pattern evaluation, preset definitions, explanations/export, and the playground interface. Prefer the existing pattern-evaluation boundary rather than creating redundant engines.
- A server generation interface accepts a description, matching intent, supported flags, and explicit examples. A successful response supplies a JavaScript pattern, effective flags, explanation, and relevant limitations. Failures return actionable errors without exposing credentials or provider internals.
- Keep all AI calls on the server. Do not expose private credentials through public environment variables, browser requests, bundles, or logs.
- Local evaluation produces matches, match positions, capture-group values, example-check results, and evaluation status. Run it in an isolated browser worker that can be terminated.
- Cancel obsolete local tests when inputs change so earlier results cannot overwrite newer inputs. Bound zero-length match iteration and Unicode advancement.
- The initial source uses a 1.5-second testing deadline, a 2,000-character pattern limit, a 30,000-character playground limit, up to 20 examples of 1,000 characters, and up to 500 displayed matches. These are initial guardrails to validate during implementation, not separately agreed product requirements.
- Bound generation input and output sizes, validate response structure, validate returned JavaScript syntax, and handle provider rate limits, errors, and timeouts explicitly.
- Apply basic request limits. An in-memory limit is per running instance and must not be described as a deployment-wide guarantee. Shared rate limiting can be configured if required; it is not a mandatory paid service for the first version.
- Keep the selected Groq model configurable and verify current model availability before deployment. Do not assume free tiers provide unlimited usage.

## Testing Decisions

### Proposed primary test seam

Use the browser-visible user workflow as the primary acceptance seam: describe or load a pattern, edit it, enter test text, inspect results and explanation, and copy it. Test externally observable results rather than React state, worker implementation, CSS class names, or component structure.

This seam is proposed for the user's confirmation; it was not previously discussed as an agreed testing decision.

- Exercise preset loading, manual editing, flags, whole-input validation, match highlighting, capture groups, example checks, copy/export behavior, invalid-pattern errors, and responsive keyboard interaction through the interface.
- At the external AI boundary, use deterministic provider responses for repeatable tests of request contents, successful generation, invalid output, rate-limit errors, missing configuration, and timeouts. Such fixtures are test-only; production must call the real configured provider and never silently substitute a fake generator.
- Confirm through request inspection that playground text is excluded from generation requests. Confirm credentials are absent from client responses and assets.
- Check copied regex and JavaScript against the same inputs used in the playground, including literal slashes, newlines, escaped characters, and validation-mode boundaries.
- Include tricky observable cases: zero-length global matches, Unicode characters, optional and named groups, no matches, trailing newlines, multiline boundaries, and a pattern that would otherwise run too long.
- Confirm failed example checks remain visible even when the regex is syntactically valid. Do not require an exact AI-generated string when multiple patterns satisfy the same behavior.
- Check all 20 presets through the same workflow. Each must compile as JavaScript, load its effective settings and sample text, and pass at least one positive and one negative example check. Test catalogue examples against their documented matching intent rather than assuming every preset validates whole input.
- Verify complete-token extraction where promised: an invalid larger token must not appear valid merely because an internal fragment matches. Cover out-of-range IPv4 octets, wrong UUID versions, out-of-range time fields, unsupported phone formats, and unsupported file extensions.
- Verify limitations in the displayed explanation agree with the pattern: basic date checks must not claim calendar validation, and email, phone, password, and file-extension recipes must not imply delivery, allocation, security, or file-content verification.
- If saved patterns are approved, verify saving, reopening, deleting, reload persistence, and unavailable or corrupt browser storage.
- Add narrow tests at the existing local-evaluation boundary only when they give reliable coverage of engine edge cases that are difficult to diagnose through the browser. Do not add a separate test seam for every visual component.
- Perform a small real-provider smoke check with a configured key before claiming AI generation works end to end. If credentials are unavailable, report that verification limit explicitly.

### Existing test foundation

The project contains initial evaluation logic, presets, a worker entry point, and interface source. Vitest is installed, but there are no existing tests or operational test scripts. There is no established test prior art to reuse. The frontend stylesheet and server generation handler are not yet present, and the app has not been verified as runnable.

## Out of Scope

- Visitor accounts, authentication, cloud synchronization, and collaboration.
- Regex dialects other than JavaScript and usage snippets for other programming languages.
- Conversational AI refinement or automatic multi-step repair loops.
- Proof that a pattern is universally correct, that an email address exists, that a URL is reachable, or that a password is secure.
- Automatically sending playground text to AI, logging its contents, or using it as a hidden generation example.
- Guaranteed deployment-wide quotas using only an in-memory limiter.
- A mandatory paid database or paid infrastructure for the core first release.
- Production deployment, account provisioning, and credential configuration as part of this specification-writing task.

## Further Notes

- The user confirmed all 20 presets and their required explanations, limitations, matching intent, and positive/negative example checks on 2026-10-14. The catalogue is incorporated into this specification. The expanded implementation is still pending.
- Core requirements were confirmed across several interview rounds. The proposed stack, local saving, and cheatsheet remain pending consolidated confirmation after the user asked to review requirements before further building.
- Existing source is an incomplete scaffold, not a finished application or evidence that any user story passes. Continue from it only after implementation is authorized again.
- Vercel Hobby is intended for personal, non-commercial use and has usage limits. Groq's free tier has model-specific and organization-level request/token limits. Availability and suitability must be rechecked before deployment. Sources: [Vercel Hobby](https://vercel.com/docs/plans/hobby) and [Groq rate limits](https://console.groq.com/docs/rate-limits).
- The configured issue tracker is local Markdown under `.scratch/`, with the five default triage statuses. Setup was approved and applied on 2026-10-14. Specifications publish under the feature directory; implementation tickets publish as separate numbered files after breakdown approval. The GitHub remote is not the configured issue tracker.
- Publishing a specification does not by itself resume the paused implementation or authorize deployment.
