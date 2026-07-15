---
name: forge
description: Start or resume the complete A2Z FORGE product workflow. Use when the user invokes /forge, provides a product idea, asks A2Z FORGE to continue, or wants coordinated research through release.
license: MIT
---

# forge

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

idea; optional deadline, budget, mode, agent limit, quality level, links, repositories, files, and deployment target.

## Outputs

updated PROJECT_STATE.json and TASK_GRAPH.json; current recommendation; next executable tasks.

## Workflow

Load or initialize state. Resolve prior answers. Run intake only for material unknowns. Select the smallest valuable critical path. Delegate bounded work to required roles. Keep one productive task active. Checkpoint every milestone.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge Build a study app that turns uploaded material into an interactive tutor.\`

## Evaluation case

From an empty fixture, invocation creates valid state, an intake task, a goal, and a resumable next action.
