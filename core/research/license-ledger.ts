import { z } from "zod";

export const ReuseDecisionSchema = z.object({
  id: z.string().min(1),
  source: z.string().url(),
  retrievedAt: z.string().datetime({ offset: true }),
  license: z.string().min(1),
  licenseSource: z.string().url(),
  intendedUse: z.string().min(1),
  decision: z.enum(["use", "fork", "extract", "idea-only", "reject"]),
  rationale: z.string().min(1),
  attributionRequired: z.boolean(),
  noticesPreserved: z.boolean(),
  verifiedBy: z.string().min(1),
});

export type ReuseDecision = z.infer<typeof ReuseDecisionSchema>;

export function canShipReuse(input: ReuseDecision): boolean {
  const decision = ReuseDecisionSchema.parse(input);
  if (decision.decision === "reject" || decision.decision === "idea-only") return true;
  if (["UNKNOWN", "NONE", "UNLICENSED"].includes(decision.license.toUpperCase())) return false;
  return !decision.attributionRequired || decision.noticesPreserved;
}
