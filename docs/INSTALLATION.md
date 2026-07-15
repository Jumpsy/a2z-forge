# Installation

## One command

```bash
./installers/install.sh
```

The installer requires Node.js 22 or newer, npm, Git, and Claude Code. It installs the provider-neutral `forge` CLI, validates the marketplace package, and installs the Claude plugin. It does not install or configure hosted model credentials.

Restart Claude Code after installation, then run:

```text
/a2z-forge:forge Build a focused product from this idea
```

Claude Code officially namespaces plugin skills. A2Z FORGE therefore exposes `/a2z-forge:forge`, not an unqualified `/forge`, unless the user separately installs a standalone personal wrapper.

## Manual installation

```bash
npm ci
npm run build
npm test
npm link
claude plugin validate . --strict
claude plugin marketplace add ./ --scope user
claude plugin install a2z-forge@a2z-forge --scope user
```

Use `--scope local` to keep installation specific to one checkout. Configure defaults with repeated `--config` flags documented by `claude plugin install --help`.

## Verify

```bash
forge doctor
claude plugin list
```

The installed plugin must show `Status: enabled`. Manifest validation alone is insufficient because live loading also detects duplicate default components.
