import { describe, expect, it } from "vitest";
import { canShipReuse } from "../../core/research/license-ledger.js";
import { evaluateRelease } from "../../core/evaluation/release-gates.js";
import type { Finding } from "../../core/evaluation/findings.js";

const finding = (overrides: Partial<Finding> = {}): Finding => ({
  id: "auth-1",
  artifact: "api/account",
  defect: "Missing ownership check",
  evidence: "A second user can retrieve the record in the integration test.",
  severity: "critical",
  impact: "Private data disclosure",
  fix: "Check owner id in the database query.",
  verification: "Run the cross-account permission test.",
  confidence: 0.99,
  blocksRelease: true,
  status: "open",
  ...overrides,
});

describe("release evidence", () => {
  it("blocks release on a critical evidence-backed finding", () => {
    const decision = evaluateRelease([{ id: "central-journey", required: true, passed: true, evidence: ["tests/e2e.log"] }], [finding()]);
    expect(decision.ready).toBe(false);
    expect(decision.blockers).toContain("finding:auth-1");
  });

  it("rejects a pass that has no evidence", () => {
    expect(evaluateRelease([{ id: "security", required: true, passed: true, evidence: [] }], []).blockers)
      .toContain("gate:security:missing-evidence");
  });

  it("rejects unlicensed code reuse", () => {
    expect(canShipReuse({
      id: "repo-1",
      source: "https://example.com/repo",
      retrievedAt: new Date().toISOString(),
      license: "UNKNOWN",
      licenseSource: "https://example.com/repo/license",
      intendedUse: "Copy a component",
      decision: "extract",
      rationale: "Potentially useful",
      attributionRequired: false,
      noticesPreserved: false,
      verifiedBy: "repository-researcher",
    })).toBe(false);
  });
});
