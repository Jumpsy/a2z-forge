---
name: forge-budget
description: Report and forecast model usage, API cost, runtime, local resources, reserve capacity, and deadline risk. Use when the user asks cost, usage, headroom, model routing, or resource status.
license: MIT
---

# forge-budget

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

project usage ledger; configured budget; deadline; queued work.

## Outputs

observed versus estimated usage; headroom; high-cost tasks; routing decisions; risk scenarios.

## Workflow

Label provider-reported, observed, and estimated values. Preserve configured reserve. Prefer deterministic and local work where adequate. Do not guarantee provider limits. Recommend scope or routing changes when risk crosses threshold.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-budget --reserve 25\`

## Evaluation case

Unknown provider usage is labeled estimated and the report never invents exact remaining quota.
