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
