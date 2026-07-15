import { access, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { createProjectState } from "../../core/project.js";
import { recoverProject } from "../../core/recovery/recover.js";
import { StateStore } from "../../core/state-store.js";

describe("StateStore recovery", () => {
  it("keeps the last valid snapshot when a temporary write is interrupted", async () => {
    const root = await mkdtemp(join(tmpdir(), "a2z-forge-"));
    const store = new StateStore(root);
    const state = createProjectState({ projectRoot: root, idea: "Build a recovery test" });
    await store.initialize(state);
    await writeFile(`${store.statePath}.interrupted.tmp`, "{", "utf8");

    const recovered = await recoverProject(root);
    expect(recovered.projectId).toBe(state.projectId);
    expect(recovered.lastJournalSequence).toBeGreaterThan(0);
    expect(JSON.parse(await readFile(store.statePath, "utf8"))).toMatchObject({ projectId: state.projectId });
  });

  it("ignores a torn final journal line", async () => {
    const root = await mkdtemp(join(tmpdir(), "a2z-forge-"));
    const store = new StateStore(root);
    const state = createProjectState({ projectRoot: root, idea: "Build a journal test" });
    await store.initialize(state);
    const valid = await store.readJournal();
    await writeFile(store.journalPath, `${JSON.stringify(valid[0])}\n{\"partial\":`, "utf8");
    await expect(store.readJournal()).resolves.toHaveLength(1);
  });

  it("replays state-changing task events", async () => {
    const root = await mkdtemp(join(tmpdir(), "a2z-forge-"));
    const store = new StateStore(root);
    const state = createProjectState({ projectRoot: root, idea: "Build replay" });
    await store.initialize(state);
    await store.appendEvent({ type: "task.updated", actor: "test", payload: { taskId: "intake", patch: { status: "completed" } } });
    const recovered = await recoverProject(root);
    expect(recovered.tasks.find(({ id }) => id === "intake")?.status).toBe("completed");
  });

  it("removes randomized interrupted snapshots", async () => {
    const root = await mkdtemp(join(tmpdir(), "a2z-forge-"));
    const store = new StateStore(root);
    const state = createProjectState({ projectRoot: root, idea: "Build cleanup" });
    await store.initialize(state);
    const temporary = `${store.statePath}.1234.deadbeef.tmp`;
    await writeFile(temporary, "{", "utf8");
    await store.removeTemporarySnapshots();
    await expect(access(temporary)).rejects.toMatchObject({ code: "ENOENT" });
  });
});
