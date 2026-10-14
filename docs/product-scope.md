# Product scope

## Confirmed decisions

- Responsive web app for beginners and developers.
- No sign-in required.
- Generate and test JavaScript regular expressions in the first version.
- Plain-language descriptions and prebuilt presets are starting points for patterns.
- Users can copy patterns and read their explanations.
- First-version additions: live match highlighting, capture group viewing, example-driven generation, flag controls, and helpful invalid-pattern errors.
- Simple explanations with optional technical detail.
- A categorized library of 20 presets, as defined in the confirmed preset catalogue.
- Every preset includes an explanation, limitations, matching intent, and positive/negative example checks. Loading a preset populates both the playground sample and its example checks.

## Confirmed behavior

- The AI key is configured server-side by the app owner; visitors do not provide keys.
- AI receives the description and explicit example checks. Live playground text stays in the browser.
- Users choose between finding matches and validating the entire input.
- Users can add positive and negative examples and see which checks pass.
- An editable playground accepts test text and updates matches as the pattern or text changes.
- The generator sits beside the playground on desktop; the layout stacks on mobile.
- Dark developer-tool styling with monospace regex and bright match highlights.
- User approved beginning implementation on 2026-10-14, then requested a consolidated requirements review before continuing.

## Proposed first-release acceptance criteria

1. A visitor can describe a pattern and generate a JavaScript regex with an explanation when the owner has configured a valid AI key.
2. The owner sees actionable setup instructions when AI is not configured. Presets and testing remain usable.
3. A visitor can select a searchable preset, edit its pattern, and test their own text.
4. Testing highlights matches and reports match counts and captured groups. Invalid patterns show helpful errors.
5. Whole-input validation rejects inputs that only partially match. Copied regex and code retain that behavior.
6. Positive and negative examples are checked locally; failed checks are visible. AI output is never presented as guaranteed correct.
7. Supported flag controls include global, ignore case, multiline, dot-all, and Unicode.
8. A visitor can copy a regex or JavaScript usage snippet, with success or failure feedback.
9. Slow patterns run in an isolated browser worker with a deadline so the interface stays usable.
10. The interface supports keyboard interaction and adapts to desktop and mobile screens.
11. The AI endpoint validates request sizes and applies basic usage limits.

## Supporting features proposed for inclusion

- Browser-local saved patterns, without accounts or cloud synchronization.
- A compact JavaScript regex cheatsheet.

## Proposed stack — awaiting consolidated confirmation

- Next.js, React, and TypeScript.
- Vercel hosting, subject to Hobby's personal/non-commercial restrictions and usage limits.
- Groq through the Vercel AI SDK. A server-side GROQ_API_KEY is required.
- No required database for the first release.
- A basic per-instance rate limiter; optional shared Redis REST configuration for stronger limits across server instances.

## Deferred

- Accounts, cloud synchronization, and collaboration.
- Other regex engines or language dialects.
- Automatic AI refinement conversations.
- Production deployment and credential provisioning until configured and explicitly requested.

## Current implementation state

Initial source files exist for the UI, presets, and local matching worker. The implementation is incomplete and has not been verified or deployed. Further implementation is paused for the user's consolidated requirements confirmation.
