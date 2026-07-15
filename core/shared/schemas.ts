import { z } from "zod";

export const ISODateSchema = z.string().datetime({ offset: true });

export const PermissionModeSchema = z.enum([
  "observe",
  "build",
  "connected-build",
  "autopilot",
]);

export const TaskStatusSchema = z.enum([
  "pending",
  "ready",
  "in-progress",
  "blocked",
  "review",
  "completed",
  "failed",
  "cancelled",
]);

export const EvidenceSchema = z.object({
  id: z.string().min(1),
  source: z.string().min(1),
  retrievedAt: ISODateSchema,
  summary: z.string().min(1),
  confidence: z.number().min(0).max(1),
  kind: z.enum(["fact", "opinion", "inference", "test", "artifact"]),
  supports: z.array(z.string()).default([]),
  staleAfter: ISODateSchema.optional(),
  license: z.string().optional(),
});

export const TaskSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  objective: z.string().min(1),
  owner: z.string().optional(),
  reviewer: z.string().optional(),
  priority: z.number().int().min(0).max(100).default(50),
  status: TaskStatusSchema.default("pending"),
  dependencies: z.array(z.string()).default([]),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  acceptanceCriteria: z.array(z.string().min(1)).min(1),
  estimatedUsage: z.number().nonnegative().default(0),
  actualUsage: z.number().nonnegative().default(0),
  deadline: ISODateSchema.optional(),
  risk: z.enum(["low", "medium", "high", "critical"]).default("low"),
  attemptCount: z.number().int().nonnegative().default(0),
  relatedCommits: z.array(z.string()).default([]),
  relatedDecisions: z.array(z.string()).default([]),
  blockingIssues: z.array(z.string()).default([]),
  resumeInstructions: z.string().default("Inspect the latest journal event and task outputs."),
  createdAt: ISODateSchema,
  updatedAt: ISODateSchema,
});

export const AgentStateSchema = z.object({
  id: z.string().min(1),
  adapter: z.string().min(1),
  status: z.enum(["idle", "working", "blocked", "stopped", "failed"]),
  taskId: z.string().optional(),
  lastHeartbeatAt: ISODateSchema,
  leaseExpiresAt: ISODateSchema.optional(),
  usageObserved: z.number().nonnegative().default(0),
  usageEstimated: z.number().nonnegative().default(0),
  blocker: z.string().optional(),
});

export const FindingSchema = z.object({
  id: z.string().min(1),
  artifact: z.string().min(1),
  defect: z.string().min(1),
  evidence: z.string().min(1),
  severity: z.enum(["info", "low", "medium", "high", "critical"]),
  impact: z.string().min(1),
  fix: z.string().min(1),
  verification: z.string().min(1),
  confidence: z.number().min(0).max(1),
  blocksRelease: z.boolean(),
  status: z.enum(["open", "accepted", "fixed", "waived", "rejected"]),
});

export const UsageSchema = z.object({
  observedTokens: z.number().int().nonnegative().default(0),
  estimatedTokens: z.number().int().nonnegative().default(0),
  observedCostUsd: z.number().nonnegative().default(0),
  estimatedCostUsd: z.number().nonnegative().default(0),
  budgetUsd: z.number().positive().optional(),
  reservePercent: z.number().min(0).max(100).default(20),
  cpuPercent: z.number().min(0).max(100).optional(),
  memoryBytes: z.number().int().nonnegative().optional(),
  diskFreeBytes: z.number().int().nonnegative().optional(),
  updatedAt: ISODateSchema,
});

export const ProjectStateSchema = z.object({
  schemaVersion: z.literal(1),
  projectId: z.string().min(1),
  productName: z.string().min(1),
  idea: z.string().min(1),
  goal: z.string().min(1),
  milestone: z.string().min(1),
  permissionMode: PermissionModeSchema,
  status: z.enum(["intake", "research", "planning", "building", "review", "shipping", "stopped"]),
  createdAt: ISODateSchema,
  updatedAt: ISODateSchema,
  tasks: z.array(TaskSchema),
  agents: z.array(AgentStateSchema),
  findings: z.array(FindingSchema),
  evidence: z.array(EvidenceSchema),
  usage: UsageSchema,
  decisions: z.array(z.string()).default([]),
  lastJournalSequence: z.number().int().nonnegative().default(0),
});

export const JournalEventSchema = z.object({
  schemaVersion: z.literal(1),
  sequence: z.number().int().positive(),
  eventId: z.string().uuid(),
  timestamp: ISODateSchema,
  type: z.enum([
    "project.created",
    "project.updated",
    "task.created",
    "task.updated",
    "agent.updated",
    "finding.recorded",
    "evidence.recorded",
    "checkpoint.created",
    "session.stopped",
    "session.recovered",
  ]),
  actor: z.string().min(1),
  payload: z.record(z.string(), z.unknown()),
});

export type Task = z.infer<typeof TaskSchema>;
export type ProjectState = z.infer<typeof ProjectStateSchema>;
export type JournalEvent = z.infer<typeof JournalEventSchema>;
export type PermissionMode = z.infer<typeof PermissionModeSchema>;
