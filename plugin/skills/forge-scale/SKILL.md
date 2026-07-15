---
name: forge-scale
description: Create and test a progressive scaling plan. Use when capacity, bottlenecks, reliability, cost, queues, storage, or growth horizons need evidence.
license: MIT
---

# forge-scale

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

current architecture; expected users and workloads; cost constraints.

## Outputs

scaling stages; bottleneck hypotheses; thresholds; load-test plan and results; migration triggers.

## Workflow

Plan local, launch, traction, growth, and large-scale horizons without premature infrastructure. Model database, queues, media, AI, rate limits, observability, backups, security, support, and cost. Do not claim readiness from diagrams alone.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-scale --horizons 1000,10000,100000\`

## Evaluation case

Claims distinguish tested capacity from planned migration triggers and include realistic load evidence.
