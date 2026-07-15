---
name: forge-goal
description: Create or update the living product goal and blueprint. Use when scope, north star, positioning, non-goals, success measures, or product decisions change.
license: MIT
---

# forge-goal

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

current evidence, intake, constraints, and requested change.

## Outputs

GOAL.md plus synchronized blueprint, decisions, risks, and project state.

## Workflow

Reconcile the request with evidence and deadline. State one central promise, user, wedge, success measures, scope, non-goals, and release definition. Record tradeoffs and superseded decisions.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-goal Narrow launch to teachers creating quizzes from PDFs.\`

## Evaluation case

A scope change updates goal, task graph, risks, and non-goals without contradiction.
