#!/usr/bin/env bash
set -euo pipefail

scope="${FORGE_INSTALL_SCOPE:-user}"
claude plugin uninstall a2z-forge@a2z-forge --scope "$scope" || true
npm unlink --global a2z-forge || true
echo "A2Z FORGE was removed. Existing project .forge state was preserved."
