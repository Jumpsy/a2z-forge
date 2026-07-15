import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { z } from "zod";

export const SkillRecordSchema = z.object({
  name: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  capabilities: z.array(z.string()),
  inputs: z.array(z.string()),
  outputs: z.array(z.string()),
  cost: z.enum(["deterministic", "local", "hosted-low", "hosted-high", "unknown"]),
  requiredCredentials: z.array(z.string()),
  risks: z.array(z.string()),
  runtimes: z.array(z.string()),
  concurrent: z.boolean(),
  failureModes: z.array(z.string()),
  trust: z.enum(["trusted", "experimental", "disabled"]),
});

export type SkillRecord = z.infer<typeof SkillRecordSchema>;

export async function discoverSkills(roots: string[]): Promise<SkillRecord[]> {
  const records: SkillRecord[] = [];
  const seen = new Set<string>();
  for (const root of roots) {
    if (!(await isDirectory(root))) continue;
    for (const entry of await readdir(root, { withFileTypes: true })) {
      if (!entry.isDirectory() && !entry.isSymbolicLink()) continue;
      const skillPath = join(root, entry.name, "SKILL.md");
      let contents: string;
      try { contents = await readFile(skillPath, "utf8"); } catch { continue; }
      const frontmatter = parseFrontmatter(contents);
      const name = frontmatter.name || entry.name;
      if (seen.has(`${name}:${skillPath}`)) continue;
      seen.add(`${name}:${skillPath}`);
      records.push(SkillRecordSchema.parse({
        name,
        description: frontmatter.description || firstParagraph(contents) || "No description provided",
        location: skillPath,
        capabilities: inferCapabilities(name, frontmatter.description),
        inputs: [],
        outputs: [],
        cost: "unknown",
        requiredCredentials: [],
        risks: ["Skill instructions execute with the active agent's permissions; inspect before trust."],
        runtimes: ["agent-skills"],
        concurrent: true,
        failureModes: ["missing dependency", "permission denied", "tool unavailable"],
        trust: root.includes(".system") ? "trusted" : "experimental",
      }));
    }
  }
  return records;
}

function parseFrontmatter(contents: string): Record<string, string> {
  const match = contents.match(/^---\n([\s\S]*?)\n---/);
  if (!match?.[1]) return {};
  const values: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const field = line.match(/^([a-zA-Z0-9_-]+):\s*[>|-]?\s*(.*)$/);
    if (field?.[1] && field[2]) values[field[1]] = field[2].trim();
  }
  return values;
}

function firstParagraph(contents: string): string {
  return contents.replace(/^---[\s\S]*?---/, "").split(/\n\s*\n/).map((part) => part.trim()).find(Boolean) ?? "";
}

function inferCapabilities(name: string, description = ""): string[] {
  const text = `${name} ${description}`.toLowerCase();
  return ["research", "design", "frontend", "security", "testing", "video", "image", "browser", "documentation"]
    .filter((capability) => text.includes(capability));
}

async function isDirectory(path: string): Promise<boolean> {
  try { return (await stat(path)).isDirectory(); } catch { return false; }
}
