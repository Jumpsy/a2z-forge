---
name: forge-plan
description: Create architecture, roadmap, estimates, deadline scenarios, and the persistent task graph. Use before major implementation or after material scope changes.
license: MIT
---

# forge-plan

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

confirmed goal; evidence; constraints; deadline; budget; available agents and tools.

## Outputs

architecture decision; DAG; critical path; best, expected, and risk scenarios; acceptance criteria.

## Workflow

Choose architecture from requirements. Avoid premature distribution and lock-in. Create bounded tasks with owners, reviewers, dependencies, outputs, tests, risk, usage estimate, and resume instructions. Reserve capacity for integration and fixes.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-plan --deadline 2026-08-01 --agent-limit 3\`

## Evaluation case

Generated tasks form an acyclic graph and every ready task has a measurable completion condition.
