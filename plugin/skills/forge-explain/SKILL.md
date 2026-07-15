---
name: forge-explain
description: Produce the founder debrief and technical handoff. Use when a milestone or product needs to be understandable and maintainable by its owner.
license: MIT
---

# forge-explain

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

actual artifacts, architecture, tests, deployment and operations evidence.

## Outputs

business summary; repository map; architecture and data explanation; runbook; limitations; next steps.

## Workflow

Derive every claim from the repository and evidence ledger. Explain setup, central workflow, design, security, scaling, testing, cost, recovery, and extension points. State what remains unknown or unverified.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-explain --audience founder\`

## Evaluation case

The explanation matches executable routes and tests and labels incomplete adapters honestly.
