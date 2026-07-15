---
name: forge-status
description: Show the current A2Z FORGE milestone, completed and active work, blockers, findings, usage, deadline risk, and next actions. Use for /forge-status or any progress question.
license: MIT
---

# forge-status

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

optional project path and detail level.

## Outputs

concise evidence-backed status derived from state, journal, agents, Git, and test artifacts.

## Workflow

Read current files rather than relying on conversation memory. Reconcile stale leases and Git state. Lead with milestone and blockers. Distinguish verified completion from in-progress and planned work. Include recovery loss exposure.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-status\`

## Evaluation case

After a restart, status matches disk state and does not claim a task complete from stale chat.
