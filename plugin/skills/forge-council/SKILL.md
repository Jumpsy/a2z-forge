---
name: forge-council
description: Run a configurable simulated quality council. Use when multiple realistic perspectives should challenge comprehension, trust, usability, purchase, or operations.
license: MIT
---

# forge-council

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

artifact; target users; scenarios; council size and diversity constraints.

## Outputs

clearly labeled simulated feedback; clustered objections; evidence classification; prioritized actions.

## Workflow

Generate distinct scenario-bound perspectives. Never present simulation as demand validation. Classify rejections as blocker, serious concern, preference, product-caused misunderstanding, persona mismatch, or unsupported opinion. Avoid majority-vote theater.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-council --size 24 --focus onboarding\`

## Evaluation case

Output labels all responses simulated and routes only evidence-backed relevant blockers into the task graph.
