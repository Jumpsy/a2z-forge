import { appendFile, mkdir, readFile } from "node:fs/promises";
import { dirname } from "node:path";
import { EvidenceSchema } from "../shared/schemas.js";
import type { z } from "zod";

export type Evidence = z.infer<typeof EvidenceSchema>;

export class EvidenceLedger {
  constructor(readonly path: string) {}

  async record(input: Evidence): Promise<Evidence> {
    const evidence = EvidenceSchema.parse(input);
    await mkdir(dirname(this.path), { recursive: true, mode: 0o700 });
    const existing = await this.read();
    if (existing.some(({ id }) => id === evidence.id)) throw new Error(`Evidence already exists: ${evidence.id}`);
    await appendFile(this.path, `${JSON.stringify(evidence)}\n`, { encoding: "utf8", mode: 0o600 });
    return evidence;
  }

  async read(): Promise<Evidence[]> {
    let contents: string;
    try { contents = await readFile(this.path, "utf8"); }
    catch (error) {
      if (error instanceof Error && "code" in error && error.code === "ENOENT") return [];
      throw error;
    }
    return contents.split("\n").filter(Boolean).map((line, index) => {
      try { return EvidenceSchema.parse(JSON.parse(line)); }
      catch (error) { throw new Error(`Invalid evidence record at line ${index + 1}`, { cause: error }); }
    });
  }

  async supporting(decisionId: string): Promise<Evidence[]> {
    return (await this.read()).filter(({ supports }) => supports.includes(decisionId));
  }
}
