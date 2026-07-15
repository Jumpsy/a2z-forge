import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import type { AgentAdapter, AgentCapability, AgentResult, AgentTask } from "./agent-adapter.js";

type Run = {
  status: "queued" | "running" | "completed" | "blocked" | "failed" | "stopped";
  result?: AgentResult;
  child?: ReturnType<typeof spawn>;
};

export class CliAgentAdapter implements AgentAdapter {
  readonly capabilities: ReadonlySet<AgentCapability>;
  readonly #runs = new Map<string, Run>();

  constructor(
    readonly id: string,
    readonly executable: string,
    capabilities: AgentCapability[],
    readonly buildArguments: (task: AgentTask) => string[],
  ) {
    this.capabilities = new Set(capabilities);
  }

  async available(): Promise<boolean> {
    const paths = (process.env.PATH ?? "").split(":");
    return (await Promise.all(paths.map(async (path) => {
      try { await access(`${path}/${this.executable}`, constants.X_OK); return true; } catch { return false; }
    }))).some(Boolean);
  }

  async start(task: AgentTask): Promise<{ runId: string }> {
    const runId = randomUUID();
    const run: Run = { status: "running" };
    this.#runs.set(runId, run);
    const child = spawn(this.executable, this.buildArguments(task), { stdio: ["ignore", "pipe", "pipe"] });
    run.child = child;
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
    child.once("error", (error) => {
      run.status = "failed";
      run.result = { taskId: task.taskId, status: "failed", summary: error.message, artifacts: [], checks: [] };
    });
    child.once("close", (code) => {
      if (run.status === "stopped") return;
      run.status = code === 0 ? "completed" : "failed";
      run.result = {
        taskId: task.taskId,
        status: code === 0 ? "completed" : "failed",
        summary: sanitize(stdout || stderr || `Process exited ${code ?? "unknown"}`),
        artifacts: [],
        checks: [{ command: this.executable, exitCode: code ?? -1, summary: code === 0 ? "Process completed" : "Process failed" }],
      };
    });
    return { runId };
  }

  async status(runId: string): Promise<Run["status"]> { return this.require(runId).status; }
  async result(runId: string): Promise<AgentResult | undefined> { return this.require(runId).result; }

  async stop(runId: string): Promise<void> {
    const run = this.require(runId);
    run.status = "stopped";
    run.child?.kill("SIGTERM");
  }

  async resume(): Promise<void> {
    throw new Error(`${this.id} adapter does not support in-process resume; create a new task with resume context`);
  }

  require(runId: string): Run {
    const run = this.#runs.get(runId);
    if (!run) throw new Error(`Unknown agent run: ${runId}`);
    return run;
  }
}

function sanitize(value: string): string {
  return value
    .replace(/(sk-[A-Za-z0-9_-]{8})[A-Za-z0-9_-]+/g, "$1[REDACTED]")
    .replace(/(api[_-]?key\s*[=:]\s*)\S+/gi, "$1[REDACTED]")
    .trim()
    .slice(0, 20_000);
}
