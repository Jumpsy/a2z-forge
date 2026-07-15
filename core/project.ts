import { randomUUID } from "node:crypto";
import { basename } from "node:path";
import { ProjectStateSchema, type PermissionMode, type ProjectState, type Task } from "./shared/schemas.js";

export function createProjectState(input: {
  projectRoot: string;
  idea: string;
  productName?: string;
  permissionMode?: PermissionMode;
}): ProjectState {
  const now = new Date().toISOString();
  const tasks = initialTasks(now);
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
    tasks,
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

function initialTasks(now: string): Task[] {
  const make = (input: {
    id: string;
    title: string;
    objective: string;
    dependencies?: string[];
    priority: number;
    outputs: string[];
    acceptanceCriteria: string[];
    risk?: Task["risk"];
  }): Task => ({
    ...input,
    dependencies: input.dependencies ?? [],
    status: input.dependencies?.length ? "pending" : "ready",
    inputs: [],
    estimatedUsage: 1,
    actualUsage: 0,
    risk: input.risk ?? "low",
    attemptCount: 0,
    relatedCommits: [],
    relatedDecisions: [],
    blockingIssues: [],
    resumeInstructions: `Run /a2z-forge:forge-${input.id} or assign the ${input.id} task to a compatible agent.`,
    createdAt: now,
    updatedAt: now,
  });

  return [
    make({ id: "intake", title: "Resolve material product constraints", objective: "Capture founder, problem, product, business, design, security, and delivery constraints without repeating known answers.", priority: 100, outputs: ["INTAKE.json"], acceptanceCriteria: ["Every material unknown is answered, safely inferred, or explicitly queued."] }),
    make({ id: "research", title: "Build the evidence base", objective: "Research the problem, market, competitors, repositories, licenses, and customer voice relevant to the initial wedge.", dependencies: ["intake"], priority: 95, outputs: ["EVIDENCE.jsonl", "MARKET_EVIDENCE.md", "COMPETITIVE_MAP.md", "LICENSE_LEDGER.md"], acceptanceCriteria: ["Every major claim records a source, date, confidence, classification, and supported decision."] }),
    make({ id: "goal", title: "Set the product goal and venture recommendation", objective: "Choose go, pivot, validate-first, or no-go and define the smallest valuable wedge.", dependencies: ["research"], priority: 95, outputs: ["GOAL.md", "GO_NO_GO.md", "SCOPE.md", "NON_GOALS.md"], acceptanceCriteria: ["Recommendation is evidence-backed and user authority is preserved."], risk: "medium" }),
    make({ id: "plan", title: "Create architecture and task graph", objective: "Select requirements-led architecture and decompose the build into dependency-safe reviewed tasks.", dependencies: ["goal"], priority: 90, outputs: ["ARCHITECTURE.md", "TASK_GRAPH.json", "TEST_STRATEGY.md"], acceptanceCriteria: ["Task graph is acyclic and each ready task has measurable acceptance criteria."], risk: "medium" }),
    make({ id: "design", title: "Establish the design constitution", objective: "Research, compare, test, and select an original accessible design direction.", dependencies: ["goal"], priority: 85, outputs: ["DESIGN_CONSTITUTION.md"], acceptanceCriteria: ["Three distinct directions were considered and the selected realistic flow has rendered evidence."], risk: "medium" }),
    make({ id: "build", title: "Implement the critical product journey", objective: "Build the smallest complete central workflow with real states and tests.", dependencies: ["plan", "design"], priority: 85, outputs: ["working product", "test evidence"], acceptanceCriteria: ["Central journey works end to end and no placeholder is reported complete."], risk: "high" }),
    make({ id: "review", title: "Run independent product and engineering review", objective: "Freeze and independently critique the product, design, security, accessibility, performance, and maintainability.", dependencies: ["build"], priority: 80, outputs: ["FINDINGS.json"], acceptanceCriteria: ["Every blocking finding is reproducible, fixed, rejected with evidence, or explicitly waived."], risk: "high" }),
    make({ id: "demo", title: "Record the truthful product demonstration", objective: "Capture the central workflow using realistic authorized data and fix defects exposed by media.", dependencies: ["review"], priority: 70, outputs: ["demo manifest", "screenshots", "walkthrough"], acceptanceCriteria: ["Demo contains only working functionality and private data is absent."] }),
    make({ id: "ship", title: "Run release gates and handoff", objective: "Verify production readiness, recovery, documentation, rollback, and founder understanding.", dependencies: ["demo"], priority: 75, outputs: ["RELEASE_REPORT.md", "RUNBOOK.md", "FOUNDER_DEBRIEF.md"], acceptanceCriteria: ["No critical blocker remains and all claims have reproducible evidence."], risk: "critical" }),
  ];
}
