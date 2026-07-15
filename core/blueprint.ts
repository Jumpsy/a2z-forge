import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import type { ProjectState } from "./shared/schemas.js";

export async function initializeBlueprint(stateDirectory: string, state: ProjectState): Promise<void> {
  const files: Record<string, string> = {
    "NORTH_STAR.md": `# North Star\n\nCreate validated user value through a disciplined product workflow for: ${state.idea}\n`,
    "GOAL.md": `# Goal\n\n${state.goal}\n\n## Current milestone\n\n${state.milestone}\n\n## Release definition\n\nNot yet confirmed. Resolve through intake and evidence before implementation expands.\n`,
    "PRODUCT_BRIEF.md": `# Product Brief\n\n## Idea\n\n${state.idea}\n\n## User\n\nUnresolved.\n\n## Problem\n\nUnresolved.\n\n## Initial wedge\n\nUnresolved pending research.\n`,
    "DECISIONS.md": `# Decisions\n\n${state.decisions.map((decision) => `- ${decision}`).join("\n")}\n`,
    "RISKS.md": "# Risks\n\n- Product, market, technical, legal, security, and delivery risks remain unresolved until intake and research complete.\n",
    "LAST_HANDOFF.md": `# Last Handoff\n\nProject initialized at ${state.createdAt}.\n\nResume with: \`/a2z-forge:forge-status\` then claim task \`intake\`.\n`,
    "TASK_GRAPH.json": `${JSON.stringify({ schemaVersion: 1, tasks: state.tasks }, null, 2)}\n`,
    "AGENT_STATE.json": `${JSON.stringify({ schemaVersion: 1, agents: state.agents }, null, 2)}\n`,
    "EVIDENCE.jsonl": "",
  };

  for (const [name, contents] of Object.entries(files)) {
    await writeFile(join(stateDirectory, name), contents, { encoding: "utf8", flag: "wx", mode: 0o600 });
  }
}
