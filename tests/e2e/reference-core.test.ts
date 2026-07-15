import { describe, expect, it } from "vitest";
import { answerQuestion, createReviewQuestion, parseMaterial } from "../../examples/study-tutor/tutor-core.mjs";

describe("Marginalia tutor core", () => {
  const source = parseMaterial("Photosynthesis converts light energy into chemical energy in chloroplasts. Chlorophyll absorbs light used during the light-dependent reactions. The Calvin cycle uses carbon dioxide to build sugar molecules.");

  it("answers from the closest source and returns citations", () => {
    const result = answerQuestion("Where does photosynthesis happen?", source);
    expect(result.answer).toContain("chloroplasts");
    expect(result.citations[0]?.id).toBe(1);
  });

  it("does not invent an answer without matching evidence", () => {
    const result = answerQuestion("Who invented the telescope?", source);
    expect(result.citations).toEqual([]);
    expect(result.answer).toContain("could not connect");
  });

  it("creates a review prompt traceable to one source", () => {
    const review = createReviewQuestion(source, 0);
    expect(review.sourceId).toBe(1);
    expect(review.answer.length).toBeGreaterThan(0);
  });
});
