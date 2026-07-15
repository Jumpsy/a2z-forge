# A2Z FORGE

**Idea in. Production out.**

A2Z FORGE is an autonomous product foundry for Claude Code and compatible coding agents. It coordinates research, design, implementation, independent critique, testing, recovery, demonstration, and handoff through one evidence-driven workflow.

This repository is under active construction. The recoverable orchestration foundation is implemented first. Production-readiness claims will appear only beside reproducible evidence.

## What it does

- Maintains a persistent project state and append-only session journal.
- Represents work as a dependency-validated task graph.
- Recovers coherent state after interruption.
- Exposes provider-neutral primitives for agent and model adapters.
- Packages workflows as Claude Code skills and specialized agents.

## What it does not promise

A2Z FORGE does not guarantee product-market fit, revenue, perfect output, exact provider-limit avoidance, or that simulated review equals customer validation.

## Foundation demo

```bash
npm install
npm run build
node dist/cli/index.js init --path /tmp/forge-demo --idea "Build a focused study workspace"
node dist/cli/index.js status --path /tmp/forge-demo
node dist/cli/index.js checkpoint --path /tmp/forge-demo
node dist/cli/index.js recover --path /tmp/forge-demo
```

## Status

See [IMPLEMENTATION_PLAN.md](IMPLEMENTATION_PLAN.md) and [docs/ENVIRONMENT_REPORT.md](docs/ENVIRONMENT_REPORT.md). The Claude plugin, full adapter set, dashboard, and reference application are not yet claimed complete.
