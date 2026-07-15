---
name: forge-security
description: Run threat modeling, permission review, secret scanning, dependency analysis, and targeted security tests. Use before connected actions, sensitive features, and release.
license: MIT
---

# forge-security

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

architecture; data flows; trust boundaries; permission mode; code and configuration.

## Outputs

SECURITY_MODEL.md; threat register; scan/test evidence; blocking findings; remediation tasks.

## Workflow

Map assets and trust boundaries. Enforce least privilege. Inspect auth, validation, uploads, sessions, rate limits, secrets, logs, dependencies, and supply chain as relevant. Redact secrets. Never weaken controls to make a test pass.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-security --scope authentication,uploads\`

## Evaluation case

A committed test secret is detected without printing its value and a missing authorization check blocks release.
