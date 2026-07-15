import { describe, expect, it } from "vitest";
import { TaskGraph } from "../../core/task-graph/task-graph.js";
import type { Task } from "../../core/shared/schemas.js";

const now = new Date().toISOString();
const task = (id: string, dependencies: string[] = [], estimatedUsage = 1): Task => ({
  id,
  title: id,
  objective: `Complete ${id}`,
  priority: 50,
  status: "pending",
  dependencies,
  inputs: [],
  outputs: [],
  acceptanceCriteria: [`${id} verified`],
  estimatedUsage,
  actualUsage: 0,
  risk: "low",
  attemptCount: 0,
  relatedCommits: [],
  relatedDecisions: [],
  blockingIssues: [],
  resumeInstructions: "Resume",
  createdAt: now,
  updatedAt: now,
});

describe("TaskGraph", () => {
  it("returns only dependency-satisfied work", () => {
    const first = { ...task("first"), status: "completed" as const };
    const graph = new TaskGraph([first, task("second", ["first"]), task("third", ["second"])]);
    expect(graph.ready().map(({ id }) => id)).toEqual(["second"]);
  });

  it("rejects cycles", () => {
    expect(() => new TaskGraph([task("a", ["b"]), task("b", ["a"])]))
      .toThrow("cycle");
  });

  it("computes the usage-weighted critical path", () => {
    const graph = new TaskGraph([
      task("root", [], 2),
      task("short", ["root"], 1),
      task("long", ["root"], 5),
      task("release", ["short", "long"], 1),
    ]);
    expect(graph.criticalPath()).toEqual(["root", "long", "release"]);
  });
});
