#!/usr/bin/env bash
set -euo pipefail

root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
scope="${FORGE_INSTALL_SCOPE:-user}"

command -v node >/dev/null || { echo "Node.js 22 or newer is required" >&2; exit 1; }
command -v npm >/dev/null || { echo "npm is required" >&2; exit 1; }
command -v claude >/dev/null || { echo "Claude Code is required for the primary plugin" >&2; exit 1; }

node_major="$(node -p 'process.versions.node.split(`.`)[0]')"
if (( node_major < 22 )); then
  echo "Node.js 22 or newer is required; found $(node --version)" >&2
  exit 1
fi

cd "$root"
npm ci
npm run build
npm test
claude plugin validate "$root" --strict
npm link

if ! claude plugin marketplace list | grep -q 'a2z-forge'; then
  claude plugin marketplace add "$root/" --scope "$scope"
else
  claude plugin marketplace update a2z-forge
fi

claude plugin uninstall a2z-forge@a2z-forge --scope "$scope" >/dev/null 2>&1 || true
claude plugin install a2z-forge@a2z-forge --scope "$scope" \
  --config permission_mode="${FORGE_PERMISSION_MODE:-build}" \
  --config agent_limit="${FORGE_AGENT_LIMIT:-3}" \
  --config reserve_percent="${FORGE_RESERVE_PERCENT:-20}"

claude plugin list | grep -A3 'a2z-forge@a2z-forge'
echo "A2Z FORGE installed. Restart Claude Code, then run /a2z-forge:forge <idea>."
