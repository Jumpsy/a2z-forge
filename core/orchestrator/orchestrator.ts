import type { AgentTask, AgentCapability } from "../adapters/agent-adapter.js";
import { AgentRegistry } from "../adapters/registry.js";
import { schedule, type Capacity, type SchedulableTask } from "../scheduler/scheduler.js";

export type OrchestrationTask = SchedulableTask & AgentTask;

export class Orchestrator {
  constructor(readonly agents: AgentRegistry) {}

  async plan(tasks: OrchestrationTask[], capacity: Capacity): Promise<Array<{ task: OrchestrationTask; adapterId: string }>> {
    const capabilities = [...new Set(tasks.map(({ capability }) => capability))];
    const available = (await Promise.all(capabilities.map((capability) => this.agents.available(capability)))).flat();
    const unique = [...new Map(available.map((adapter) => [adapter.id, adapter])).values()];
    return schedule(tasks, unique, capacity).map(({ task, adapter }) => ({
      task: tasks.find(({ id }) => id === task.id) as OrchestrationTask,
      adapterId: adapter.id,
    }));
  }

  async execute(assignment: { task: OrchestrationTask; adapterId: string }): Promise<{ runId: string }> {
    const adapter = this.agents.require(assignment.adapterId);
    return await adapter.start(assignment.task);
  }

  async availableCapabilities(): Promise<AgentCapability[]> {
    const capabilities: AgentCapability[] = ["research", "strategy", "design", "implementation", "browser", "vision", "review", "security", "documentation"];
    const checks = await Promise.all(capabilities.map(async (capability) => ({ capability, available: (await this.agents.available(capability)).length > 0 })));
    return checks.filter(({ available }) => available).map(({ capability }) => capability);
  }
}
