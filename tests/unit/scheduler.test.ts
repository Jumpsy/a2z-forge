import { describe, expect, it } from "vitest";
import { schedule } from "../../core/scheduler/scheduler.js";
import type { AgentAdapter } from "../../core/adapters/agent-adapter.js";

const adapter = (id: string, capability: "research" | "implementation"): AgentAdapter => ({
  id,
  capabilities: new Set([capability]),
  available: async () => true,
  start: async () => ({ runId: "run" }),
  status: async () => "completed",
  result: async () => undefined,
  stop: async () => undefined,
  resume: async () => undefined,
});

describe("schedule", () => {
  it("preserves reserve and prefers critical-path work", () => {
    const assignments = schedule([
      { id: "research", capability: "research", complexity: 1, estimatedUsage: 3, priority: 90, onCriticalPath: false },
      { id: "build", capability: "implementation", complexity: 3, estimatedUsage: 6, priority: 50, onCriticalPath: true },
    ], [adapter("researcher", "research"), adapter("builder", "implementation")], {
      agentLimit: 2,
      activeAgents: 0,
      budget: 10,
      used: 0,
      reservePercent: 20,
    });
    expect(assignments.map(({ task }) => task.id)).toEqual(["build"]);
  });
});
