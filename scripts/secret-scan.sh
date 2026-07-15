#!/usr/bin/env bash
set -euo pipefail

root="${1:-.}"
pattern='(sk-[A-Za-z0-9_-]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----|gh[pousr]_[A-Za-z0-9]{30,})'

if git -C "$root" grep -En "$pattern" -- ':!package-lock.json' ':!scripts/secret-scan.sh'; then
  echo "Potential secret detected" >&2
  exit 1
fi

echo "No high-confidence secret patterns detected"
