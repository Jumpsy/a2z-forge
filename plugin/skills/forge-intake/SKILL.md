---
name: forge-intake
description: Run A2Z FORGE rapid intake or the adaptive founder interview. Use when an idea lacks material founder, problem, product, business, design, security, or delivery constraints.
license: MIT
---

# forge-intake

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

idea and existing project answers; optional rapid or deep mode.

## Outputs

structured intake record; resolved assumptions; only material unanswered questions.

## Workflow

Read existing state before asking. Infer low-risk defaults. Ask adaptive questions that change scope, architecture, cost, safety, or launch. Persist each answer immediately. Never repeat a recorded answer.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-intake --mode deep\`

## Evaluation case

Given partial answers, asks no duplicates and records new answers in the project state.
