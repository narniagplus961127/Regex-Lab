# Agent skill setup draft

Approved and applied on 2026-10-14: local Markdown tracker, default triage labels, single-context domain docs, and AGENTS.md. This document preserves the reviewed draft; the active configuration lives in AGENTS.md and docs/agents/.

## Proposed AGENTS.md (or CLAUDE.md)

```markdown
## Agent skills

### Issue tracker

For specifications, tickets, comments, and blocking dependencies, use local Markdown under `.scratch/`. Read `docs/agents/issue-tracker.md` before tracker operations.

### Triage labels

For issue status and triage, use the five default roles mapped in `docs/agents/triage-labels.md`.

### Domain docs

Before codebase exploration, read the single-context domain rules in `docs/agents/domain.md` for glossary vocabulary and relevant ADRs.
```

## Proposed docs/agents/issue-tracker.md

```markdown
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
```

## Proposed docs/agents/triage-labels.md

```markdown
# Triage labels

The five canonical roles map directly to local issue status strings.

| Canonical role  | Local status    | Meaning                                          |
| --------------- | --------------- | ------------------------------------------------ |
| needs-triage    | needs-triage    | Maintainer needs to evaluate the issue           |
| needs-info      | needs-info      | Waiting for clarification or missing information |
| ready-for-agent | ready-for-agent | Fully specified for agent implementation         |
| ready-for-human | ready-for-human | Requires human implementation                    |
| wontfix         | wontfix         | Will not be actioned                             |

Use the local status string when a skill applies a triage role. Track blocking dependencies separately; ready-for-agent does not imply all blockers are complete or grant permission to start work.
```

## Proposed docs/agents/domain.md

```markdown
# Domain docs

## Before codebase exploration

Read the root `GLOSSARY.md` and relevant decisions under `docs/adr/`. This project uses a single context. If a `GLOSSARY-MAP.md` is introduced later, follow it to the relevant context glossaries and ADRs.

If a glossary or ADR directory does not exist, proceed silently. Domain modeling creates these lazily when a term or consequential decision is resolved.

## Vocabulary

Use glossary terms in specifications, ticket titles, explanations, hypotheses, and tests. If a needed term is missing, assess whether it is a real domain-language gap and record it through domain modeling.

## Decisions

Surface conflicts with an existing ADR before changing the documented decision. Name the conflicting ADR and the reason to reconsider it.

## Layout

- Shared domain vocabulary: `GLOSSARY.md` at the repo root.
- Consequential architecture decisions: `docs/adr/`, created when needed.
```

## Effect of this setup

The to-spec, to-tickets, triage, and other engineering skills will read these pointers to locate the configured tracker and domain rules. Local Markdown setup does not create GitHub labels or publish GitHub issues. Existing specification and ticket drafts remain drafts until the applicable publication requirements are satisfied.
