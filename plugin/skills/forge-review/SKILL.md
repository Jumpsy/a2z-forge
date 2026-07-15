---
name: forge-review
description: Run an independent builder-critic review and open evidence-backed findings. Use after significant artifacts or before a milestone closes.
license: MIT
---

# forge-review

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

frozen artifact; acceptance criteria; reproduction instructions; reviewer perspective.

## Outputs

deduplicated findings with defect, evidence, severity, impact, fix, verification, confidence, and release status.

## Workflow

Keep initial critic context independent of builder reasoning. Reproduce defects. Reject unsupported negativity. Open blocking issues only with actionable evidence. Rotate critics after fixes and preserve the best-known version.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-review --artifact src/auth\`

## Evaluation case

A seeded defect is reproduced and classified while a preference-only objection does not block release.
