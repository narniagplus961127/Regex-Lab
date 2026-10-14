# Issue tracker: Local Markdown

Issues and specifications for this repo live as Markdown files in `.scratch/`.

## Conventions

- One feature per directory: `.scratch/<feature-slug>/`.
- The specification is `.scratch/<feature-slug>/spec.md`.
- Implementation issues are one file per ticket at `.scratch/<feature-slug>/issues/<NN>-<slug>.md`, numbered from `01` in dependency order, with blockers first.
- Triage state is recorded as a `Status:` line near the top of each issue. Use the role strings in `docs/agents/triage-labels.md`.
- Each implementation issue records its `Blocked by:` ticket numbers and titles, or `None`.
- Comments and conversation history append under a `## Comments` heading at the bottom of the file.

## Publish and fetch

When a skill says to publish to the issue tracker, create or update the appropriate local file. When the user references an issue or specification, read that file and its comments.

Only publish a ticket breakdown after the approval required by the invoked ticket skill. Tracker publication alone does not authorize implementation or deployment.

## Wayfinding operations

- Map: `.scratch/<effort>/map.md`, containing Notes, Decisions-so-far, and Fog.
- Child tickets: `.scratch/<effort>/issues/NN-<slug>.md`, one question per file.
- A `Type:` line records `research`, `prototype`, `grilling`, or `task`.
- Wayfinding uses `Status: claimed` and `Status: resolved`, distinct from implementation triage roles.
- A `Blocked by:` line records blocking ticket numbers. A wayfinding ticket is unblocked when every listed blocker is resolved.
- Work the open, unblocked, unclaimed frontier in number order. Save the claim before work.
- Resolve by appending an `## Answer`, setting `Status: resolved`, and adding a context pointer to Decisions-so-far in the map.
