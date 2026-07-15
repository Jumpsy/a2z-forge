export type SourcePassage = { id: number; text: string };
export type TutorAnswer = {
  answer: string;
  citations: SourcePassage[];
  confidence: number;
};
export type ReviewQuestion = {
  prompt: string;
  answer: string;
  sourceId: number;
  mode: "blank" | "statement";
};

export function parseMaterial(text: string): SourcePassage[];
export function answerQuestion(question: string, sentences: SourcePassage[]): TutorAnswer;
export function createReviewQuestion(sentences: SourcePassage[], seed?: number): ReviewQuestion;
