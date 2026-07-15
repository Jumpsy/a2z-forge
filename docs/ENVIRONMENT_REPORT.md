# Environment Report

Captured 2026-07-15 in `/Users/jacobhurvitz/agent-workspace`.

## Runtimes

| Capability | Finding |
| --- | --- |
| Claude Code | 2.1.210 |
| Codex CLI | 0.144.3 |
| OpenCode | 1.17.19 |
| Antigravity | Installed and active in tmux |
| Node | 24.12.0 |
| npm | 11.6.2 |
| Additional JS runtimes | Bun, pnpm, and Deno installed |
| Local models | Ollama with Mistral and Moondream |
| Multi-agent runtime | tmux session `agents`, four live panes |

## Research and interaction capabilities

- GitHub CLI and public web retrieval are operational.
- YouTube metadata and transcript extraction are operational through `yt-dlp`.
- Browser-backed social adapters require the OpenCLI Chrome extension.
- Agent Reach semantic Exa search is installed but not configured; official documentation was retrieved through direct web search instead.
- Browser and computer-use skills are installed, but consequential external actions remain approval-gated.

## Installed skill families

The machine contains product strategy, design research, brand, information architecture, accessibility, responsive design, frontend architecture, implementation, browser QA, testing, performance, security, documentation, image generation, video, scraping, repository mapping, plugin creation, and skill creation capabilities. A2Z FORGE will register them by metadata and load only the selected skill body for a task.

## Verified official standards

- Claude Code plugin components and manifest: <https://code.claude.com/docs/en/plugins-reference>
- Claude Code skills and frontmatter: <https://code.claude.com/docs/en/skills>
- Claude Code subagents: <https://code.claude.com/docs/en/sub-agents>
- Claude Code hooks: <https://code.claude.com/docs/en/hooks>
- Claude Code marketplace packaging: <https://code.claude.com/docs/en/plugin-marketplaces>
- Portable Agent Skills specification: <https://agentskills.io/specification>

Key compatibility decisions:

- Claude plugin skills are namespaced, so the canonical invocation is `/a2z-forge:forge`. The installer may additionally create explicit standalone wrappers only with the user's authorization.
- Plugin-shipped agents cannot declare `hooks`, `mcpServers`, or `permissionMode` in agent frontmatter.
- Hook scripts use `${CLAUDE_PLUGIN_ROOT}` because marketplace plugins run from a cache.
- Default plugin component directories must not also be declared in the manifest. Claude Code treats a repeated `hooks/hooks.json` path as a duplicate at live load time even when strict manifest validation passes.
- Skills use progressive disclosure and keep detailed schemas in references rather than one large prompt.
- Marketplace and plugin manifests are validated with Claude Code's own validator.

## Initial risks

1. The requested unqualified `/forge` command conflicts with Claude's mandatory plugin namespace. The safe default is the official `/a2z-forge:forge` command; a user-scope wrapper is optional.
2. Cross-agent usage telemetry is not exposed consistently. Measurements must distinguish observed, provider-reported, and estimated usage.
3. Long-running autonomous loops can waste budget or hide deadlock. Every worker needs a bounded task, heartbeat, lease, and stop condition.
4. Hooks run with high trust. Security enforcement must be deterministic, minimal, tested, and fail closed only for clearly destructive behavior.
5. A universal production checklist can become cargo cult. Gates must be selected from the product threat model and architecture.
