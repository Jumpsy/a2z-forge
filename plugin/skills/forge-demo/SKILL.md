---
name: forge-demo
description: Create truthful screenshots, recordings, clips, walkthroughs, and presentation assets from a working product. Use after the central workflow runs.
license: MIT
---

# forge-demo

Read \`${CLAUDE_PLUGIN_ROOT}/references/WORKFLOW_PROTOCOL.md\` before mutating project state.

## Inputs

demo account; seeded data; product story; target formats; privacy constraints.

## Outputs

script; captures; recordings; review findings; final media manifest and provenance.

## Workflow

Use real product states and authorized data. Hide private information. Record the central story through browser automation. Independently review media. Convert exposed product defects into tasks and re-record after fixes. Never fake unavailable functionality.

Honor the current permission mode. Use only task-relevant tools and installed skills. Log consequential actions. Persist outputs before reporting success.

## Failure handling

On tool failure, record the command, safe retry state, and blocker. Retry only idempotent work. Never convert a missing credential, unavailable provider, failed test, or incomplete adapter into a success claim.

## Example

\`/forge-demo --formats 16:9,9:16\`

## Evaluation case

A broken step aborts the recording and opens a defect instead of compositing a fake success state.
