import type { AgentAdapter, AgentCapability } from "../adapters/agent-adapter.js";

export type SchedulableTask = {
  id: string;
  capability: AgentCapability;
  complexity: number;
  estimatedUsage: number;
  priority: number;
  onCriticalPath: boolean;
};

export type Capacity = {
  agentLimit: number;
  activeAgents: number;
  budget?: number;
  used: number;
  reservePercent: number;
};

export function schedule(
  tasks: SchedulableTask[],
  adapters: AgentAdapter[],
  capacity: Capacity,
): Array<{ task: SchedulableTask; adapter: AgentAdapter }> {
  const slots = Math.max(0, capacity.agentLimit - capacity.activeAgents);
  const spendable = capacity.budget === undefined
    ? Number.POSITIVE_INFINITY
    : Math.max(0, capacity.budget * (1 - capacity.reservePercent / 100) - capacity.used);
  let assignedUsage = 0;
  const assignments: Array<{ task: SchedulableTask; adapter: AgentAdapter }> = [];
  const sorted = [...tasks].sort((left, right) =>
    Number(right.onCriticalPath) - Number(left.onCriticalPath) ||
    right.priority - left.priority ||
    left.estimatedUsage - right.estimatedUsage,
  );

  for (const task of sorted) {
    if (assignments.length >= slots) break;
    if (assignedUsage + task.estimatedUsage > spendable) continue;
    const adapter = adapters.find((candidate) => candidate.capabilities.has(task.capability));
    if (!adapter) continue;
    assignments.push({ task, adapter });
    assignedUsage += task.estimatedUsage;
  }
  return assignments;
}
