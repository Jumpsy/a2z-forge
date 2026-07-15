import { z } from "zod";

export const AgentCapabilitySchema = z.enum([
  "research",
  "strategy",
  "design",
  "implementation",
  "browser",
  "vision",
  "review",
  "security",
  "documentation",
]);

export const AgentTaskSchema = z.object({
  taskId: z.string().min(1),
  objective: z.string().min(1),
  contextFiles: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string()).min(1),
  expectedArtifacts: z.array(z.string()).default([]),
  deadline: z.string().datetime({ offset: true }).optional(),
  usageLimit: z.number().nonnegative().optional(),
});

export const AgentResultSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["completed", "blocked", "failed", "stopped"]),
  summary: z.string().min(1),
  artifacts: z.array(z.string()).default([]),
  checks: z.array(z.object({ command: z.string(), exitCode: z.number().int(), summary: z.string() })).default([]),
  blocker: z.string().optional(),
  observedUsage: z.number().nonnegative().optional(),
  estimatedUsage: z.number().nonnegative().optional(),
});

export type AgentCapability = z.infer<typeof AgentCapabilitySchema>;
export type AgentTask = z.infer<typeof AgentTaskSchema>;
export type AgentResult = z.infer<typeof AgentResultSchema>;

export interface AgentAdapter {
  readonly id: string;
  readonly capabilities: ReadonlySet<AgentCapability>;
  available(): Promise<boolean>;
  start(task: AgentTask): Promise<{ runId: string }>;
  status(runId: string): Promise<"queued" | "running" | "completed" | "blocked" | "failed" | "stopped">;
  result(runId: string): Promise<AgentResult | undefined>;
  stop(runId: string): Promise<void>;
  resume(runId: string, context: string): Promise<void>;
}
