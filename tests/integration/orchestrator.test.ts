import { describe, expect, it } from "vitest";
import { CliAgentAdapter } from "../../core/adapters/cli-agent-adapter.js";
import { AgentRegistry } from "../../core/adapters/registry.js";
import { Orchestrator, type OrchestrationTask } from "../../core/orchestrator/orchestrator.js";

const task: OrchestrationTask = {
  id: "implementation-1",
  taskId: "implementation-1",
  objective: "Run the adapter fixture",
  capability: "implementation",
  complexity: 1,
  estimatedUsage: 1,
  priority: 100,
  onCriticalPath: true,
  contextFiles: [],
  constraints: [],
  acceptanceCriteria: ["Process exits successfully"],
  expectedArtifacts: [],
};

describe("Orchestrator", () => {
  it("plans, executes, and resumes a real CLI adapter", async () => {
    const registry = new AgentRegistry();
    const adapter = new CliAgentAdapter("node-fixture", "node", ["implementation"], (input) => ["-e", `console.log(${JSON.stringify(input.constraints.join("|\""))})`]);
    registry.register(adapter);
    const orchestrator = new Orchestrator(registry);
    const [assignment] = await orchestrator.plan([task], { agentLimit: 1, activeAgents: 0, used: 0, reservePercent: 20 });
    expect(assignment?.adapterId).toBe("node-fixture");
    const { runId } = await orchestrator.execute(assignment!);
    await waitForCompletion(adapter, runId);
    expect((await adapter.result(runId))?.status).toBe("completed");
    await adapter.resume(runId, "continue safely");
    await waitForCompletion(adapter, runId);
    expect((await adapter.result(runId))?.summary).toContain("continue safely");
  });
});

async function waitForCompletion(adapter: CliAgentAdapter, runId: string): Promise<void> {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if ((await adapter.status(runId)) !== "running") return;
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  throw new Error("Adapter did not complete");
}
