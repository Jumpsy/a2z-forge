# Recovery

Run:

```bash
forge recover --path /path/to/product
```

Recovery reads `.forge/PROJECT_STATE.json`, validates `.forge/SESSION_JOURNAL.jsonl`, ignores only an incomplete final line, replays state-changing events newer than the snapshot, reconciles Git and task state through the plugin workflow, writes an atomic snapshot, and records `session.recovered`.

If corruption occurs before the final journal line, recovery stops rather than silently discarding history. Preserve the project directory and inspect the reported line. Randomized interrupted snapshot files can be removed with the tested temporary-snapshot cleanup path.
