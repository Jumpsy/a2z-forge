# A2Z FORGE Implementation Plan

## Product contract

A2Z FORGE turns a founder idea into a traceable product-development workflow. It coordinates research, strategy, design, implementation, review, testing, recovery, demonstration, and handoff. It does not claim that an artifact is production ready without evidence and it does not promise business success.

## Architecture decision

Use a provider-neutral TypeScript core with thin runtime wrappers. The core owns schemas, state, scheduling, evidence, policy, and recovery. Claude Code remains the primary interactive runtime through a marketplace plugin. Other agents connect through adapters implementing one task protocol.

The runtime boundary is deliberate:

1. `core/` contains deterministic logic and provider interfaces.
2. `cli/` exposes lifecycle commands without requiring an agent session.
3. `plugin/` contains Claude skills, agents, hooks, and MCP configuration.
4. `dashboard/` reads state and emits control requests through the core.
5. `.forge/` inside each generated product is the durable local control plane.

## Milestones

### M1. Recoverable orchestration foundation

- Typed project, task, agent, finding, evidence, usage, and event schemas.
- Append-only journal plus atomic state snapshots.
- DAG validation, ready-task selection, retries, cancellation, and critical path.
- CLI initialization, status, checkpoint, recovery, and doctor commands.
- Unit, integration, and forced-interruption recovery tests.

Acceptance: a project can be initialized, tasks can advance without violating dependencies, state survives a simulated interrupted atomic write, and status can be reconstructed from disk.

### M2. Claude plugin and portable adapters

- Official Claude plugin manifest, marketplace catalog, skills, agents, and hooks.
- Installed-skill registry with progressive loading and trust metadata.
- Claude, Codex, OpenCode, Antigravity, and local-process adapters.
- Permission modes: observe, build, connected-build, autopilot.

Acceptance: `claude plugin validate .` passes and `/a2z-forge:forge` initializes or resumes a real project.

### M3. Product organization workflows

- Adaptive intake and venture gate.
- Evidence and license ledgers.
- Research, design tournament, builder-critic, council, security, scaling, and production-readiness workflows.
- Dynamic model and resource scheduling with reserved capacity.

Acceptance: every major claim points to an artifact, source, test result, or explicit waiver.

### M4. Dashboard, demonstration, and reference product

- Local dashboard and telemetry.
- Browser screenshot and recording adapters.
- Study-app reference project.
- Crash recovery, low-budget, short-deadline, and conflicting-edit evaluations.

Acceptance: the reference project runs end to end, its checks are reproducible, its recovery test passes, and its demo uses real product states.

### M5. Open-source release

- Installer, manual setup, CI, security scanning, semantic release, contribution assets, benchmarks, and limitations.
- Independent code, security, design, and documentation review.

Acceptance: clean install on a fresh fixture, verified plugin discovery, all release gates green, and no undocumented incomplete adapter.

## Current critical path

`schemas -> state store -> task graph -> CLI -> adapters -> Claude plugin -> workflows -> dashboard -> reference project -> release evidence`

## Independent review policy

Every significant artifact is frozen before review. The first critic receives only the artifact, acceptance criteria, and reproduction instructions. Findings require defect, evidence, severity, impact, correction, verification, confidence, and blocking status.
