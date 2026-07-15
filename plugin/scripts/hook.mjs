#!/usr/bin/env node
import { appendFile, access, readFile } from "node:fs/promises";
import { join } from "node:path";
import { randomUUID } from "node:crypto";

const action = process.argv[2];
const input = await readStdinJson();
const cwd = typeof input.cwd === "string" ? input.cwd : process.cwd();
const stateDirectory = join(cwd, ".forge");
const statePath = join(stateDirectory, "PROJECT_STATE.json");
const journalPath = join(stateDirectory, "SESSION_JOURNAL.jsonl");

if (action === "pre-tool-security") {
  const command = typeof input.tool_input?.command === "string" ? input.tool_input.command : "";
  const reason = blockedReason(command);
  if (reason) {
    process.stderr.write(`A2Z FORGE blocked command: ${reason}\n`);
    process.exit(2);
  }
  process.exit(0);
}

if (!(await exists(statePath))) process.exit(0);

if (action === "session-start") {
  const state = JSON.parse(await readFile(statePath, "utf8"));
  process.stdout.write(JSON.stringify({
    hookSpecificOutput: {
      hookEventName: "SessionStart",
      additionalContext: `A2Z FORGE project ${state.productName ?? "unknown"} is at milestone ${state.milestone ?? "unknown"}. Run forge-recover before mutation if the prior session ended unexpectedly.`,
    },
  }));
  process.exit(0);
}

const eventType = {
  "post-edit": "project.updated",
  "pre-compact": "checkpoint.created",
  "session-end": "session.stopped",
}[action];

if (eventType) {
  const sequence = await nextSequence(journalPath);
  const event = {
    schemaVersion: 1,
    sequence,
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
    type: eventType,
    actor: "claude-hook",
    payload: { hookEvent: input.hook_event_name ?? action },
  };
  await appendFile(journalPath, `${JSON.stringify(event)}\n`, { encoding: "utf8", mode: 0o600 });
}

async function readStdinJson() {
  let data = "";
  for await (const chunk of process.stdin) data += chunk;
  if (!data.trim()) return {};
  try { return JSON.parse(data); } catch { return {}; }
}

async function exists(path) {
  try { await access(path); return true; } catch { return false; }
}

async function nextSequence(path) {
  if (!(await exists(path))) return 1;
  const lines = (await readFile(path, "utf8")).trim().split("\n").filter(Boolean);
  for (let index = lines.length - 1; index >= 0; index -= 1) {
    try { return Number(JSON.parse(lines[index]).sequence ?? 0) + 1; } catch { continue; }
  }
  return 1;
}

function blockedReason(command) {
  const rules = [
    [/\brm\s+-[^\n]*r[^\n]*f[^\n]*\s+(\/|~|\$HOME)(\s|$)/i, "recursive deletion of a home or root path"],
    [/\bgit\s+reset\s+--hard\b/i, "destructive Git reset"],
    [/\bgit\s+clean\s+-[^\n]*f/i, "destructive Git clean"],
    [/\b(curl|wget)\b[^\n|]*\|\s*(sh|bash|zsh)\b/i, "unverified network content piped to a shell"],
    [/\bchmod\s+-R\s+777\b/i, "recursive world-writable permissions"],
  ];
  return rules.find(([pattern]) => pattern.test(command))?.[1];
}
