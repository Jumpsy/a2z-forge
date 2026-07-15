#!/usr/bin/env node
import { access, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { spawn } from "node:child_process";
import { createProjectState } from "../core/project.js";
import { recoverProject } from "../core/recovery/recover.js";
import { StateStore } from "../core/state-store.js";
import { TaskGraph } from "../core/task-graph/task-graph.js";
import { PermissionModeSchema } from "../core/shared/schemas.js";

const [command = "help", ...args] = process.argv.slice(2);

try {
  switch (command) {
    case "init":
      await initialize(args);
      break;
    case "status":
      await status(args);
      break;
    case "recover":
      await recover(args);
      break;
    case "checkpoint":
      await checkpoint(args);
      break;
    case "doctor":
      await doctor();
      break;
    case "help":
    case "--help":
    case "-h":
      printHelp();
      break;
    default:
      throw new Error(`Unknown command: ${command}`);
  }
} catch (error) {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
}

async function initialize(args: string[]): Promise<void> {
  const root = resolve(option(args, "--path") ?? process.cwd());
  const idea = option(args, "--idea") ?? args.filter((value) => !value.startsWith("--"))[0];
  if (!idea) throw new Error("Provide an idea with --idea \"...\"");
  const permissionMode = PermissionModeSchema.parse(option(args, "--mode") ?? "build");
  await mkdir(root, { recursive: true });
  const store = new StateStore(root);
  try {
    await access(store.statePath);
    throw new Error(`A2Z FORGE state already exists at ${store.statePath}`);
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("A2Z FORGE")) throw error;
  }
  const state = createProjectState({ projectRoot: root, idea, permissionMode });
  await store.initialize(state);
  process.stdout.write(`${JSON.stringify({ ok: true, projectId: state.projectId, statePath: store.statePath }, null, 2)}\n`);
}

async function status(args: string[]): Promise<void> {
  const root = resolve(option(args, "--path") ?? process.cwd());
  const state = await new StateStore(root).readSnapshot();
  const graph = new TaskGraph(state.tasks);
  process.stdout.write(`${JSON.stringify({
    project: state.productName,
    milestone: state.milestone,
    status: state.status,
    activeAgents: state.agents.filter((agent) => agent.status === "working"),
    completed: state.tasks.filter((task) => task.status === "completed").length,
    blocked: graph.blocked().map((task) => task.id),
    ready: graph.ready().map((task) => task.id),
    criticalPath: graph.criticalPath(),
    openBlockingFindings: state.findings.filter((finding) => finding.blocksRelease && finding.status === "open"),
    usage: state.usage,
  }, null, 2)}\n`);
}

async function recover(args: string[]): Promise<void> {
  const root = resolve(option(args, "--path") ?? process.cwd());
  const state = await recoverProject(root);
  process.stdout.write(`${JSON.stringify({ ok: true, projectId: state.projectId, lastJournalSequence: state.lastJournalSequence }, null, 2)}\n`);
}

async function checkpoint(args: string[]): Promise<void> {
  const root = resolve(option(args, "--path") ?? process.cwd());
  const store = new StateStore(root);
  const state = await store.readSnapshot();
  const event = await store.appendEvent({
    type: "checkpoint.created",
    actor: "cli",
    payload: { milestone: state.milestone, status: state.status },
  });
  await store.writeSnapshot({ ...state, updatedAt: event.timestamp, lastJournalSequence: event.sequence });
  process.stdout.write(`${JSON.stringify({ ok: true, sequence: event.sequence }, null, 2)}\n`);
}

async function doctor(): Promise<void> {
  const probes = await Promise.all([
    probe("node", ["--version"]),
    probe("git", ["--version"]),
    probe("claude", ["--version"]),
    probe("codex", ["--version"]),
    probe("opencode", ["--version"]),
    probe("ollama", ["list"]),
  ]);
  process.stdout.write(`${JSON.stringify({ ok: probes.every((probeResult) => probeResult.available), probes }, null, 2)}\n`);
}

async function probe(commandName: string, commandArgs: string[]): Promise<{ name: string; available: boolean; detail?: string }> {
  return await new Promise((complete) => {
    const child = spawn(commandName, commandArgs, { stdio: ["ignore", "pipe", "pipe"] });
    let output = "";
    child.stdout.on("data", (chunk: Buffer) => { output += chunk.toString("utf8"); });
    child.once("error", () => complete({ name: commandName, available: false }));
    child.once("close", (exitCode) => {
      const detail = output.trim().split("\n")[0];
      const failureDetail = exitCode === 0 ? detail : `installed; version probe exited ${exitCode ?? "unknown"}`;
      complete({ name: commandName, available: true, ...(failureDetail ? { detail: failureDetail } : {}) });
    });
  });
}

function option(args: string[], name: string): string | undefined {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
}

function printHelp(): void {
  process.stdout.write(`A2Z FORGE\n\nCommands:\n  init --idea <text> [--path <directory>] [--mode observe|build|connected-build|autopilot]\n  status [--path <directory>]\n  checkpoint [--path <directory>]\n  recover [--path <directory>]\n  doctor\n`);
}
