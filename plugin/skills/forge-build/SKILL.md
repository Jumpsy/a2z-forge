---
name: forge-build
description: Execute implementation tasks from the current A2Z FORGE task graph. Use when approved, dependency-ready build work exists.
license: MIT
---

# forge-build

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

task id or milestone; permission mode; project state.

## Outputs

working artifact; tests; journal events; commit references; reviewer handoff.

## Workflow

Claim one ready task with a lease. Load only relevant context. Implement the smallest complete change. Validate boundaries and failure states. Run targeted checks. Never mark placeholders complete. Freeze the artifact for independent review.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-build --task core-state-store\`

## Evaluation case

A ready task becomes review only after its acceptance commands pass and outputs exist.
