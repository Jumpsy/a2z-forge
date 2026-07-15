# Troubleshooting

## Plugin validates but fails to load

Run `claude plugin list`. Live loading catches duplicate default components that manifest validation may not. Do not declare `hooks/hooks.json` in `plugin.json` when it already occupies the standard plugin path.

## Marketplace path is rejected

Use an explicit path ending in `/`, such as `claude plugin marketplace add ./`. A bare `.` may be rejected by the CLI parser.

## Status is stale after interruption

Run `forge recover` before new mutation. If recovery reports journal corruption before the final line, preserve the files and repair the invalid event rather than deleting history.

## Agent is installed but a version probe fails

Some agent launchers refuse nested execution. `forge doctor` distinguishes installed executables from successful version probes; run the agent directly in its intended terminal to verify authentication.

## Research backend is unavailable

Record the unavailable backend and use another authorized deterministic or public retrieval path. Do not convert a missing source into an unsupported claim.
