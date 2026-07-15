import { access } from "node:fs/promises";
import { dirname } from "node:path";
import { StateStore } from "../state-store.js";
import { ProjectStateSchema, type ProjectState } from "../shared/schemas.js";

export async function recoverProject(projectRoot: string): Promise<ProjectState> {
  const store = new StateStore(projectRoot);
  await access(store.statePath);
  const snapshot = await store.readSnapshot();
  const journal = await store.readJournal();
  const latestSequence = journal.at(-1)?.sequence ?? 0;
  const recovered = ProjectStateSchema.parse({
    ...snapshot,
    updatedAt: new Date().toISOString(),
    lastJournalSequence: latestSequence,
  });
  await store.writeSnapshot(recovered);
  await store.appendEvent({
    type: "session.recovered",
    actor: "recovery-engine",
    payload: {
      statePath: store.statePath,
      stateDirectory: dirname(store.statePath),
      journalEvents: journal.length,
    },
  });
  return recovered;
}
