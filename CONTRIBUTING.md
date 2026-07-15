# Contributing

Contributions should improve reproducible product quality rather than add roles, prompts, or dependencies without a demonstrated need.

1. Open an issue describing the user problem and acceptance evidence.
2. Keep changes scoped and add a regression test for behavior changes.
3. Run `npm run check`, `npm test`, `claude plugin validate . --strict`, and `npm run secret-scan`.
4. State what was verified, what remains assumed, and any compatibility limit.
5. Never include private project state, secrets, copyrighted competitor assets, or fabricated benchmark results.

Every new skill needs a trigger description, inputs, outputs, workflow, error handling, example, evaluation case, and project-state integration. Every new agent needs a bounded responsibility and must not duplicate an existing role.
