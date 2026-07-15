import { appendFile, mkdir, open, readFile, rename, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import { randomUUID } from "node:crypto";
import {
  JournalEventSchema,
  ProjectStateSchema,
  type JournalEvent,
  type ProjectState,
} from "./shared/schemas.js";

const STATE_DIRECTORY = ".forge";
const STATE_FILE = "PROJECT_STATE.json";
const JOURNAL_FILE = "SESSION_JOURNAL.jsonl";

export class StateStore {
  readonly directory: string;
  readonly statePath: string;
  readonly journalPath: string;

  constructor(projectRoot: string) {
    this.directory = join(projectRoot, STATE_DIRECTORY);
    this.statePath = join(this.directory, STATE_FILE);
    this.journalPath = join(this.directory, JOURNAL_FILE);
  }

  async initialize(state: ProjectState): Promise<void> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    await this.writeSnapshot(state);
    await this.appendEvent({
      type: "project.created",
      actor: "co-founder",
      payload: { projectId: state.projectId, productName: state.productName },
    });
  }

  async readSnapshot(): Promise<ProjectState> {
    const contents = await readFile(this.statePath, "utf8");
    return ProjectStateSchema.parse(JSON.parse(contents));
  }

  async writeSnapshot(state: ProjectState): Promise<void> {
    const validated = ProjectStateSchema.parse(state);
    await mkdir(dirname(this.statePath), { recursive: true, mode: 0o700 });
    const temporary = `${this.statePath}.${process.pid}.${randomUUID()}.tmp`;
    const handle = await open(temporary, "wx", 0o600);
    try {
      await handle.writeFile(`${JSON.stringify(validated, null, 2)}\n`, "utf8");
      await handle.sync();
    } finally {
      await handle.close();
    }
    await rename(temporary, this.statePath);
  }

  async appendEvent(input: Omit<JournalEvent, "schemaVersion" | "sequence" | "eventId" | "timestamp">): Promise<JournalEvent> {
    await mkdir(this.directory, { recursive: true, mode: 0o700 });
    const events = await this.readJournal();
    const event = JournalEventSchema.parse({
      ...input,
      schemaVersion: 1,
      sequence: (events.at(-1)?.sequence ?? 0) + 1,
      eventId: randomUUID(),
      timestamp: new Date().toISOString(),
    });
    await appendFile(this.journalPath, `${JSON.stringify(event)}\n`, { encoding: "utf8", mode: 0o600 });
    return event;
  }

  async readJournal(): Promise<JournalEvent[]> {
    let contents: string;
    try {
      contents = await readFile(this.journalPath, "utf8");
    } catch (error) {
      if (isMissingFile(error)) return [];
      throw error;
    }

    const events: JournalEvent[] = [];
    for (const [index, line] of contents.split("\n").entries()) {
      if (!line.trim()) continue;
      try {
        events.push(JournalEventSchema.parse(JSON.parse(line)));
      } catch (error) {
        const isFinalLine = index === contents.trimEnd().split("\n").length - 1;
        if (isFinalLine) break;
        throw new Error(`Journal corruption before final line ${index + 1}`, { cause: error });
      }
    }
    return events;
  }

  async removeTemporarySnapshots(): Promise<void> {
    await rm(`${this.statePath}.tmp`, { force: true });
  }
}

function isMissingFile(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error && error.code === "ENOENT";
}
