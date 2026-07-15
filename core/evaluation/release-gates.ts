import type { Finding } from "./findings.js";
import { validReleaseBlocker } from "./findings.js";

export type GateResult = {
  id: string;
  required: boolean;
  passed: boolean;
  evidence: string[];
  waiver?: string;
};

export type ReleaseDecision = {
  ready: boolean;
  blockers: string[];
  waived: string[];
};

export function evaluateRelease(gates: GateResult[], findings: Finding[]): ReleaseDecision {
  const blockers = [
    ...gates.filter((gate) => gate.required && !gate.passed && !gate.waiver).map((gate) => `gate:${gate.id}`),
    ...findings.filter(validReleaseBlocker).map((finding) => `finding:${finding.id}`),
  ];
  const unverifiablePasses = gates.filter((gate) => gate.required && gate.passed && gate.evidence.length === 0).map((gate) => `gate:${gate.id}:missing-evidence`);
  blockers.push(...unverifiablePasses);
  return {
    ready: blockers.length === 0,
    blockers,
    waived: gates.filter((gate) => Boolean(gate.waiver)).map((gate) => `gate:${gate.id}:${gate.waiver}`),
  };
}
