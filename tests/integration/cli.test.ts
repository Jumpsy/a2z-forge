import { mkdtemp, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "node:child_process";
import { describe, expect, it } from "vitest";

describe("forge CLI", () => {
  it("initializes and reports a resumable product workflow", async () => {
    const root = await mkdtemp(join(tmpdir(), "forge-cli-"));
    const initialized = await run(["cli/index.ts", "init", "--path", root, "--idea", "Build a study tutor"]);
    expect(initialized.code).toBe(0);
    const status = await run(["cli/index.ts", "status", "--path", root]);
    expect(status.code).toBe(0);
    expect(JSON.parse(status.stdout)).toMatchObject({ ready: ["intake"], blocked: [] });
    expect(await readFile(join(root, ".forge", "GOAL.md"), "utf8")).toContain("Build a study tutor");
    expect(JSON.parse(await readFile(join(root, ".forge", "TASK_GRAPH.json"), "utf8")).tasks).toHaveLength(9);
  });
});

async function run(args: string[]): Promise<{ code: number | null; stdout: string; stderr: string }> {
  return await new Promise((complete) => {
    const child = spawn(join(process.cwd(), "node_modules", ".bin", "tsx"), args, { cwd: process.cwd() });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk: Buffer) => { stdout += chunk.toString("utf8"); });
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
    child.once("close", (code) => complete({ code, stdout, stderr }));
  });
}
