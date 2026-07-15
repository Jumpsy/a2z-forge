import { access } from "node:fs/promises";
import { dirname } from "node:path";
import { StateStore } from "../state-store.js";
import { ProjectStateSchema, type JournalEvent, type ProjectState } from "../shared/schemas.js";

export async function recoverProject(projectRoot: string): Promise<ProjectState> {
  const store = new StateStore(projectRoot);
  await access(store.statePath);
  const snapshot = await store.readSnapshot();
  const journal = await store.readJournal();
  const eventsToReplay = journal.filter(({ sequence }) => sequence > snapshot.lastJournalSequence);
  const replayed = eventsToReplay.reduce(reduceEvent, snapshot);
  const latestSequence = journal.at(-1)?.sequence ?? snapshot.lastJournalSequence;
  const recovered = ProjectStateSchema.parse({
    ...replayed,
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

export function reduceEvent(state: ProjectState, event: JournalEvent): ProjectState {
  switch (event.type) {
    case "project.updated": {
      const patch = event.payload.statePatch;
      return patch && typeof patch === "object" && !Array.isArray(patch)
        ? ProjectStateSchema.parse({ ...state, ...patch, projectId: state.projectId })
        : state;
    }
    case "task.created": {
      const task = event.payload.task;
      return task ? ProjectStateSchema.parse({ ...state, tasks: [...state.tasks, task] }) : state;
    }
    case "task.updated": {
      const taskId = event.payload.taskId;
      const patch = event.payload.patch;
      if (typeof taskId !== "string" || !patch || typeof patch !== "object" || Array.isArray(patch)) return state;
      return ProjectStateSchema.parse({ ...state, tasks: state.tasks.map((task) => task.id === taskId ? { ...task, ...patch, id: task.id } : task) });
    }
    case "agent.updated": {
      const agent = event.payload.agent;
      if (!agent || typeof agent !== "object" || Array.isArray(agent) || !("id" in agent) || typeof agent.id !== "string") return state;
      const agentId = agent.id;
      return ProjectStateSchema.parse({ ...state, agents: [...state.agents.filter(({ id }) => id !== agentId), agent] });
    }
    case "finding.recorded":
      return event.payload.finding ? ProjectStateSchema.parse({ ...state, findings: [...state.findings, event.payload.finding] }) : state;
    case "evidence.recorded":
      return event.payload.evidence ? ProjectStateSchema.parse({ ...state, evidence: [...state.evidence, event.payload.evidence] }) : state;
    default:
      return state;
  }
}
