## Agent skills

### Issue tracker

For specifications, tickets, comments, and blocking dependencies, use local Markdown under `.scratch/`. Read `docs/agents/issue-tracker.md` before tracker operations.

### Triage labels

For issue status and triage, use the five default roles mapped in `docs/agents/triage-labels.md`.

### Domain docs

Before codebase exploration, read the single-context domain rules in `docs/agents/domain.md` for glossary vocabulary and relevant ADRs.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
