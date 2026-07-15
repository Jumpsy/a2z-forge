import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import { ProjectStateSchema, type PermissionMode, type ProjectState } from "./shared/schemas.js";

export function createProjectState(input: {
  projectRoot: string;
  idea: string;
  productName?: string;
  permissionMode?: PermissionMode;
}): ProjectState {
  const now = new Date().toISOString();
  return ProjectStateSchema.parse({
    schemaVersion: 1,
    projectId: randomUUID(),
    productName: input.productName ?? basename(input.projectRoot),
    idea: input.idea,
    goal: `Validate and build the smallest production-worthy product for: ${input.idea}`,
    milestone: "Intake and evidence collection",
    permissionMode: input.permissionMode ?? "build",
    status: "intake",
    createdAt: now,
    updatedAt: now,
    tasks: [],
    agents: [],
    findings: [],
    evidence: [],
    usage: {
      observedTokens: 0,
      estimatedTokens: 0,
      observedCostUsd: 0,
      estimatedCostUsd: 0,
      reservePercent: 20,
      updatedAt: now,
    },
    decisions: ["User retains final authority over go, pivot, validate-first, and no-go recommendations."],
    lastJournalSequence: 0,
  });
}
