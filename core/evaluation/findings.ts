import { FindingSchema } from "../shared/schemas.js";
import type { z } from "zod";

export type Finding = z.infer<typeof FindingSchema>;

export function normalizeFindings(inputs: Finding[]): Finding[] {
  const byFingerprint = new Map<string, Finding>();
  for (const raw of inputs) {
    const finding = FindingSchema.parse(raw);
    const fingerprint = `${finding.artifact.toLowerCase()}|${finding.defect.toLowerCase().replace(/\s+/g, " ")}`;
    const existing = byFingerprint.get(fingerprint);
    if (!existing || severityRank(finding.severity) > severityRank(existing.severity) || finding.confidence > existing.confidence) {
      byFingerprint.set(fingerprint, finding);
    }
  }
  return [...byFingerprint.values()].sort((left, right) =>
    Number(right.blocksRelease) - Number(left.blocksRelease) ||
    severityRank(right.severity) - severityRank(left.severity) ||
    right.confidence - left.confidence,
  );
}

export function validReleaseBlocker(finding: Finding): boolean {
  const parsed = FindingSchema.parse(finding);
  return parsed.blocksRelease && parsed.status === "open" && ["high", "critical"].includes(parsed.severity) && parsed.confidence >= 0.7;
}

function severityRank(severity: Finding["severity"]): number {
  return ({ info: 0, low: 1, medium: 2, high: 3, critical: 4 })[severity];
}
