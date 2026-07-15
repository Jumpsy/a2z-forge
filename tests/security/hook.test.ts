import { spawn } from "node:child_process";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const hook = join(process.cwd(), "plugin/scripts/hook.mjs");

describe("pre-tool security hook", () => {
  it("blocks destructive root deletion", async () => {
    const result = await runHook({ tool_input: { command: "rm -rf /" } });
    expect(result.code).toBe(2);
    expect(result.stderr).toContain("recursive deletion");
  });

  it("allows scoped build commands", async () => {
    const result = await runHook({ tool_input: { command: "npm test" } });
    expect(result.code).toBe(0);
  });
});

async function runHook(input: unknown): Promise<{ code: number | null; stderr: string }> {
  return await new Promise((complete) => {
    const child = spawn(process.execPath, [hook, "pre-tool-security"]);
    let stderr = "";
    child.stderr.on("data", (chunk: Buffer) => { stderr += chunk.toString("utf8"); });
    child.once("close", (code) => complete({ code, stderr }));
    child.stdin.end(JSON.stringify(input));
  });
}
