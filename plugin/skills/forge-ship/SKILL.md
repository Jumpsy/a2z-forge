---
name: forge-ship
description: Run final production-readiness gates and authorized launch workflow. Use when preparing a release candidate or deployment.
license: MIT
---

# forge-ship

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

release candidate; target; permission mode; required quality targets; waivers.

## Outputs

release report; gate evidence; remaining issues; rollback plan; deployment record when authorized.

## Workflow

Require central journey, regression, security, data-loss, accessibility, responsiveness, performance, monitoring, recovery, legal, design, and claim-support gates as applicable. Stop on blockers. Require authorization for publication or destructive actions. Keep rollback ready.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-ship --target staging\`

## Evaluation case

A critical authorization finding prevents release even when all functional tests pass.
