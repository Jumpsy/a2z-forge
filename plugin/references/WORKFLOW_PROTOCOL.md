# A2Z FORGE Workflow Protocol

## State contract

Treat the managed product's `.forge/PROJECT_STATE.json` as the latest atomic snapshot and `.forge/SESSION_JOURNAL.jsonl` as the append-only event record. Validate both before mutation. Preserve existing source changes and never write secrets to either file.

Every task requires an objective, owner, independent reviewer, priority, status, dependencies, inputs, outputs, acceptance criteria, usage estimate, deadline if known, risk, attempt count, related commits and decisions, blocking issues, and resume instructions.

## Permission modes

- `observe`: read local and public sources without external mutations.
- `build`: change authorized local project files and run local development tools.
- `connected-build`: use named authorized external services for configuration or deployment within stated scope.
- `autopilot`: execute pre-authorized project actions within explicit boundaries.

Purchases, irreversible remote deletion, public publication, security-setting changes, contracts, and unrelated communication always require immediate specific authorization.

## Evidence contract

Record source, retrieval date, relevant observation, confidence from 0 to 1, fact/opinion/inference/test/artifact classification, decision supported, possible staleness, and license restrictions. Never treat simulated feedback as customer evidence.

## Task execution

1. Read the snapshot, latest journal events, goal, decisions, Git state, and relevant artifacts.
2. Reconcile stale leases and interrupted commands.
3. Select dependency-ready work on the critical path.
4. Load only task-relevant skills and context.
5. Assign one bounded objective with expected artifact and acceptance criteria.
6. Persist progress and heartbeat while work runs.
7. Freeze significant artifacts for independent review.
8. Convert valid findings into tasks and regression checks.
9. Checkpoint coherent milestones.
10. Stop on permission, budget, safety, deadline, or genuine external blockers.

## Completion gate

Never mark work complete from an agent statement alone. Verify the output exists, acceptance commands pass, required evidence is recorded, no release blocker remains, and the state snapshot is durable. Report observed, provider-reported, and estimated usage separately.
