---
name: forge-stop
description: Safely stop A2Z FORGE workers and preserve a resumable handoff. Use when the user invokes /forge-stop, a boundary is reached, or execution must halt safely.
license: MIT
---

# forge-stop

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

project path; reason; whether safe checkpoint push is enabled.

## Outputs

stopped leases; atomic snapshot; journal event; LAST_HANDOFF.md; exact resume command.

## Workflow

Stop new task claims. Ask active workers to checkpoint. Wait only for bounded safe completion. Terminate remaining workers without deleting artifacts. Record files, commands, Git state, blockers, and resume instructions. Never push unless pre-authorized.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-stop --reason budget\`

## Evaluation case

After forced stop, no lease remains active and recovery identifies the exact next task.
