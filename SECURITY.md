# Security Policy

## Reporting

Do not open a public issue for a suspected vulnerability involving secret exposure, authorization bypass, destructive hooks, or supply-chain compromise. Use the repository host's private vulnerability-reporting feature when the public repository is available. Until then, report privately to the maintainer who supplied this repository.

## Supported versions

Only the latest released minor version receives security fixes during the pre-1.0 period.

## Security boundaries

A2Z FORGE skills run with the host agent's permissions. The framework adds deterministic checks but cannot make an untrusted plugin, model, shell command, or connected account safe. Review skills before trust, use the lowest adequate permission mode, keep secrets in approved stores, and inspect every consequential external action.

The project never needs consumer-session credentials as an API proxy. Do not commit `.env` files, provider keys, local `.forge/` state, transcripts, recordings containing private data, or generated credential inventories.
