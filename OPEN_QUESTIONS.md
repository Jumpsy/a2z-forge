# Open Questions

## Resolved by inspection

- Primary runtime: Claude Code 2.1.210 is installed.
- Portable runtimes: Codex 0.144.3, OpenCode 1.17.19, and Antigravity are available in the live `agents` tmux session.
- Local models: Ollama exposes `mistral:latest` and `moondream:latest`.
- Core language: TypeScript on Node 24, which satisfies the selected Node 22 minimum.
- Claude packaging: marketplace plugin with `.claude-plugin/marketplace.json` and `.claude-plugin/plugin.json`; skills remain plugin-namespaced in Claude Code.
- State location: each managed product stores runtime state under its own `.forge/` directory; the framework repository contains templates only.
- Default deployment posture: provider-neutral and local-first. No Vercel or Supabase default.
- License: MIT for the framework, with a separate provenance ledger for reused assets and dependencies.

## Non-blocking decisions deferred to release

- Public GitHub organization and final repository URL.
- Whether signed releases use Sigstore keyless signing or GitHub artifact attestations.
- Which hosted model providers receive first-party billing telemetry beyond Anthropic and OpenAI.
- Whether the demo video is committed through Git LFS or attached to GitHub Releases.

These do not block foundation work. Release packaging will use replaceable metadata until the public repository exists.
