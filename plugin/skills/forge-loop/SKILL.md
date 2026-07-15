---
name: forge-loop
description: Run bounded persistent orchestration until a milestone, blocker, budget boundary, deadline, or user stop. Use for autonomous continuation with explicit limits.
license: MIT
---

# forge-loop

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

milestone or stop condition; budget; deadline; agent limit; permission mode.

## Outputs

continuous journal; checkpoints; completed tasks; consolidated blockers; safe stop state.

## Workflow

Recompute ready work and critical path each cycle. Keep productive workers bounded by leases. Reassign idle capacity to valid review or research. Stop on policy, budget, diminishing returns, or dependency deadlock. Never loop merely to appear active.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-loop --milestone foundation --budget 10 --agent-limit 3\`

## Evaluation case

A fixture with no ready work stops once, reports the blocker, and does not consume repeated model calls.
