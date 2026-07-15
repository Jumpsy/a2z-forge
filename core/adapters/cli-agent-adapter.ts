import { randomUUID } from "node:crypto";
import { spawn } from "node:child_process";
import { access } from "node:fs/promises";
import { constants } from "node:fs";
import { delimiter, join } from "node:path";
import type { AgentAdapter, AgentCapability, AgentResult, AgentTask } from "./agent-adapter.js";

type Run = {
  status: "queued" | "running" | "completed" | "blocked" | "failed" | "stopped";
  result?: AgentResult;
  child?: ReturnType<typeof spawn>;
  task: AgentTask;
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
    return Boolean(await resolveExecutable(this.executable));
  }

  async start(task: AgentTask): Promise<{ runId: string }> {
    const runId = randomUUID();
    const run: Run = { status: "queued", task };
    this.#runs.set(runId, run);
    await this.startProcess(run, task);
    return { runId };
  }

  private async startProcess(run: Run, task: AgentTask): Promise<void> {
    const executable = await resolveExecutable(this.executable);
    if (!executable) throw new Error(`Agent executable not found: ${this.executable}`);
    run.status = "running";
    run.task = task;
    delete run.result;
    const child = spawn(executable, this.buildArguments(task), { stdio: ["ignore", "pipe", "pipe"], windowsHide: true });
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
  }

  async status(runId: string): Promise<Run["status"]> { return this.require(runId).status; }
  async result(runId: string): Promise<AgentResult | undefined> { return this.require(runId).result; }

  async stop(runId: string): Promise<void> {
    const run = this.require(runId);
    run.status = "stopped";
    run.child?.kill("SIGTERM");
  }

  async resume(runId: string, context: string): Promise<void> {
    const run = this.require(runId);
    if (run.status === "running") throw new Error(`Agent run is already active: ${runId}`);
    await this.startProcess(run, {
      ...run.task,
      constraints: [...run.task.constraints, `Resume context: ${context}`],
    });
  }

  require(runId: string): Run {
    const run = this.#runs.get(runId);
    if (!run) throw new Error(`Unknown agent run: ${runId}`);
    return run;
  }
}

async function resolveExecutable(name: string): Promise<string | undefined> {
  const extensions = process.platform === "win32"
    ? (process.env.PATHEXT ?? ".COM;.EXE;.BAT;.CMD").split(";")
    : [""];
  for (const directory of (process.env.PATH ?? "").split(delimiter)) {
    for (const extension of extensions) {
      const candidate = join(directory, process.platform === "win32" ? `${name}${extension.toLowerCase()}` : name);
      try { await access(candidate, constants.X_OK); return candidate; } catch { continue; }
    }
  }
  return undefined;
}

function sanitize(value: string): string {
  return value
    .replace(/(sk-[A-Za-z0-9_-]{8})[A-Za-z0-9_-]+/g, "$1[REDACTED]")
    .replace(/(api[_-]?key\s*[=:]\s*)\S+/gi, "$1[REDACTED]")
    .trim()
    .slice(0, 20_000);
}
