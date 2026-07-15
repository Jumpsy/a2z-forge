# Permissions

Use the lowest mode that can complete the current task.

| Mode | Local reads | Local writes | Public research | Connected services | Consequential actions |
| --- | --- | --- | --- | --- | --- |
| Observe | Yes | No | Yes | No mutation | Ask |
| Build | Yes | Authorized project only | Yes | No mutation | Ask |
| Connected Build | Yes | Authorized project only | Yes | Named services and workspaces | Ask when consequential |
| Autopilot | Yes | Authorized project only | Yes | Pre-authorized actions | Purchases, public publication, irreversible deletion, security changes, contracts, and unrelated communication still ask |

Hooks are defense in depth, not a shell sandbox. Declarative host deny rules, account permissions, branch protection, secret stores, and human authorization remain authoritative.

Every consequential action records the actor, target, scope, timestamp, result, and recovery or rollback path. Secrets are redacted before journal or model context entry.
