# Triage labels

The five canonical roles map directly to local issue status strings.

| Canonical role | Local status | Meaning |
| --- | --- | --- |
| needs-triage | needs-triage | Maintainer needs to evaluate the issue |
| needs-info | needs-info | Waiting for clarification or missing information |
| ready-for-agent | ready-for-agent | Fully specified for agent implementation |
| ready-for-human | ready-for-human | Requires human implementation |
| wontfix | wontfix | Will not be actioned |

Use the local status string when a skill applies a triage role. Track blocking dependencies separately; ready-for-agent does not imply all blockers are complete or grant permission to start work.
