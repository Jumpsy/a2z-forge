---
name: forge-recover
description: Rehydrate an A2Z FORGE project after interruption, terminal closure, context reset, or computer restart. Use when state may be stale or incomplete.
license: MIT
---

# forge-recover

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

project path; optional session id.

## Outputs

reconciled atomic snapshot; validated journal; Git and process assessment; resume tasks; recovery report.

## Workflow

Inspect snapshot, journal, Git status, recent commits, leases, processes, and interrupted commands. Ignore a torn final journal record but reject earlier corruption. Do not overwrite uncommitted work. Run safety checks before resuming.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-recover --path ./product\`

## Evaluation case

A torn temporary snapshot and partial final event recover to the last coherent state without data loss.
