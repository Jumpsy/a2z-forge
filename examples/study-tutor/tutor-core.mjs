const STOP_WORDS = new Set("a an and are as at be by for from has have how i in is it its of on or that the this to was what when where which who why will with you your".split(" "));

export function parseMaterial(text) {
  const normalized = text.replace(/\r/g, "").replace(/^#+\s*/gm, "").trim();
  if (!normalized) throw new Error("The selected file does not contain readable text.");
  const sentences = normalized
    .split(/(?<=[.!?])\s+|\n{2,}/)
    .map((sentence) => sentence.replace(/\s+/g, " ").trim())
    .filter((sentence) => sentence.length >= 20);
  if (!sentences.length) throw new Error("Add at least one complete sentence so the tutor has evidence to cite.");
  return sentences.map((text, index) => ({ id: index + 1, text }));
}

export function answerQuestion(question, sentences) {
  const terms = tokenize(question);
  const ranked = sentences
    .map((sentence) => ({
      ...sentence,
      score: scoreSentence(terms, sentence.text),
    }))
    .sort((left, right) => right.score - left.score || left.id - right.id);
  const best = ranked[0];
  if (!best || best.score === 0) {
    return {
      answer: "I could not connect that question to the loaded material. Try naming a term that appears in the source.",
      citations: [],
      confidence: 0,
    };
  }
  const support = ranked.find((sentence) => sentence.id !== best.id && sentence.score > 0);
  const citations = [best, ...(support ? [support] : [])].map(({ id, text }) => ({ id, text }));
  return {
    answer: citations.map(({ text }) => text).join(" "),
    citations,
    confidence: Math.min(1, best.score / Math.max(2, terms.length)),
  };
}

export function createReviewQuestion(sentences, seed = Date.now()) {
  if (!sentences.length) throw new Error("A source is required.");
  const target = sentences[Math.abs(seed) % sentences.length];
  const terms = tokenize(target.text).filter((term) => term.length > 4);
  const answer = terms.sort((left, right) => right.length - left.length)[0];
  if (!answer) {
    return { prompt: "Which statement appears in the source?", answer: target.text, sourceId: target.id, mode: "statement" };
  }
  const pattern = new RegExp(`\\b${escapeRegex(answer)}\\b`, "i");
  return {
    prompt: target.text.replace(pattern, "________"),
    answer,
    sourceId: target.id,
    mode: "blank",
  };
}

function tokenize(value) {
  return [...new Set((value.toLowerCase().match(/[a-z0-9']+/g) ?? []).filter((term) => !STOP_WORDS.has(term) && term.length > 1))];
}

function scoreSentence(terms, sentence) {
  const sentenceTerms = new Set(tokenize(sentence));
  return terms.reduce((score, term) => score + (sentenceTerms.has(term) ? 2 : [...sentenceTerms].some((candidate) => candidate.startsWith(term) || term.startsWith(candidate)) ? 1 : 0), 0);
}

function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); }
